# Performance Skateshop — guía de estudio del código

Documento de referencia para entender el proyecto de punta a punta: qué hace cada capa,
por qué está así y cómo verificarlo con las manos.

- **Frontend:** SPA React 19 + Vite 8 + React Router 7, pruebas con Vitest.
- **Backend:** Spring Boot 3.3.5 + Spring Security + JWT (JJWT 0.12.6) + BCrypt + JPA/H2.
- **Rama de referencia:** `feat/seguridad-jwt-integracion`.

---

## 1. Arquitectura general

```
Navegador (React en :5173)
   │  fetch + "Authorization: Bearer <jwt>"
   ▼
Spring Boot (:8080)  /api/v1/*
   │
   ├─ JwtAuthenticationFilter  → valida el token y carga el usuario
   ├─ SecurityConfig           → matriz de roles (401 / 403 en JSON)
   └─ Controller → Service → Repository (JPA) → H2 (en memoria)
```

Dos ideas sostienen todo el diseño:

1. **El backend es la única fuente de verdad.** El catálogo, las boletas y los usuarios
   viven en la base. El frontend no guarda datos de negocio: solo guarda el token y el
   usuario de sesión para no pedirlos en cada render.
2. **La sesión es stateless.** No hay sesión HTTP ni cookies: cada request se autentica
   con el JWT que viaja en el header `Authorization`.

---

## 2. Puesta en marcha y verificación

### Levantar

```bash
# backend
cd backend
mvn spring-boot:run          # http://localhost:8080

# frontend (otra terminal, en la raíz)
npm install
npm run dev                  # http://localhost:5173
```

### Verificar que las tres piezas están conectadas

```bash
# 1. backend vivo + base de datos con datos
curl -s localhost:8080/api/v1/productos | head -c 200

# 2. autenticación funcionando
curl -s -X POST localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@performance.cl","password":"admin123"}'

# 3. CORS permitiendo el origen del frontend
curl -i -X OPTIONS localhost:8080/api/v1/productos \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" | grep -i access-control
```

En el navegador: F12 → **Network** → cualquier acción debe mostrar requests a
`localhost:8080/api/v1/...`. Si no aparece ninguno, el frontend no está hablando con el backend.

### Pruebas

```bash
npm test                     # 37 pruebas de frontend
cd backend && mvn test       # 22 pruebas de integración
npm run build                # build de producción
```

---

## 3. Backend

### 3.1 Capas

```
controller/   reciben HTTP, validan entrada, devuelven ResponseEntity
service/      reglas de negocio (@Transactional)
repository/   consultas JPA
model/        entidades
dto/          contratos de entrada/salida (login, registro, boleta)
security/     JWT, filtro, UserDetails
config/       SecurityConfig, CORS, OpenAPI
```

Regla de oro: el controlador **no** contiene reglas de negocio. Por ejemplo, el descuento
de stock y el cálculo del total viven en `BoletaService`.

### 3.2 Autenticación (login)

1. `POST /api/v1/auth/login` con `{email, password}`.
2. `AuthController` delega en `AuthenticationManager.authenticate(...)`, que usa
   `UsuarioDetailsService` para cargar el usuario y `BCryptPasswordEncoder` para comparar.
3. Si las credenciales son inválidas → `401 {"error":"Credenciales incorrectas..."}`.
4. Si son válidas → `JwtService.generarToken(usuario)` y respuesta `200 {token, usuario}`.

`AuthController` devuelve el usuario **sin** el campo `password`: la entidad lo declara
`@JsonProperty(access = WRITE_ONLY)`.

### 3.3 El token (JWT HS256)

```java
Jwts.builder()
    .subject(usuario.getEmail())          // el email es el "username"
    .claim("uid", usuario.getId())
    .claim("rol", usuario.getRol().name()) // ADMINISTRADOR | VENDEDOR | CLIENTE
    .issuedAt(ahora)
    .expiration(ahora + expirationMinutes)
    .signWith(key)
    .compact();
```

- Firma HMAC-SHA256 con `app.jwt.secret` (Base64).
- **Sin `JWT_SECRET` configurado se genera una clave efímera**: la app arranca, pero los
  tokens mueren al reiniciar. Es deliberado: nunca se commitea una clave de firma.
- En producción: `export JWT_SECRET=<base64 de 32+ bytes>`.

### 3.4 El filtro por request

`JwtAuthenticationFilter` (extiende `OncePerRequestFilter`):

1. Lee `Authorization: Bearer <token>`.
2. `JwtService.extraerEmail(token)` valida firma y expiración.
3. `UsuarioDetailsService.loadUserByUsername(email)` trae el usuario fresco de la base.
4. Arma un `UsernamePasswordAuthenticationToken` y lo pone en el `SecurityContextHolder`.
5. Si algo falla, limpia el contexto y **sigue** sin autenticación (la decisión la toma
   la matriz de roles, no el filtro).

`UsuarioPrincipal` adapta la entidad `Usuario` a `UserDetails` y expone la autoridad
`ROLE_<rol>`. Por eso el config usa `hasRole("ADMINISTRADOR")` (Spring agrega el prefijo).

### 3.5 Matriz de autorización

| Método y ruta | Quién |
| --- | --- |
| `OPTIONS /**` | público (preflight CORS) |
| `POST /auth/**` | público |
| `GET /productos/**`, `GET /categorias/**` | público |
| `GET /boletas/mias`, `POST /boletas` | CLIENTE, ADMINISTRADOR |
| `GET /boletas/**` | ADMINISTRADOR, VENDEDOR |
| `/usuarios/**` | ADMINISTRADOR |
| `POST/PUT/PATCH/DELETE /productos/**`, `/categorias/**` | ADMINISTRADOR |
| cualquier otra ruta | autenticado |

Respuestas de error, siempre JSON:

- **401** `{"error":"No autenticado o token inválido"}`
- **403** `{"error":"Acceso denegado para el rol actual"}`

**Detalle fino:** `GET /boletas/mias` está declarado **antes** que `GET /boletas/**`.
Spring evalúa las reglas en orden y gana la primera que coincide; si el orden se invierte,
un CLIENTE recibe 403 al pedir sus propias boletas.

### 3.6 Flujo de compra (`BoletaService.crearBoleta`)

1. Rechaza un carrito vacío (`IllegalArgumentException` → 400).
2. Genera `numeroBoleta = "BOL-" + UUID` (UUID, no timestamp: dos compras en el mismo
   milisegundo colisionaban contra la columna `unique`).
3. Por cada ítem:
   - busca el producto con **`findByIdForUpdate`** (`@Lock(PESSIMISTIC_WRITE)`), lo que
     serializa las compras concurrentes del mismo producto;
   - valida `cantidad > 0`;
   - valida stock suficiente;
   - descuenta stock y guarda.
4. Suma subtotales, setea `total` y persiste la boleta con sus detalles.

El bloqueo pesimista es la pieza que evita **sobreventa**: sin él, dos compras simultáneas
de la última unidad podían pasar ambas el chequeo de stock.

### 3.7 Contraseñas

- `UsuarioService.guardar()` y `actualizar()` aplican `passwordEncoder.encode(...)`.
- BCrypt con costo 10 (`$2a$10$...`).
- `data.sql` trae hashes ya generados para los usuarios demo.

---

## 4. Frontend

### 4.1 `src/services/api.js` — la única puerta al backend

```js
export const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1';

export async function apiFetch(endpoint, options = {}) {
    // arma URL, agrega Content-Type y Authorization: Bearer <token>,
    // y normaliza la respuesta (ok / status / datos)
}
```

- `VITE_API_URL` permite apuntar a otro backend sin tocar código.
- El token se lee de `localStorage` en cada request (`getToken()`), así no hay que
  pasarlo por props ni por contexto a las páginas.
- Las funciones exportadas son el contrato: `getProductos`, `crearBoleta`, `getUsuarios`,
  `reponerStock`, etc. Ninguna página llama `fetch` directamente.

### 4.2 Sesión (`Contexto_sesion.jsx`)

- Estado `usuario` y `token`, inicializados desde `localStorage`.
- `iniciarSesion(email, password)` → `validarCredenciales` (`auth.js`) → `login` (`api.js`).
- Si sale bien, persiste token + usuario y actualiza el estado.
- `cerrarSesion()` limpia ambos.
- `useSesion()` devuelve un contexto por defecto si se usa fuera del proveedor, para que
  los componentes no exploten en pruebas aisladas.

### 4.3 Carrito (`Contexto_carrito.jsx`)

- El carrito **sí** se persiste en `localStorage` (es estado de UI, no dato de negocio).
- Al agregar, valida stock contra la API.
- Normaliza `id` a `Number` al leer `localStorage`, porque las claves vuelven como string
  y las comparaciones con los ids de la API fallaban.

### 4.4 Control de acceso en la UI

| Componente | Qué hace |
| --- | --- |
| `RutaAdmin` | Sin sesión → `/login`. Rol CLIENTE → `/`. ADMINISTRADOR y VENDEDOR pasan. |
| `SidebarAdmin` | Oculta "Gestión de usuarios" si el rol no es administrador. |
| `Navbar` | Muestra login/registro o el menú del usuario según haya sesión. |

**Importante para estudiar:** esto es UX, no seguridad. Ocultar un link no protege nada;
la protección real está en `SecurityConfig`. Si alguien escribe `/admin/usuarios` a mano,
el backend responde 403 y la página muestra el error.

### 4.5 Mapeos de contrato (backend ↔ UI)

| Backend | Frontend |
| --- | --- |
| `categoria: {id, nombre, descripcion}` | string para `<select>` / filtros |
| `rol: "ADMINISTRADOR" \| "VENDEDOR" \| "CLIENTE"` | etiqueta en español en la UI |
| `numeroBoleta`, `clienteNombre`, `clienteEmail`, `detalles[]` | `id`, `cliente`, `correo`, `productos[]` |

Estos mapeos viven en cada página, junto al consumo del endpoint. Es el punto más frágil
del frontend: si cambia el DTO del backend, hay que buscarlos ahí.

---

## 5. Contrato de la API

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/login` | público | Devuelve `{token, usuario}` |
| POST | `/auth/register` | público | Crea CLIENTE con password hasheada |
| GET | `/productos` | público | Lista; acepta `?categoria=Nombre` |
| GET | `/productos/{id}` | público | Detalle por id numérico |
| GET | `/productos/codigo/{codigo}` | público | Detalle por slug |
| GET | `/productos/ofertas` | público | Solo ofertas |
| GET | `/productos/criticos?limite=5` | público | Stock bajo |
| POST/PUT/DELETE | `/productos...` | ADMINISTRADOR | CRUD de catálogo |
| PATCH | `/productos/{id}/reponer-stock?cantidad=N` | ADMINISTRADOR | Suma stock |
| GET | `/categorias` | público | Lista de categorías |
| POST/PUT/DELETE | `/categorias...` | ADMINISTRADOR | CRUD de categorías |
| POST | `/boletas` | CLIENTE, ADMINISTRADOR | Crea la compra y descuenta stock |
| GET | `/boletas` | ADMINISTRADOR, VENDEDOR | Todas las boletas |
| GET | `/boletas/{id}` | ADMINISTRADOR, VENDEDOR | Detalle |
| GET | `/boletas/mias` | CLIENTE, ADMINISTRADOR | Solo las propias |
| GET/POST/PUT/DELETE | `/usuarios...` | ADMINISTRADOR | Gestión de usuarios |

---

## 6. Datos de demostración

`backend/src/main/resources/data.sql` (H2 en memoria, se recarga en cada arranque):

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@performance.cl` | `admin123` |
| Vendedor | `vendedor@performance.cl` | `vendedor123` |
| Cliente | `cliente@correo.cl` | `cliente123` |

El archivo **no** declara ids explícitos: los genera la columna `IDENTITY`. Insertar ids a
mano no avanza la secuencia y el siguiente alta choca contra la PK 1.

Consola H2 (solo desarrollo): `http://localhost:8080/h2-console`, JDBC `jdbc:h2:mem:skateshopdb`.

---

## 7. Pruebas

### Backend — `SecurityIntegrationTest` (22 pruebas)

Un único contexto de Spring a propósito: `spring.sql.init.mode=always` + varios contextos
sobre la misma base en memoria duplicarían las PK. Si se agrega otra clase
`@SpringBootTest`, hay que darle su propia URL (`spring.datasource.url` con UUID aleatorio,
como hace el perfil `test`).

Cubre: login válido/incorrecto/inexistente, token inválido y vencido, registro con hash
BCrypt, email duplicado, catálogo público, escritura sin token, CLIENTE/VENDEDOR sin
permiso de escritura, VENDEDOR viendo boletas pero no usuarios, aislamiento de
`/boletas/mias`, compra completa, cantidad 0 rechazada, reposición de stock y sus 403/400/404.

### Frontend — 37 pruebas

`src/configuracion_vitest.js` intercepta `fetch` global con datos demo. Permite probar las
páginas sin backend levantado. **Ojo:** el mock puede tapar un endpoint mal escrito — pasó
con `/productos/stock-critico`, que no existía en el backend y el mock sí respondía.

---

## 8. Ejercicios para estudiar

1. **Trazar una compra:** seguí `Checkout.jsx` → `crearBoleta` → `BoletaController` →
   `BoletaService` → `ProductoRepository`. Anotá en qué línea exacta se descuenta el stock.
2. **Romper el orden de la matriz:** mové `GET /boletas/mias` después de `GET /boletas/**`
   y corré `mvn test`. ¿Qué prueba falla y por qué?
3. **Provocar un 403:** logueate como vendedor y abrí `/admin/usuarios` a mano. ¿Quién
   bloquea, el frontend o el backend? Mirá la pestaña Network.
4. **Simular sobreventa:** quitá `@Lock(PESSIMISTIC_WRITE)` de `findByIdForUpdate` y
   pensá qué dos transacciones concurrentes podrían vender la misma última unidad.
5. **Rotar el secreto:** arrancá sin `JWT_SECRET`, logueate, reiniciá el backend y reusá el
   token viejo. ¿Qué status devuelve y por qué?

---

## 9. Limitaciones conocidas

- **Rutas inexistentes devuelven 401, no 404.** El `ERROR` dispatch vuelve a pasar por la
  cadena de seguridad sin contexto (stateless) y cae en `anyRequest().authenticated()`.
  No rompe la app, pero confunde al depurar.
- **`JWT_SECRET` sin definir = clave efímera.** Los tokens mueren al reiniciar.
- **H2 en memoria.** Todo se pierde al reiniciar; no hay migraciones (no hay Flyway/Liquibase).
- **HTTP sin TLS** en desarrollo y en el despliegue actual.
- **`src/services/mockStorage.js`** quedó sin uso en producción, solo lo referencian dos
  pruebas legacy.
- **Los mapeos de contrato viven en las páginas.** Un cambio de DTO obliga a revisarlas una
  por una.

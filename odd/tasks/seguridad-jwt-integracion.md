# Feature: Fase 3 (Spring Security + JWT) y Fase 4 (integración React → API)

Rama: `feat/seguridad-jwt-integracion` · Entrega: commits por unidad de trabajo · Runner: `npm test` (frontend), `mvn test` (backend).

## Specs

**S1 — Fase 3, autenticación JWT.** Texto del usuario, verbatim:
> Implementaremos la autenticación basada en tokens JWT.

Aceptación: `POST /api/v1/auth/login` con credenciales válidas devuelve un JWT firmado; con credenciales inválidas devuelve 401. El token se valida en cada request protegido y expone el rol del usuario.

**S2 — Fase 3, roles exactos.** Texto del usuario, verbatim:
> **Administrador:** Acceso total.
> **Vendedor:** Solo vista de productos y órdenes/detalle.
> **Cliente:** Solo acceso a la tienda.

Aceptación (matriz de autorización):
- Sin token: `GET /api/v1/productos`, `GET /api/v1/categorias`, `POST /api/v1/auth/login`, `POST /api/v1/auth/register` → permitido. Cualquier escritura → 401.
- `ADMINISTRADOR`: todo permitido.
- `VENDEDOR`: `GET` de productos, categorías y boletas → permitido. `POST`/`PUT`/`DELETE` de productos, categorías y usuarios → 403.
- `CLIENTE`: `GET` de productos y categorías, `POST /api/v1/boletas`, `GET /api/v1/boletas/mias` → permitido. `GET /api/v1/boletas` (todas), gestión de usuarios, productos y categorías → 403.

**S3 — Fase 3, passwords hasheadas.** Ninguna password se persiste en texto plano. `data.sql` siembra hashes BCrypt válidos para los tres usuarios demo. `data.sql` puede re-ejecutarse en cada arranque sin violar PK (H2 en memoria para desarrollo).

**S4 — Fase 4, consumo de la API.** Texto del usuario, verbatim:
> Consumiremos la API desde React usando Axios o Fetch.

Aceptación: el frontend obtiene catálogo, categorías, usuarios, boletas y sesión exclusivamente de la API REST (`fetch` nativo, sin dependencias nuevas). No queda ninguna lectura de datos de negocio desde `localStorage`.

**S5 — Fase 4, vistas por rol.** Texto del usuario, verbatim:
> Ajustaremos las vistas del frontend para que respeten los roles (ej. ocultar panel de admin al vendedor).

Aceptación: el rol que decide la UI es el que viene en el JWT, no un valor editable del cliente. `ADMINISTRADOR` entra al panel completo; `VENDEDOR` ve catálogo y pedidos pero no gestión de usuarios; `CLIENTE` no ve panel de administración. Un token vencido o ausente redirige a `/login`.

### Supuestos (marcados como supuestos, no como requisitos del usuario)

- **A1 — Contrato de login.** `POST /api/v1/auth/login` `{email, password}` → `200 {token, usuario:{id,nombre,apellidos,email,rol}}`; `401` con `{error}`. `POST /api/v1/auth/register` crea siempre rol `CLIENTE`.
- **A2 — Una sola fuente de verdad.** El frontend deja de usar `localStorage` para datos de negocio. Se mantiene solo el almacenamiento del token.
- **A3 — Vendedor de solo lectura.** Interpretación de "solo vista": lectura de productos, categorías y boletas; sin escrituras.
- **A4 — Cliente.** Catálogo de solo lectura, creación de su propia boleta y consulta de sus boletas.
- **A5 — H2 en memoria en desarrollo.** Permite que `data.sql` corra limpio en cada arranque. MySQL queda documentado como alternativa (bloque ya comentado en `application.properties`).

## Tasks

| ID | Qué | Specs | Ruta | Estado | Commit |
| --- | --- | --- | --- | --- | --- |
| T1 | Dependencias (security, jjwt) + `application.properties` (secret, H2 mem, sin show-sql) + hashes BCrypt en `data.sql` | S3 | inline | pendiente | — |
| T2 | `JwtService`, `JwtAuthenticationFilter`, `SecurityConfig`, `UserDetailsService`, `PasswordEncoder` | S1, S2 | inline | pendiente | — |
| T3 | `AuthController` + DTOs (`login`, `register`) + `/boletas/mias` | S1, S2 | inline | pendiente | — |
| T4 | Tests backend: login ok/401, matriz de roles, JWT inválido/vencido | S1, S2, S3 | inline | pendiente | — |
| T5 | `src/services/api.js` (fetch + token) y sesión contra JWT | S4 | delegado | pendiente | — |
| T6 | Capa de datos frontend contra API (productos, categorías, usuarios, boletas) | S4 | delegado | pendiente | — |
| T7 | UI por rol + tests frontend con fetch mockeado | S5 | delegado | pendiente | — |

## Log

**L1 — Pedido original del usuario, verbatim:**

> Plan de Acción del Proyecto
>
> 1. *Fase 1: Configuración y Modelamiento de Datos**
> * Crearemos el proyecto en Spring Boot con dependencias de BD (MySQL o H2), Spring Web, y JPA.
> * Construiremos las entidades basadas en el modelo requerido: `USUARIO`, `BOLETA`, `DETALLE_BOLETA`, `PRODUCTO` y `CATEGORIA`.
> * Crearemos los repositorios JPA para interactuar con la base de datos.
>
> 2. **Fase 2: Lógica de Negocio y API REST (con Versionado y Swagger)**
> * Crearemos los Servicios para encapsular la lógica.
> * Diseñaremos los Controladores REST aplicando buenas prácticas, incluyendo versionado en las rutas (ej. `/api/v1/productos`).
> * Configuraremos Swagger/OpenAPI para documentar todos los endpoints.
>
> 3. **Fase 3: Seguridad con Spring Security y JWT**
> * Implementaremos la autenticación basada en tokens JWT.
> * Configuraremos los roles exactos que pide el sistema:
> * **Administrador:** Acceso total.
> * **Vendedor:** Solo vista de productos y órdenes/detalle.
> * **Cliente:** Solo acceso a la tienda.
>
> 4. **Fase 4: Integración con Frontend (React)**
> * Consumiremos la API desde React usando Axios o Fetch.
> * Ajustaremos las vistas del frontend para que respeten los roles (ej. ocultar panel de admin al vendedor).
>
> 5. **Fase 5: Documentación y Entregables**
> * Preparación del documento ERS, Manual de Usuario y Documentación de Integración.
> * Subida a GitHub con commits claros.
>
> yo devia hacer la 3 y 4

**L2 — Modo de trabajo.** El usuario eligió "Implemento yo el código" (implementación completa, con tests y commits). Registrado el 2026-11-21.

**L3 — Diagnóstico previo.** Fases 1 y 2 ya están en `backend/` (entidades, repositorios, servicios, controladores `/api/v1`, Swagger). El enum `Rol` ya trae los tres roles y `data.sql` siembra un usuario por rol. Falta todo de Fase 3 y Fase 4.

**L4 — Hallazgos que condicionan la Fase 3.**
1. `data.sql` guarda passwords en texto plano; al introducir BCrypt hay que sembrar hashes válidos o el login demo se rompe.
2. `spring.sql.init.mode=always` + `ddl-auto=update` + H2 en archivo persistente ⇒ el segundo arranque falla por PK duplicada. Se resuelve con H2 en memoria en desarrollo (A5).
3. El frontend usa hoy el rol `'Administrador'`/`'Cliente'`; el backend usa el enum `ADMINISTRADOR`/`CLIENTE`. El contrato A1 unifica en el enum del backend.

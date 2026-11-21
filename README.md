# Performance Skateshop

Tienda de skateboarding: **frontend** (React 19 + Vite 8) + **backend** (Spring Boot 3.3.5) con **autenticación JWT** (HS256, BCrypt, matriz de roles ADMINISTRADOR / VENDEDOR / CLIENTE). El frontend consume la API REST vía `fetch` nativo (`src/services/api.js`).

## Stack

- React 19 + React Router 7 (frontend)
- Vite 8
- Vitest + Testing Library (frontend)
- Oxlint
- Spring Boot 3.3.5 + Spring Security + JWT (JJWT 0.12.6) + BCrypt (backend)
- H2 en memoria (desarrollo) — MySQL/MariaDB para producción (bloque alternativo en `application.properties`)
- Terraform 1.6+ para el despliegue en AWS (carpeta `infra/`)

## Requisitos

- Node.js 20 o superior, npm
- Java 17 + Maven 3 (backend)

## Puesta en marcha

### Backend

```bash
cd backend
mvn test              # suite de pruebas (H2 en memoria)
mvn spring-boot:run   # servidor en http://localhost:8080
```

### Frontend

```bash
npm install
npm run dev           # http://localhost:5173
```

```bash
npm run build     # compila a dist/
npm run preview   # sirve dist/ localmente
npm run lint
npm test          # suite de pruebas
```

### Nota sobre Node 26

Node 26 expone un `localStorage` global nativo que tapa el de jsdom y rompe las pruebas. En esa versión ejecutar:

```bash
NODE_OPTIONS=--no-experimental-webstorage npm test
```

En Node 22 o anterior no hace falta.

## Acceso de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@performance.cl` | `admin123` |
| Vendedor | `vendedor@performance.cl` | `vendedor123` |
| Cliente | `cliente@correo.cl` | `cliente123` |

- **Administrador:** acceso total (catálogo, usuarios, ventas, pedidos).
- **Vendedor:** solo vista de productos y pedidos (sin gestión de usuarios).
- **Cliente:** tienda, compra a su propio nombre y consulta de sus boletas.

Los credenciales demo están en `backend/src/main/resources/data.sql` (passwords hasheadas con BCrypt).

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Inicio y productos destacados |
| `/productos`, `/categorias`, `/ofertas` | Catálogo |
| `/producto/:id` | Detalle de producto |
| `/carrito`, `/checkout` | Compra |
| `/login` | Inicio de sesión y registro |
| `/admin` | Panel de administración (solo rol administrador) |
| `*` | Página 404 |

El panel de administración está protegido por una ruta de layout: sin sesión redirige a `/login`, y un cliente autenticado vuelve a la tienda.

## Estructura

```text
src/
├── components/     Componentes reutilizables (Campo, ImagenProducto, layouts, rutas protegidas)
├── context/        Contexto de sesión y de carrito
├── Pages/          Vistas de tienda y de administración
├── services/       api.js (fetch REST + token JWT), auth.js (login/registro)
├── tests/          Pruebas con Vitest
└── assets/styles/  Hojas de estilo por área
backend/
├── src/main/java/...     Servicios Spring (Security, JWT, controladores, modelos)
└── src/main/resources/   data.sql (demo BCrypt), application.properties
infra/              Terraform: VPC, subred pública, security group, EC2 y nginx
```

## Pruebas

- Frontend: Vitest sobre jsdom (`npm test`) — session, checkout, admin, productos
- Backend: suite de integración de Maven (`mvn test`) — JWT, matriz de roles, BCrypt, boletas

## Despliegue en AWS

`infra/` crea una VPC con una subred pública, un security group (HTTP abierto, SSH solo desde una IP), una instancia EC2 con Ubuntu 24.04 y nginx configurado con el fallback de SPA que React Router necesita.

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # define ssh_allowed_cidr y ssh_public_key_path
terraform init
terraform plan
terraform apply
cd ..
SSH_KEY=~/.ssh/id_ed25519 ./infra/deploy.sh
```

`deploy.sh` compila la aplicación, espera a que termine el primer arranque de la instancia, publica `dist/` y verifica que el servidor esté entregando la compilación nueva.

El estado de Terraform, `terraform.tfvars` y las llaves privadas están excluidos por `.gitignore`.

## Limitaciones conocidas

- **Backend local HTTP.** El backend corre en `http://localhost:8080`; el frontend en `http://localhost:5173`. Sin TLS se despliega la app de forma desacoplada.
- **Carrito solo para la sesión.** El carrito se persiste en `localStorage`; si hay reload conectado a la API de respaldar datos de negocio persistentemente.
- **JWT_SECRET.** Sin `JWT_SECRET` asignado, la app genera una clave efímera: los tokens dejan de valer al reiniciar. Invierte `JWT_SECRET` (base64, mínimo 32 bytes) en producción.
- **El despliegue es HTTP.** Sin dominio ni certificado no hay cifrado del tráfico.
- **Faltan imágenes en `public/img/`.** La interfaz usa un reemplazo genérico cuando no encuentra la imagen.

Estas limitaciones son deliberadas para el alcance del trabajo: la aplicación demuestra frontend + backend + infraestructura, no un sistema productivo en producción.

# Performance Skateshop

Tienda de skateboarding hecha como SPA con React 19 y Vite. Incluye catálogo, carrito, checkout, autenticación y un panel de administración. No tiene backend: los datos se guardan en el `localStorage` del navegador.

## Stack

- React 19 + React Router 7
- Vite 8
- Vitest + Testing Library
- Oxlint
- Terraform 1.6+ para el despliegue en AWS (carpeta `infra/`)

## Requisitos

- Node.js 20 o superior
- npm

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`.

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

El cliente se crea desde la pestaña **Crear Cuenta**. Las credenciales del administrador son datos de demostración incluidos en el código (`src/services/mockStorage.js`), visibles también en la pantalla de login.

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
├── services/       Datos de demostración, autenticación y utilidades de almacenamiento
├── tests/          Pruebas con Vitest
└── assets/styles/  Hojas de estilo por área
infra/              Terraform: VPC, subred pública, security group, EC2 y nginx
```

## Pruebas

Las pruebas cubren el flujo de sesión, el checkout, el panel de administración, la tarjeta de producto y los componentes compartidos. Corren con Vitest sobre jsdom.

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

Antes de conectarse, `deploy.sh` lee tu IP pública actual y la aplica al security group como `/32`. Las conexiones domésticas suelen ser dinámicas: si la IP cambia, SSH falla con timeout mientras HTTP sigue respondiendo. Con este paso el despliegue se recupera solo y el puerto 22 nunca queda abierto a un rango mayor que tu dirección.

El estado de Terraform, `terraform.tfvars` y las llaves privadas están excluidos por `.gitignore`.

## Limitaciones conocidas

- **Sin backend ni base de datos.** Los productos, usuarios y pedidos viven en el `localStorage`, así que cada navegador tiene su propia copia y los cambios del administrador no se comparten entre dispositivos.
- **La autenticación no es segura.** Las credenciales se validan en el cliente y la sesión se guarda en `localStorage`. En producción requiere autenticación en el servidor (por ejemplo Spring Security con JWT).
- **El despliegue es HTTP,** sin TLS. Sin dominio ni certificado no hay cifrado del tráfico.
- **Las fotos de producto son de demostración.** Los tres productos destacados usan imágenes libres o de la fase 1, y el resto conserva el logo como reemplazo.

Estas limitaciones son deliberadas para el alcance del trabajo: la aplicación demuestra el frontend y el despliegue de infraestructura, no un sistema productivo.

## Créditos de imágenes

| Archivo | Origen | Licencia |
|---|---|---|
| `public/img/Caso1.jpg`–`Caso4.webp`, `tablas.jpg`, `img_nav.PNG`, `logo.jpeg` | Fase 1 del proyecto ([Nicolasdx1/ProyectoFullStack](https://github.com/Nicolasdx1/ProyectoFullStack/tree/master/img)) | Propias del equipo |
| `public/img/Hero.jpg` | [Unsplash](https://images.unsplash.com/photo-1547447134-cd3f5c716030), la misma foto que usa la fase 1 | Licencia Unsplash |
| `public/img/lija.jpg` | "Skateboard upside", Cynroya, [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=151468909) | CC0 1.0 |
| `public/img/polera.jpg` | "Wooden hangers with t-shirts", [rawpixel](https://www.rawpixel.com/) (vía [Openverse](https://openverse.org/)) | CC0 1.0 |

Los íconos son de [Font Awesome 6.5.1](https://fontawesome.com/) (Free), cargados por CDN con hash de integridad en `index.html`.

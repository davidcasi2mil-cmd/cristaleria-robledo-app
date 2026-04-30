# Cristalería Robledo - Sistema de Gestión

Sistema de gestión de órdenes de trabajo para Cristalería Robledo. Permite registrar clientes, crear y hacer seguimiento de órdenes, y generar recibos en PDF.

## Stack Tecnológico

**Backend:**
- Node.js 20 + Express
- TypeScript
- Prisma ORM + PostgreSQL
- JWT para autenticación
- Zod para validación
- Jest para tests

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (estado global)
- React Hook Form + Zod
- jsPDF (exportar PDF)

## Requisitos

- Node.js 20+
- PostgreSQL 15+ (o Docker)
- npm 9+

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/davidcasi2mil-cmd/cristaleria-robledo-app.git
cd cristaleria-robledo-app
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu configuración de base de datos
npm install
npx prisma migrate dev
npx prisma db seed   # Crea el usuario administrador inicial
npm run dev
```

> El seed crea el usuario **admin@cristaleria.com** con contraseña **Admin1234!** (rol ADMIN).
> Puedes sobreescribir estos valores con las variables de entorno `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` antes de ejecutar el seed.
> **Cambia la contraseña tras el primer inicio de sesión.**

### 3. Configurar el frontend

```bash
cd frontend
cp .env.example .env.local
# Editar .env.local si el backend usa una URL diferente
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000` y el backend en `http://localhost:3001`.

## Uso con Docker

```bash
# Levantar todos los servicios
docker compose up --build

# En segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Clave secreta para JWT | `mi_clave_secreta` |
| `JWT_EXPIRES_IN` | Duración del token | `7d` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de la API del backend | `http://localhost:3001/api` |

## Scripts Disponibles

### Backend

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilar TypeScript
npm start          # Servidor de producción
npm run typecheck  # Verificar tipos
npm test           # Ejecutar tests
npm run prisma:seed # Crear usuario administrador inicial
```

### Frontend

```bash
npm run dev    # Servidor de desarrollo
npm run build  # Compilar para producción
npm start      # Servidor de producción
npm run lint   # Linter ESLint
```

## Estructura del Proyecto

```
cristaleria-robledo-app/
├── backend/
│   ├── prisma/            # Esquema y migraciones de Prisma
│   ├── src/
│   │   ├── routes/        # Rutas Express (auth, clientes, ordenes)
│   │   ├── middleware/    # Middlewares (auth, error handling)
│   │   └── index.ts       # Punto de entrada
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/               # App Router de Next.js
│   │   ├── login/         # Página de login
│   │   ├── ordenes/       # Páginas de órdenes
│   │   └── page.tsx       # Dashboard
│   ├── components/        # Componentes reutilizables
│   ├── lib/               # Utilidades (api, store, schemas)
│   ├── Dockerfile
│   └── package.json
├── docs/                  # Documentación
├── docker-compose.yml
└── README.md
```

## Despliegue en Producción (GitHub Actions + SSH)

El repositorio incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que:

1. Construye las imágenes Docker de backend y frontend.
2. Las publica en **GitHub Container Registry (GHCR)**.
3. Se conecta al servidor por SSH y ejecuta `docker compose pull && docker compose up -d`.

### Secrets requeridos

Configúralos en **Settings → Secrets and variables → Actions** del repositorio:

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `DEPLOY_HOST` | IP o hostname del servidor | `203.0.113.10` |
| `DEPLOY_USER` | Usuario SSH | `ubuntu` |
| `DEPLOY_SSH_KEY` | Clave privada SSH (contenido completo) | `-----BEGIN OPENSSH...` |
| `POSTGRES_PASSWORD` | Contraseña de la base de datos | `s3cr3t_db_pass` |
| `JWT_SECRET` | Clave secreta para JWT | `s3cr3t_jwt_key` |
| `CORS_ORIGIN` | URL pública del frontend | `http://203.0.113.10:3000` |
| `NEXT_PUBLIC_API_URL` | URL pública de la API | `http://203.0.113.10:3001/api` |

### Requisitos del servidor

- Docker y Docker Compose v2 instalados.
- El usuario SSH debe pertenecer al grupo `docker` (o tener acceso a `sudo docker`).
- Puerto **3000** (frontend) y **3001** (backend) abiertos en el firewall.

### Primer despliegue manual

Si es la primera vez, ejecuta en el servidor:

```bash
mkdir -p ~/cristaleria-robledo-app
```

A partir de ese momento, cada `push` a la rama `main` dispara el workflow y actualiza la aplicación automáticamente.

### Levantar la app manualmente en el servidor

```bash
cd ~/cristaleria-robledo-app
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Documentación

- [API](docs/API.md) - Documentación de todos los endpoints
- [Arquitectura](docs/ARQUITECTURA.md) - Descripción de la arquitectura del sistema
- [Manual de Usuario](docs/MANUAL_USUARIO.md) - Guía de uso del sistema

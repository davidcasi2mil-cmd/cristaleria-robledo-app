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
npm run dev
```

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

## Documentación

- [API](docs/API.md) - Documentación de todos los endpoints
- [Arquitectura](docs/ARQUITECTURA.md) - Descripción de la arquitectura del sistema
- [Manual de Usuario](docs/MANUAL_USUARIO.md) - Guía de uso del sistema

# Arquitectura del Sistema - Cristalería Robledo

## Estructura del Monorepo

```
cristaleria-robledo-app/
├── backend/          # API REST (Node.js + Express + TypeScript)
├── frontend/         # Aplicación web (Next.js 14 + React 18)
├── docs/             # Documentación técnica
├── docker-compose.yml
└── README.md
```

## Separación Backend / Frontend

El sistema sigue una arquitectura cliente-servidor desacoplada:

- **Backend** expone una API REST en el puerto `3001`
- **Frontend** consume la API a través de HTTP (Axios) desde el puerto `3000`
- No hay renderizado del lado del servidor que dependa del backend (Next.js usa Client Components para datos dinámicos)

```
[Navegador]
    │
    ▼
[Next.js Frontend :3000]
    │  HTTP/JSON (Axios)
    ▼
[Express Backend :3001]
    │  Prisma ORM
    ▼
[PostgreSQL :5432]
```

## Esquema de Base de Datos

```
Usuario
───────
id          String  (CUID, PK)
nombre      String
email       String  (único)
password    String  (hash bcrypt)
rol         Enum    (ADMIN | EMPLEADO)
creadoEn    DateTime

Cliente
───────
id          String  (CUID, PK)
nombre      String
telefono    String?
email       String?
direccion   String?
creadoEn    DateTime
ordenes     Orden[]

Orden
─────
id             String  (CUID, PK)
numero         Int     (autoincrement, único)
estado         Enum    (PENDIENTE | EN_PROCESO | COMPLETADA | CANCELADA)
subtotal       Decimal
descuento      Decimal (0-100, porcentaje)
descuentoMonto Decimal
total          Decimal
notas          String?
creadoEn       DateTime
clienteId      String  (FK → Cliente)
cliente        Cliente
lineas         LineaOrden[]

LineaOrden
──────────
id          String  (CUID, PK)
descripcion String
cantidad    Decimal
precioUnit  Decimal
subtotal    Decimal
ordenId     String  (FK → Orden)
orden       Orden
```

## Flujo de Autenticación

```
1. Usuario envía email + contraseña → POST /api/auth/login
2. Backend verifica credenciales con bcrypt
3. Backend genera token JWT (firmado con JWT_SECRET, expira en JWT_EXPIRES_IN)
4. Frontend almacena el token en localStorage (clave: cr_token)
5. Zustand store guarda usuario + token en memoria
6. Axios interceptor adjunta el token en cada petición: Authorization: Bearer <token>
7. Middleware de auth en backend verifica el token en cada ruta protegida
8. Si el token expira → backend responde 401 → Axios interceptor redirige a /login
```

## Flujo de Datos

### Crear una Orden

```
1. Usuario rellena el formulario (react-hook-form + Zod)
2. Validación en cliente (Zod)
3. POST /api/ordenes con datos validados
4. Backend valida con Zod (segunda capa)
5. Prisma calcula subtotales y total
6. Orden guardada en PostgreSQL con número autoincremental
7. Frontend redirige a /ordenes/[id]
```

### Listar Órdenes

```
1. Frontend monta la página de historial
2. GET /api/ordenes?pagina=1&limite=10 (con filtros opcionales)
3. Backend consulta PostgreSQL con Prisma (incluye cliente)
4. Respuesta paginada con total
5. Frontend renderiza tabla con estado, cliente y total
```

## Capas del Backend

```
src/
├── index.ts              # Bootstrap: Express, middlewares globales, rutas
├── middleware/
│   ├── auth.ts           # Verificación JWT
│   └── errorHandler.ts   # Manejo centralizado de errores
└── routes/
    ├── auth.ts           # /api/auth/*
    ├── clientes.ts       # /api/clientes/*
    └── ordenes.ts        # /api/ordenes/*
```

## Capas del Frontend

```
app/                      # Next.js App Router
├── layout.tsx            # Layout raíz (Navbar + main)
├── page.tsx              # Dashboard (/)
├── login/page.tsx        # Formulario de login
└── ordenes/
    ├── page.tsx          # Historial de órdenes
    ├── nueva/page.tsx    # Crear orden
    └── [id]/
        ├── page.tsx      # Detalle de orden
        └── recibo/page.tsx  # Recibo imprimible + PDF

components/
├── Navbar.tsx            # Barra de navegación
└── RequireAuth.tsx       # HOC de protección de rutas

lib/
├── api.ts                # Instancia Axios configurada
├── store.ts              # Zustand: estado de autenticación
└── schemas.ts            # Esquemas Zod compartidos
```

## Docker

Cada servicio tiene su propio Dockerfile multi-etapa:

- **postgres** - Imagen oficial PostgreSQL 15 Alpine
- **backend** - Builder compila TypeScript, imagen final solo con dist + node_modules
- **frontend** - Builder compila Next.js, imagen final con standalone output (optimizado)

Los servicios se comunican a través de la red de Docker Compose. El frontend en producción Docker usa `NEXT_PUBLIC_API_URL` para apuntar al backend.

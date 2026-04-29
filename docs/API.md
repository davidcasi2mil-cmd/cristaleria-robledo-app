# Documentación de la API - Cristalería Robledo

Base URL: `http://localhost:3001/api`

Los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

---

## Autenticación

### POST /auth/login

Inicia sesión y obtiene un token JWT.

**Body:**
```json
{
  "email": "admin@cristaleria.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "clxxx...",
    "nombre": "Administrador",
    "email": "admin@cristaleria.com",
    "rol": "ADMIN"
  }
}
```

**Errores:**
- `400` - Datos inválidos
- `401` - Credenciales incorrectas

---

### POST /auth/registrar

Registra un nuevo usuario. *(Requiere autenticación de admin)*

**Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "email": "usuario@cristaleria.com",
  "password": "contraseña123",
  "rol": "VENDEDOR"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "id": "clxxx...",
    "nombre": "Nuevo Usuario",
    "email": "usuario@cristaleria.com",
    "rol": "VENDEDOR"
  }
}
```

---

### GET /auth/perfil

Obtiene el perfil del usuario autenticado. *(Requiere autenticación)*

**Respuesta exitosa (200):**
```json
{
  "usuario": {
    "id": "clxxx...",
    "nombre": "Administrador",
    "email": "admin@cristaleria.com",
    "rol": "ADMIN"
  }
}
```

---

## Clientes

### GET /clientes

Lista todos los clientes. *(Requiere autenticación)*

**Query params:**
- `busqueda` (string) - Filtra por nombre, email o teléfono
- `pagina` (number, default: 1) - Número de página
- `limite` (number, default: 20) - Resultados por página

**Respuesta exitosa (200):**
```json
{
  "clientes": [
    {
      "id": "clxxx...",
      "nombre": "Juan García",
      "telefono": "600123456",
      "email": "juan@ejemplo.com",
      "direccion": "Calle Mayor 1",
      "creadoEn": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 1,
  "pagina": 1
}
```

---

### POST /clientes

Crea un nuevo cliente. *(Requiere autenticación)*

**Body:**
```json
{
  "nombre": "Juan García",
  "telefono": "600123456",
  "email": "juan@ejemplo.com",
  "direccion": "Calle Mayor 1"
}
```

**Respuesta exitosa (201):**
```json
{
  "cliente": {
    "id": "clxxx...",
    "nombre": "Juan García",
    "telefono": "600123456",
    "email": "juan@ejemplo.com",
    "direccion": "Calle Mayor 1",
    "creadoEn": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### GET /clientes/:id

Obtiene un cliente por ID. *(Requiere autenticación)*

**Respuesta exitosa (200):**
```json
{
  "cliente": {
    "id": "clxxx...",
    "nombre": "Juan García",
    "telefono": "600123456",
    "email": "juan@ejemplo.com",
    "direccion": "Calle Mayor 1",
    "creadoEn": "2024-01-15T10:00:00.000Z",
    "ordenes": []
  }
}
```

**Errores:**
- `404` - Cliente no encontrado

---

### PATCH /clientes/:id

Actualiza un cliente. *(Requiere autenticación)*

**Body** (todos los campos son opcionales):
```json
{
  "nombre": "Juan García Actualizado",
  "telefono": "600987654"
}
```

**Respuesta exitosa (200):**
```json
{
  "cliente": { ... }
}
```

---

### DELETE /clientes/:id

Elimina un cliente. *(Requiere autenticación)*

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Cliente eliminado correctamente"
}
```

---

## Órdenes

### GET /ordenes

Lista órdenes de trabajo. *(Requiere autenticación)*

**Query params:**
- `busqueda` (string) - Filtra por nombre de cliente o número
- `estado` (string) - Filtra por estado: `PENDIENTE`, `EN_PROCESO`, `COMPLETADA`, `CANCELADA`
- `pagina` (number, default: 1)
- `limite` (number, default: 10)

**Respuesta exitosa (200):**
```json
{
  "ordenes": [
    {
      "id": "clxxx...",
      "numero": 1,
      "estado": "PENDIENTE",
      "subtotal": 150.00,
      "descuento": 10,
      "descuentoMonto": 15.00,
      "total": 135.00,
      "notas": "Instalación urgente",
      "creadoEn": "2024-01-15T10:00:00.000Z",
      "cliente": {
        "id": "clxxx...",
        "nombre": "Juan García"
      }
    }
  ],
  "total": 1,
  "pagina": 1
}
```

---

### POST /ordenes

Crea una nueva orden. *(Requiere autenticación)*

**Body:**
```json
{
  "clienteId": "clxxx...",
  "lineas": [
    {
      "descripcion": "Cristal templado 60x40cm",
      "cantidad": 2,
      "precioUnit": 45.50
    },
    {
      "descripcion": "Mano de obra instalación",
      "cantidad": 1,
      "precioUnit": 60.00
    }
  ],
  "descuento": 10,
  "notas": "Instalación para el jueves"
}
```

**Respuesta exitosa (201):**
```json
{
  "orden": {
    "id": "clxxx...",
    "numero": 1,
    "estado": "PENDIENTE",
    "subtotal": 151.00,
    "descuento": 10,
    "descuentoMonto": 15.10,
    "total": 135.90,
    "notas": "Instalación para el jueves",
    "creadoEn": "2024-01-15T10:00:00.000Z",
    "cliente": { ... },
    "lineas": [ ... ]
  }
}
```

---

### GET /ordenes/:id

Obtiene una orden por ID. *(Requiere autenticación)*

**Respuesta exitosa (200):**
```json
{
  "orden": {
    "id": "clxxx...",
    "numero": 1,
    "estado": "PENDIENTE",
    "subtotal": 151.00,
    "descuento": 10,
    "descuentoMonto": 15.10,
    "total": 135.90,
    "notas": "...",
    "creadoEn": "2024-01-15T10:00:00.000Z",
    "cliente": {
      "id": "clxxx...",
      "nombre": "Juan García",
      "telefono": "600123456",
      "email": "juan@ejemplo.com",
      "direccion": "Calle Mayor 1"
    },
    "lineas": [
      {
        "id": "clxxx...",
        "descripcion": "Cristal templado 60x40cm",
        "cantidad": 2,
        "precioUnit": 45.50,
        "subtotal": 91.00
      }
    ]
  }
}
```

---

### PATCH /ordenes/:id

Actualiza el estado u otros campos de una orden. *(Requiere autenticación)*

**Body** (campos opcionales):
```json
{
  "estado": "EN_PROCESO",
  "notas": "Comenzando trabajo"
}
```

**Respuesta exitosa (200):**
```json
{
  "orden": { ... }
}
```

**Estados válidos:** `PENDIENTE`, `EN_PROCESO`, `COMPLETADA`, `CANCELADA`

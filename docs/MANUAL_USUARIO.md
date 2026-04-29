# Manual de Usuario - Cristalería Robledo

## Índice

1. [Iniciar sesión](#1-iniciar-sesión)
2. [Panel de inicio](#2-panel-de-inicio)
3. [Crear una orden](#3-crear-una-orden)
4. [Buscar en el historial](#4-buscar-en-el-historial)
5. [Ver detalle de una orden](#5-ver-detalle-de-una-orden)
6. [Imprimir y exportar recibo](#6-imprimir-y-exportar-recibo)

---

## 1. Iniciar sesión

1. Accede a la aplicación en `http://localhost:3000`
2. Se mostrará automáticamente la página de inicio de sesión
3. Introduce tu **correo electrónico** y **contraseña**
4. Haz clic en **"Iniciar sesión"**
5. Si las credenciales son correctas, serás redirigido al panel de inicio

> ⚠️ Si introduces datos incorrectos, aparecerá un mensaje de error en rojo.

---

## 2. Panel de inicio

Tras iniciar sesión verás el panel principal con:

- **Bienvenida** con tu nombre de usuario
- **Acceso rápido** a:
  - *Nueva Orden* → crear una orden de trabajo
  - *Ver Historial* → consultar todas las órdenes
  - *Total Órdenes* → contador total de órdenes registradas
- **Órdenes recientes** → tabla con las últimas 5 órdenes

Para navegar entre secciones usa la barra de navegación superior.

---

## 3. Crear una orden

1. Haz clic en **"Nueva Orden"** (panel de inicio o barra de navegación)
2. **Selecciona el cliente** en el desplegable. Si el cliente no existe, deberá registrarse primero mediante la API.
3. **Agrega líneas de trabajo:**
   - Escribe la descripción del trabajo o material
   - Indica la cantidad (puede ser decimal, ej: `1.5` m²)
   - Introduce el precio unitario en euros
   - El subtotal por línea se calcula automáticamente
   - Haz clic en **"+ Agregar línea"** para añadir más elementos
   - Haz clic en **✕** para eliminar una línea
4. **Descuento:** introduce un porcentaje de descuento (0-100) si aplica
5. **Notas:** añade instrucciones especiales o comentarios opcionales
6. Revisa los **totales** mostrados al final del formulario:
   - Subtotal (suma de todas las líneas)
   - Descuento aplicado
   - **Total final**
7. Haz clic en **"Crear Orden"** para guardar

Tras crear la orden serás redirigido automáticamente al detalle de la misma.

---

## 4. Buscar en el historial

1. Haz clic en **"Historial"** en la barra de navegación (o "Ver Historial" en el panel)
2. Verás una tabla con todas las órdenes
3. **Buscar:** escribe en el campo de búsqueda para filtrar por nombre de cliente o número de orden (hay un pequeño retardo de 300ms para evitar búsquedas innecesarias mientras escribes)
4. **Filtrar por estado:** usa el desplegable para ver solo órdenes en un estado concreto:
   - *Todos los estados* (opción por defecto)
   - Pendiente
   - En proceso
   - Completada
   - Cancelada
5. **Paginación:** si hay más de 10 órdenes, aparecerán controles de paginación en la parte inferior

---

## 5. Ver detalle de una orden

1. En la tabla de historial, haz clic en **"Ver detalle"** en la columna Acciones
2. También puedes hacer clic en el número de orden (`#1`, `#2`...) desde el panel de inicio
3. En la página de detalle verás:
   - **Datos del cliente** (nombre, teléfono, email)
   - **Fecha y número de orden**
   - **Estado actual** (etiqueta de color)
   - **Tabla de líneas** con descripción, cantidad, precio unitario y subtotal
   - **Totales** (subtotal, descuento si aplica, total)
   - **Notas** si las hay
4. Desde aquí puedes acceder al **recibo** haciendo clic en **"🖨️ Imprimir Recibo"**

---

## 6. Imprimir y exportar recibo

1. Desde el detalle de la orden, haz clic en **"🖨️ Imprimir Recibo"**
2. Se mostrará una vista limpia del recibo con toda la información de la orden

### Imprimir en papel

- Haz clic en el botón **"🖨️ Imprimir"**
- Se abrirá el diálogo de impresión del navegador
- Los botones de acción no se incluyen en la impresión

### Exportar como PDF

- Haz clic en el botón **"📄 Exportar PDF"**
- Se generará y descargará automáticamente un archivo PDF con el nombre `recibo-orden-[número].pdf`
- El PDF incluye: datos de la empresa, información del cliente, tabla de líneas y totales

---

## Estados de las órdenes

| Estado | Significado |
|--------|-------------|
| 🟡 Pendiente | La orden acaba de crearse, pendiente de comenzar |
| 🔵 En proceso | El trabajo está en curso |
| 🟢 Completada | El trabajo ha sido finalizado y entregado |
| 🔴 Cancelada | La orden ha sido cancelada |

---

## Cerrar sesión

Haz clic en tu nombre de usuario en la esquina superior derecha y luego en **"Cerrar sesión"**. Serás redirigido a la página de inicio de sesión.

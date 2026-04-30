import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
});

export const TIPOS_ARTICULO = ['CRISTAL', 'MOLDURA', 'PASSPARTOUS', 'ACCESORIO', 'EXTRA'] as const;
export type TipoArticulo = typeof TIPOS_ARTICULO[number];

// Empty numeric inputs with valueAsNumber:true produce NaN; convert to undefined so
// optional numeric fields pass zod validation without silent failures.
const nanToUndefined = (v: unknown) =>
  typeof v === 'number' && isNaN(v) ? undefined : v;

export const lineaOrdenSchema = z.object({
  tipo: z.enum(TIPOS_ARTICULO),
  articuloId: z.string().optional(),
  referencia: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor o igual a 0.01'),
  precioUnit: z.number().min(0, 'El precio no puede ser negativo'),
  perfil: z.number().min(0).optional(),
  ancho: z.number().min(0).optional(),
  alto: z.number().min(0).optional(),
});

// Lenient schema used by the order form – empty trailing placeholder lines are allowed
// and filtered out in onSubmit before sending to the API.
export const lineaOrdenFormSchema = z.object({
  tipo: z.enum(TIPOS_ARTICULO),
  articuloId: z.string().optional(),
  referencia: z.string().optional(),
  descripcion: z.string().optional(),
  cantidad: z.preprocess(nanToUndefined, z.number().min(0).optional()),
  precioUnit: z.preprocess(nanToUndefined, z.number().min(0).optional()),
  perfil: z.preprocess(nanToUndefined, z.number().min(0).optional()),
  ancho: z.preprocess(nanToUndefined, z.number().min(0).optional()),
  alto: z.preprocess(nanToUndefined, z.number().min(0).optional()),
});

export const ordenFormSchema = z.object({
  clienteId: z.string().optional(),
  clienteNombre: z.string().min(2, 'El nombre del cliente es requerido'),
  clienteTelefono: z.string().optional(),
  fechaOrden: z.string().optional(),
  fechaEntrega: z.string().optional(),
  lineas: z.array(lineaOrdenFormSchema),
  descuento: z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v) ? 0 : v),
    z.number().min(0).max(100),
  ),
  anchoOriginal: z.preprocess(nanToUndefined, z.number().min(0).optional()),
  altoOriginal: z.preprocess(nanToUndefined, z.number().min(0).optional()),
  notas: z.string().optional(),
});

export const ordenSchema = z.object({
  clienteId: z.string().optional(),
  clienteNombre: z.string().min(2, 'El nombre del cliente es requerido'),
  clienteTelefono: z.string().optional(),
  fechaOrden: z.string().optional(),
  fechaEntrega: z.string().optional(),
  lineas: z.array(lineaOrdenSchema).min(1, 'Agrega al menos una línea'),
  descuento: z.number().min(0).max(100),
  anchoOriginal: z.number().min(0).optional(),
  altoOriginal: z.number().min(0).optional(),
  notas: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClienteInput = z.infer<typeof clienteSchema>;
export type LineaOrdenInput = z.infer<typeof lineaOrdenSchema>;
export type LineaOrdenFormInput = z.infer<typeof lineaOrdenFormSchema>;
export type OrdenInput = z.infer<typeof ordenSchema>;
export type OrdenFormInput = z.infer<typeof ordenFormSchema>;

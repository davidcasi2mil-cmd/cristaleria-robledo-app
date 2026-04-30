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

export const lineaOrdenSchema = z.object({
  tipo: z.enum(TIPOS_ARTICULO),
  articuloId: z.string().optional(),
  referencia: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  cantidad: z.number().min(0, 'La cantidad no puede ser negativa'),
  precioUnit: z.number().min(0, 'El precio no puede ser negativo'),
  perfil: z.number().min(0).optional(),
  ancho: z.number().min(0).optional(),
  alto: z.number().min(0).optional(),
});

export const ordenSchema = z.object({
  clienteId: z.string().optional(),
  clienteNombre: z.string().min(2, 'El nombre del cliente es requerido'),
  clienteTelefono: z.string().optional(),
  lineas: z.array(lineaOrdenSchema).min(1, 'Agrega al menos una línea'),
  descuento: z.number().min(0).max(100),
  anchoOriginal: z.number().min(0).optional(),
  altoOriginal: z.number().min(0).optional(),
  notas: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClienteInput = z.infer<typeof clienteSchema>;
export type LineaOrdenInput = z.infer<typeof lineaOrdenSchema>;
export type OrdenInput = z.infer<typeof ordenSchema>;

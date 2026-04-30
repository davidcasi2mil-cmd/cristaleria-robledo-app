import { z } from 'zod';

export const lineaOrdenSchema = z.object({
  tipo: z.enum(['CRISTAL', 'MOLDURA', 'PASSPARTOUS', 'ACCESORIO', 'EXTRA']),
  articuloId: z.string().optional(),
  referencia: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  cantidad: z.number().min(0, 'La cantidad no puede ser negativa'),
  precioUnit: z.number().min(0, 'El precio unitario no puede ser negativo'),
  perfil: z.number().min(0).optional(),
  ancho: z.number().min(0).optional(),
  alto: z.number().min(0).optional(),
});

export const ordenSchema = z.object({
  clienteId: z.string().optional(),
  clienteNombre: z.string().min(2, 'El nombre del cliente es requerido'),
  clienteTelefono: z.string().optional(),
  fechaOrden: z.coerce.date().optional(),
  fechaEntrega: z.coerce.date().optional(),
  notas: z.string().optional(),
  descuento: z.number().min(0).max(100).optional().default(0),
  anchoOriginal: z.number().min(0).optional(),
  altoOriginal: z.number().min(0).optional(),
  lineas: z.array(lineaOrdenSchema).min(1, 'Debe haber al menos una línea de orden'),
});

export const actualizarOrdenSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA']).optional(),
  notas: z.string().optional(),
  descuento: z.number().min(0).max(100).optional(),
});

export type LineaOrdenInput = z.infer<typeof lineaOrdenSchema>;
export type OrdenInput = z.infer<typeof ordenSchema>;
export type ActualizarOrdenInput = z.infer<typeof actualizarOrdenSchema>;

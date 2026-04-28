import { z } from 'zod';

export const lineaOrdenSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  cantidad: z.number().positive('La cantidad debe ser positiva'),
  precioUnit: z.number().positive('El precio unitario debe ser positivo'),
});

export const ordenSchema = z.object({
  clienteId: z.string().min(1, 'El cliente es requerido'),
  notas: z.string().optional(),
  descuento: z.number().min(0).max(100).optional().default(0),
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

import { z } from 'zod';

export const articuloSchema = z.object({
  tipo: z.enum(['CRISTAL', 'MOLDURA', 'PASSPARTOUS', 'ACCESORIO', 'EXTRA']),
  referencia: z.string().min(1, 'La referencia es requerida'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
  perfil: z.number().min(0).optional(),
});

export const actualizarArticuloSchema = articuloSchema.partial();

export type ArticuloInput = z.infer<typeof articuloSchema>;
export type ActualizarArticuloInput = z.infer<typeof actualizarArticuloSchema>;

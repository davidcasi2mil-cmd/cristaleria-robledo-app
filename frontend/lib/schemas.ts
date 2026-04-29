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

export const lineaOrdenSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor o igual a 0.01'),
  precioUnit: z.number().min(0, 'El precio no puede ser negativo'),
});

export const ordenSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  lineas: z.array(lineaOrdenSchema).min(1, 'Agrega al menos una línea'),
  descuento: z.number().min(0).max(100),
  notas: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClienteInput = z.infer<typeof clienteSchema>;
export type LineaOrdenInput = z.infer<typeof lineaOrdenSchema>;
export type OrdenInput = z.infer<typeof ordenSchema>;

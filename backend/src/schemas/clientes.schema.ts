import { z } from 'zod';

export const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
});

export const actualizarClienteSchema = clienteSchema.partial();

export type ClienteInput = z.infer<typeof clienteSchema>;
export type ActualizarClienteInput = z.infer<typeof actualizarClienteSchema>;

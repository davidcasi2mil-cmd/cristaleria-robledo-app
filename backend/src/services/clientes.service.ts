import { PrismaClient } from '@prisma/client';
import { ClienteInput, ActualizarClienteInput } from '../schemas/clientes.schema';
import { AppError } from '../middleware/error.middleware';
import { RespuestaPaginada } from '../types';

const prisma = new PrismaClient();

export const crearCliente = async (data: ClienteInput) => {
  if (data.email) {
    const existe = await prisma.cliente.findUnique({ where: { email: data.email } });
    if (existe) throw new AppError('Ya existe un cliente con ese email', 409);
  }
  return prisma.cliente.create({ data: { ...data, email: data.email || null } });
};

export const obtenerClientes = async (
  pagina: number,
  limite: number,
  busqueda?: string,
): Promise<RespuestaPaginada<any>> => {
  const where = busqueda
    ? {
        activo: true,
        OR: [
          { nombre: { contains: busqueda, mode: 'insensitive' as const } },
          { email: { contains: busqueda, mode: 'insensitive' as const } },
          { telefono: { contains: busqueda } },
        ],
      }
    : { activo: true };

  const [datos, total] = await prisma.$transaction([
    prisma.cliente.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { nombre: 'asc' },
    }),
    prisma.cliente.count({ where }),
  ]);

  return {
    datos,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  };
};

export const obtenerClientePorId = async (id: string) => {
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente || !cliente.activo) throw new AppError('Cliente no encontrado', 404);
  return cliente;
};

export const actualizarCliente = async (id: string, data: ActualizarClienteInput) => {
  await obtenerClientePorId(id);
  return prisma.cliente.update({ where: { id }, data });
};

export const eliminarCliente = async (id: string) => {
  await obtenerClientePorId(id);
  return prisma.cliente.update({ where: { id }, data: { activo: false } });
};

export const buscarClientePorTelefono = async (telefono: string) => {
  return prisma.cliente.findFirst({
    where: { telefono, activo: true },
  });
};

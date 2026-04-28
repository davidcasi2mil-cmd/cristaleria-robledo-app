import { PrismaClient, Prisma } from '@prisma/client';
import { OrdenInput, ActualizarOrdenInput } from '../schemas/ordenes.schema';
import { AppError } from '../middleware/error.middleware';
import { calcularOrden } from './calculo.service';
import { RespuestaPaginada } from '../types';

const prisma = new PrismaClient();

export const crearOrden = async (data: OrdenInput, usuarioId: string) => {
  const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
  if (!cliente || !cliente.activo) throw new AppError('Cliente no encontrado', 404);

  const calculo = calcularOrden(data.lineas, data.descuento);

  return prisma.$transaction(async (tx) => {
    const orden = await tx.orden.create({
      data: {
        clienteId: data.clienteId,
        usuarioId,
        notas: data.notas,
        subtotal: new Prisma.Decimal(calculo.subtotal),
        descuento: new Prisma.Decimal(calculo.descuentoMonto),
        total: new Prisma.Decimal(calculo.total),
        lineas: {
          create: calculo.lineas.map((l) => ({
            descripcion: l.descripcion,
            cantidad: new Prisma.Decimal(l.cantidad),
            precioUnit: new Prisma.Decimal(l.precioUnit),
            subtotal: new Prisma.Decimal(l.subtotal),
          })),
        },
      },
      include: { cliente: true, usuario: true, lineas: true },
    });
    return orden;
  });
};

export const obtenerOrdenes = async (
  pagina: number,
  limite: number,
  busqueda?: string,
  estado?: string,
): Promise<RespuestaPaginada<any>> => {
  const where: any = {};
  if (estado) where.estado = estado;
  if (busqueda) {
    where.OR = [
      { cliente: { nombre: { contains: busqueda, mode: 'insensitive' } } },
      { notas: { contains: busqueda, mode: 'insensitive' } },
    ];
  }

  const [datos, total] = await prisma.$transaction([
    prisma.orden.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { creadoEn: 'desc' },
      include: { cliente: true, usuario: { select: { id: true, nombre: true, email: true } }, lineas: true },
    }),
    prisma.orden.count({ where }),
  ]);

  return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

export const obtenerOrdenPorId = async (id: string) => {
  const orden = await prisma.orden.findUnique({
    where: { id },
    include: { cliente: true, usuario: { select: { id: true, nombre: true, email: true } }, lineas: true },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  return orden;
};

export const actualizarOrden = async (id: string, data: ActualizarOrdenInput) => {
  await obtenerOrdenPorId(id);
  return prisma.orden.update({
    where: { id },
    data,
    include: { cliente: true, lineas: true },
  });
};

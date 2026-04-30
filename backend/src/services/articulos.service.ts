import { PrismaClient, TipoArticulo, Prisma } from '@prisma/client';
import { ArticuloInput, ActualizarArticuloInput } from '../schemas/articulos.schema';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const crearArticulo = async (data: ArticuloInput) => {
  const existe = await prisma.articulo.findUnique({
    where: { tipo_referencia: { tipo: data.tipo as TipoArticulo, referencia: data.referencia } },
  });
  if (existe) {
    if (!existe.activo) {
      return prisma.articulo.update({
        where: { id: existe.id },
        data: { ...data, tipo: data.tipo as TipoArticulo, precio: new Prisma.Decimal(data.precio), perfil: data.perfil != null ? new Prisma.Decimal(data.perfil) : null, activo: true },
      });
    }
    throw new AppError('Ya existe un artículo con esa referencia y tipo', 409);
  }
  return prisma.articulo.create({
    data: {
      tipo: data.tipo as TipoArticulo,
      referencia: data.referencia,
      descripcion: data.descripcion,
      precio: new Prisma.Decimal(data.precio),
      perfil: data.perfil != null ? new Prisma.Decimal(data.perfil) : null,
    },
  });
};

export const obtenerArticulos = async (tipo?: string) => {
  const where: any = { activo: true };
  if (tipo) where.tipo = tipo as TipoArticulo;
  return prisma.articulo.findMany({
    where,
    orderBy: [{ tipo: 'asc' }, { referencia: 'asc' }],
  });
};

export const obtenerArticuloPorId = async (id: string) => {
  const articulo = await prisma.articulo.findUnique({ where: { id } });
  if (!articulo || !articulo.activo) throw new AppError('Artículo no encontrado', 404);
  return articulo;
};

export const buscarOCrearArticulo = async (tipo: TipoArticulo, referencia: string, descripcion: string, precio: number, perfil?: number) => {
  const existe = await prisma.articulo.findUnique({
    where: { tipo_referencia: { tipo, referencia } },
  });
  if (existe) return existe;
  return prisma.articulo.create({
    data: {
      tipo,
      referencia,
      descripcion,
      precio: new Prisma.Decimal(precio),
      perfil: perfil != null ? new Prisma.Decimal(perfil) : null,
    },
  });
};

export const actualizarArticulo = async (id: string, data: ActualizarArticuloInput) => {
  await obtenerArticuloPorId(id);
  return prisma.articulo.update({
    where: { id },
    data: {
      ...data,
      tipo: data.tipo as TipoArticulo | undefined,
      precio: data.precio != null ? new Prisma.Decimal(data.precio) : undefined,
      perfil: data.perfil != null ? new Prisma.Decimal(data.perfil) : undefined,
    },
  });
};

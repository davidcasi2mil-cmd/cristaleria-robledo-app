import { PrismaClient, Prisma, TipoArticulo } from '@prisma/client';
import { OrdenInput, ActualizarOrdenInput } from '../schemas/ordenes.schema';
import { AppError } from '../middleware/error.middleware';
import { calcularOrden } from './calculo.service';
import { RespuestaPaginada } from '../types';

const prisma = new PrismaClient();

export const crearOrden = async (data: OrdenInput, usuarioId: string) => {
  // Find or create client
  let clienteId = data.clienteId;
  if (!clienteId) {
    // Try to find by phone first, then by name
    let cliente = data.clienteTelefono
      ? await prisma.cliente.findFirst({ where: { telefono: data.clienteTelefono, activo: true } })
      : await prisma.cliente.findFirst({ where: { nombre: data.clienteNombre, activo: true } });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: data.clienteNombre,
          telefono: data.clienteTelefono || null,
        },
      });
    }
    clienteId = cliente.id;
  } else {
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente || !cliente.activo) throw new AppError('Cliente no encontrado', 404);
  }

  // Build line data, auto-creating articles if needed
  const lineasConArticulo = await Promise.all(
    data.lineas.map(async (linea) => {
      let articuloId = linea.articuloId;
      if (!articuloId && linea.referencia) {
        const tipo = linea.tipo as TipoArticulo;
        let articulo = await prisma.articulo.findUnique({
          where: { tipo_referencia: { tipo, referencia: linea.referencia } },
        });
        if (!articulo) {
          articulo = await prisma.articulo.create({
            data: {
              tipo,
              referencia: linea.referencia,
              descripcion: linea.descripcion,
              precio: new Prisma.Decimal(linea.precioUnit),
              perfil: linea.perfil != null ? new Prisma.Decimal(linea.perfil) : null,
            },
          });
        }
        articuloId = articulo.id;
      }
      return { ...linea, articuloId };
    }),
  );

  const calculo = calcularOrden(
    data.lineas.map((l) => ({ descripcion: l.descripcion, cantidad: l.cantidad, precioUnit: l.precioUnit })),
    data.descuento,
  );

  return prisma.$transaction(async (tx) => {
    const orden = await tx.orden.create({
      data: {
        clienteId,
        usuarioId,
        notas: data.notas,
        anchoOriginal: data.anchoOriginal != null ? new Prisma.Decimal(data.anchoOriginal) : null,
        altoOriginal: data.altoOriginal != null ? new Prisma.Decimal(data.altoOriginal) : null,
        fechaOrden: data.fechaOrden ?? new Date(),
        fechaEntrega: data.fechaEntrega ?? null,
        subtotal: new Prisma.Decimal(calculo.subtotal),
        descuento: new Prisma.Decimal(calculo.descuentoMonto),
        total: new Prisma.Decimal(calculo.total),
        lineas: {
          create: calculo.lineas.map((l, i) => ({
            tipo: (lineasConArticulo[i].tipo as TipoArticulo) ?? 'EXTRA',
            articuloId: lineasConArticulo[i].articuloId || null,
            referencia: lineasConArticulo[i].referencia || null,
            descripcion: l.descripcion,
            cantidad: new Prisma.Decimal(l.cantidad),
            precioUnit: new Prisma.Decimal(l.precioUnit),
            perfil: lineasConArticulo[i].perfil != null ? new Prisma.Decimal(lineasConArticulo[i].perfil!) : null,
            ancho: lineasConArticulo[i].ancho != null ? new Prisma.Decimal(lineasConArticulo[i].ancho!) : null,
            alto: lineasConArticulo[i].alto != null ? new Prisma.Decimal(lineasConArticulo[i].alto!) : null,
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
    include: { cliente: true, usuario: { select: { id: true, nombre: true, email: true } }, lineas: { include: { articulo: true } } },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  return orden;
};

export const obtenerOrdenPorNumero = async (numero: number) => {
  const orden = await prisma.orden.findUnique({
    where: { numero },
    include: { cliente: true, usuario: { select: { id: true, nombre: true, email: true } }, lineas: { include: { articulo: true } } },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  return orden;
};

export const obtenerMaximoNumero = async () => {
  const result = await prisma.orden.aggregate({ _max: { numero: true } });
  return result._max.numero ?? 0;
};

export const actualizarOrden = async (id: string, data: ActualizarOrdenInput) => {
  await obtenerOrdenPorId(id);
  return prisma.orden.update({
    where: { id },
    data,
    include: { cliente: true, lineas: true },
  });
};

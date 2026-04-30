import { Response, NextFunction } from 'express';
import * as ordenesService from '../services/ordenes.service';
import { calcularOrden } from '../services/calculo.service';
import { RequestConUsuario } from '../types';
import { z } from 'zod';
import { lineaOrdenSchema } from '../schemas/ordenes.schema';

const calcularSchema = z.object({
  lineas: z.array(lineaOrdenSchema).min(1, 'Debe haber al menos una línea'),
  descuento: z.number().min(0).max(100).optional().default(0),
});

export const crearOrdenHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orden = await ordenesService.crearOrden(req.body, req.usuario!.id);
    res.status(201).json(orden);
  } catch (err) {
    next(err);
  }
};

export const obtenerOrdenesHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const busqueda = req.query.busqueda as string | undefined;
    const estado = req.query.estado as string | undefined;
    const resultado = await ordenesService.obtenerOrdenes(pagina, limite, busqueda, estado);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerOrdenPorIdHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orden = await ordenesService.obtenerOrdenPorId(req.params.id);
    res.json(orden);
  } catch (err) {
    next(err);
  }
};

export const obtenerOrdenPorNumeroHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const numero = parseInt(req.params.numero);
    if (isNaN(numero)) {
      res.status(400).json({ mensaje: 'Número de orden inválido' });
      return;
    }
    const orden = await ordenesService.obtenerOrdenPorNumero(numero);
    res.json(orden);
  } catch (err) {
    next(err);
  }
};

export const obtenerMaximoNumeroHandler = async (_req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const maximo = await ordenesService.obtenerMaximoNumero();
    res.json({ maximo });
  } catch (err) {
    next(err);
  }
};

export const actualizarOrdenHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orden = await ordenesService.actualizarOrden(req.params.id, req.body);
    res.json(orden);
  } catch (err) {
    next(err);
  }
};

export const calcularHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = calcularSchema.parse(req.body);
    const resultado = calcularOrden(
      parsed.lineas.map((l) => ({ descripcion: l.descripcion, cantidad: l.cantidad, precioUnit: l.precioUnit })),
      parsed.descuento,
    );
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

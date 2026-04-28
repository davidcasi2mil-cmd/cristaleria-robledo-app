import { Response, NextFunction } from 'express';
import * as ordenesService from '../services/ordenes.service';
import { calcularOrden } from '../services/calculo.service';
import { RequestConUsuario } from '../types';

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
    const { lineas, descuento } = req.body;
    const resultado = calcularOrden(lineas, descuento);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

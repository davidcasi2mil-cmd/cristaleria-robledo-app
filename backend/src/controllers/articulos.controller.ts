import { Response, NextFunction } from 'express';
import * as articulosService from '../services/articulos.service';
import { RequestConUsuario } from '../types';

export const crearArticuloHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const articulo = await articulosService.crearArticulo(req.body);
    res.status(201).json(articulo);
  } catch (err) {
    next(err);
  }
};

export const obtenerArticulosHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tipo = req.query.tipo as string | undefined;
    const articulos = await articulosService.obtenerArticulos(tipo);
    res.json(articulos);
  } catch (err) {
    next(err);
  }
};

export const obtenerArticuloPorIdHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const articulo = await articulosService.obtenerArticuloPorId(req.params.id);
    res.json(articulo);
  } catch (err) {
    next(err);
  }
};

export const actualizarArticuloHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const articulo = await articulosService.actualizarArticulo(req.params.id, req.body);
    res.json(articulo);
  } catch (err) {
    next(err);
  }
};

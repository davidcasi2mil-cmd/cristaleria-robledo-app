import { Response, NextFunction } from 'express';
import * as clientesService from '../services/clientes.service';
import { RequestConUsuario } from '../types';

export const crearClienteHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await clientesService.crearCliente(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
};

export const obtenerClientesHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const busqueda = req.query.busqueda as string | undefined;
    const resultado = await clientesService.obtenerClientes(pagina, limite, busqueda);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerClientePorIdHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await clientesService.obtenerClientePorId(req.params.id);
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

export const actualizarClienteHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await clientesService.actualizarCliente(req.params.id, req.body);
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

export const eliminarClienteHandler = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    await clientesService.eliminarCliente(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

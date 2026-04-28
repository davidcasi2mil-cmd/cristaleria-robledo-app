import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const registrarHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await authService.registrar(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const perfilHandler = async (req: any, res: Response): Promise<void> => {
  res.json({ usuario: req.usuario });
};

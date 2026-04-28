import { Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt.utils';
import { RequestConUsuario } from '../types';

export const autenticar = (req: RequestConUsuario, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autenticación requerido' });
      return;
    }
    const token = authHeader.substring(7);
    const payload = verificarToken(token);
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requerirRol = (...roles: ('ADMIN' | 'VENDEDOR')[]) => {
  return (req: RequestConUsuario, res: Response, next: NextFunction): void => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
      return;
    }
    next();
  };
};

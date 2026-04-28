import jwt from 'jsonwebtoken';
import { UsuarioPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET_VALUE = JWT_SECRET || 'secret-cambiar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generarToken = (payload: UsuarioPayload): string => {
  return jwt.sign(payload, JWT_SECRET_VALUE, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verificarToken = (token: string): UsuarioPayload => {
  return jwt.verify(token, JWT_SECRET_VALUE) as UsuarioPayload;
};

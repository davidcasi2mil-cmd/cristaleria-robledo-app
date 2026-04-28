import { Request } from 'express';

export interface UsuarioPayload {
  id: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR';
}

export interface RequestConUsuario extends Request {
  usuario?: UsuarioPayload;
}

export interface PaginacionQuery {
  pagina?: string;
  limite?: string;
}

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

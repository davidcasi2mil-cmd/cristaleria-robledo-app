import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generarToken } from '../utils/jwt.utils';
import { LoginInput, RegistroInput } from '../schemas/auth.schema';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const login = async (data: LoginInput) => {
  const usuario = await prisma.usuario.findUnique({
    where: { email: data.email },
  });

  if (!usuario || !usuario.activo) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const passwordValida = await bcrypt.compare(data.password, usuario.password);
  if (!passwordValida) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = generarToken({
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  };
};

export const registrar = async (data: RegistroInput) => {
  const existe = await prisma.usuario.findUnique({
    where: { email: data.email },
  });

  if (existe) {
    throw new AppError('Ya existe un usuario con ese email', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      email: data.email,
      nombre: data.nombre,
      password: hashedPassword,
      rol: data.rol,
    },
  });

  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  };
};

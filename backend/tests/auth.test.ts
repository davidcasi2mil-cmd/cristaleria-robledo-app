import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generarToken } from '../src/utils/jwt.utils';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  };
});

describe('Auth endpoints', () => {
  let tokenAdmin: string;
  let tokenVendedor: string;

  const mockUsuario = {
    id: 'user-1',
    email: 'admin@test.com',
    nombre: 'Admin',
    password: '',
    rol: 'ADMIN' as const,
    activo: true,
    creadoEn: new Date(),
  };

  beforeAll(async () => {
    mockUsuario.password = await bcrypt.hash('password123', 10);
    tokenAdmin = generarToken({ id: 'admin-1', email: 'admin@test.com', rol: 'ADMIN' });
    tokenVendedor = generarToken({ id: 'vendedor-1', email: 'vendedor@test.com', rol: 'VENDEDOR' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('debería retornar token con credenciales válidas', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.usuario.findUnique.mockResolvedValue(mockUsuario);

      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('debería retornar 401 con contraseña incorrecta', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.usuario.findUnique.mockResolvedValue(mockUsuario);

      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('debería retornar 401 con usuario inactivo', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.usuario.findUnique.mockResolvedValue({ ...mockUsuario, activo: false });

      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });

    it('debería retornar 400 con email inválido', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'no-es-email',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('debería retornar 401 con usuario no encontrado', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.usuario.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'noexiste@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/registro', () => {
    it('debería registrar un nuevo usuario (solo ADMIN)', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.usuario.findUnique.mockResolvedValue(null);
      mockPrismaInstance.usuario.create.mockResolvedValue({
        id: 'user-2',
        email: 'nuevo@test.com',
        nombre: 'Nuevo Usuario',
        rol: 'VENDEDOR',
      });

      const res = await request(app)
        .post('/api/auth/registro')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ email: 'nuevo@test.com', nombre: 'Nuevo Usuario', password: 'password123' });

      expect(res.status).toBe(201);
    });

    it('debería retornar 409 si el email ya existe', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.usuario.findUnique.mockResolvedValue(mockUsuario);

      const res = await request(app)
        .post('/api/auth/registro')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ email: 'admin@test.com', nombre: 'Duplicado', password: 'password123' });

      expect(res.status).toBe(409);
    });

    it('debería retornar 403 si el usuario no tiene rol ADMIN', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .set('Authorization', `Bearer ${tokenVendedor}`)
        .send({ email: 'nuevo@test.com', nombre: 'Nuevo', password: 'password123' });

      expect(res.status).toBe(403);
    });

    it('debería retornar 401 sin token', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({ email: 'nuevo@test.com', nombre: 'Nuevo', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/perfil', () => {
    it('debería retornar el perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('usuario');
    });

    it('debería retornar 401 con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).toBe(401);
    });
  });
});

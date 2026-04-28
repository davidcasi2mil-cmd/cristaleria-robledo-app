import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
});

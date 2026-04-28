import request from 'supertest';
import app from '../src/app';
import { generarToken } from '../src/utils/jwt.utils';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    cliente: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  };
});

describe('Clientes endpoints', () => {
  let tokenAdmin: string;
  let tokenVendedor: string;

  beforeAll(() => {
    tokenAdmin = generarToken({ id: 'admin-1', email: 'admin@test.com', rol: 'ADMIN' });
    tokenVendedor = generarToken({ id: 'vendedor-1', email: 'vendedor@test.com', rol: 'VENDEDOR' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/clientes', () => {
    it('debería requerir autenticación', async () => {
      const res = await request(app).get('/api/clientes');
      expect(res.status).toBe(401);
    });

    it('debería retornar lista de clientes', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      const mockClientes = [{ id: '1', nombre: 'Cliente Test', activo: true }];
      mockPrismaInstance.$transaction.mockResolvedValue([mockClientes, 1]);

      const res = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('datos');
    });
  });

  describe('POST /api/clientes', () => {
    it('debería crear un cliente', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(null);
      mockPrismaInstance.cliente.create.mockResolvedValue({
        id: 'cliente-1',
        nombre: 'Juan Pérez',
        telefono: '3001234567',
        email: 'juan@test.com',
      });

      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nombre: 'Juan Pérez', telefono: '3001234567', email: 'juan@test.com' });

      expect(res.status).toBe(201);
    });

    it('debería validar datos requeridos', async () => {
      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });
});

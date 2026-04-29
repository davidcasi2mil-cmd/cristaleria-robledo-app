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

  const mockCliente = { id: 'cliente-1', nombre: 'Juan Pérez', telefono: '3001234567', email: 'juan@test.com', activo: true };

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

    it('debería retornar lista filtrada por búsqueda', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.$transaction.mockResolvedValue([[mockCliente], 1]);

      const res = await request(app)
        .get('/api/clientes?busqueda=Juan')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('datos');
    });

    it('debería manejar errores inesperados con 500', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.$transaction.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/clientes', () => {
    it('debería crear un cliente', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(null);
      mockPrismaInstance.cliente.create.mockResolvedValue(mockCliente);

      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nombre: 'Juan Pérez', telefono: '3001234567', email: 'juan@test.com' });

      expect(res.status).toBe(201);
    });

    it('debería crear un cliente sin email', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.create.mockResolvedValue({ id: 'cliente-2', nombre: 'Sin Email', activo: true });

      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nombre: 'Sin Email' });

      expect(res.status).toBe(201);
    });

    it('debería retornar 409 si el email ya existe', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(mockCliente);

      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nombre: 'Otro Cliente', email: 'juan@test.com' });

      expect(res.status).toBe(409);
    });

    it('debería validar datos requeridos', async () => {
      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('debería retornar un cliente por id', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(mockCliente);

      const res = await request(app)
        .get('/api/clientes/cliente-1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/clientes/nonexistent')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
    });

    it('debería retornar 404 si el cliente está inactivo', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue({ ...mockCliente, activo: false });

      const res = await request(app)
        .get('/api/clientes/cliente-1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('debería actualizar un cliente', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(mockCliente);
      mockPrismaInstance.cliente.update.mockResolvedValue({ ...mockCliente, nombre: 'Juan Actualizado' });

      const res = await request(app)
        .put('/api/clientes/cliente-1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nombre: 'Juan Actualizado' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    it('debería eliminar (desactivar) un cliente', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(mockCliente);
      mockPrismaInstance.cliente.update.mockResolvedValue({ ...mockCliente, activo: false });

      const res = await request(app)
        .delete('/api/clientes/cliente-1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(204);
    });
  });
});

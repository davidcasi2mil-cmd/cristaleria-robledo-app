import request from 'supertest';
import app from '../src/app';
import { generarToken } from '../src/utils/jwt.utils';
import { calcularOrden } from '../src/services/calculo.service';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    cliente: { findUnique: jest.fn() },
    orden: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
    Prisma: {
      Decimal: jest.fn().mockImplementation((v: any) => ({ value: v })),
    },
  };
});

describe('Servicio de cálculo', () => {
  describe('calcularOrden', () => {
    it('debería calcular subtotal, descuento y total correctamente', () => {
      const lineas = [
        { descripcion: 'Vidrio 4mm 1x1m', cantidad: 2, precioUnit: 50000 },
        { descripcion: 'Instalación', cantidad: 1, precioUnit: 30000 },
      ];

      const resultado = calcularOrden(lineas, 10);

      expect(resultado.subtotal).toBe(130000);
      expect(resultado.descuentoMonto).toBe(13000);
      expect(resultado.total).toBe(117000);
    });

    it('debería calcular sin descuento', () => {
      const lineas = [{ descripcion: 'Vidrio', cantidad: 1, precioUnit: 100000 }];
      const resultado = calcularOrden(lineas, 0);
      expect(resultado.total).toBe(100000);
    });

    it('debería calcular subtotales de cada línea', () => {
      const lineas = [{ descripcion: 'Vidrio', cantidad: 3, precioUnit: 25000 }];
      const resultado = calcularOrden(lineas);
      expect(resultado.lineas[0].subtotal).toBe(75000);
    });
  });
});

describe('Ordenes endpoints', () => {
  let tokenAdmin: string;

  const mockOrden = {
    id: 'orden-1',
    clienteId: 'cliente-1',
    usuarioId: 'user-1',
    estado: 'PENDIENTE',
    notas: null,
    subtotal: { value: 50000 },
    descuento: { value: 0 },
    total: { value: 50000 },
    cliente: { id: 'cliente-1', nombre: 'Cliente Test' },
    usuario: { id: 'user-1', nombre: 'Admin', email: 'admin@test.com' },
    lineas: [],
    creadoEn: new Date().toISOString(),
  };

  beforeAll(() => {
    tokenAdmin = generarToken({ id: 'admin-1', email: 'admin@test.com', rol: 'ADMIN' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ordenes', () => {
    it('debería requerir autenticación', async () => {
      const res = await request(app).get('/api/ordenes');
      expect(res.status).toBe(401);
    });

    it('debería retornar lista de ordenes', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.$transaction.mockResolvedValue([[mockOrden], 1]);

      const res = await request(app)
        .get('/api/ordenes')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('datos');
    });

    it('debería filtrar por búsqueda y estado', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app)
        .get('/api/ordenes?busqueda=test&estado=PENDIENTE')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/ordenes', () => {
    it('debería crear una orden', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue({ id: 'cliente-1', activo: true });
      mockPrismaInstance.$transaction.mockImplementation(async (fn: any) => {
        const txMock = { orden: { create: jest.fn().mockResolvedValue(mockOrden) } };
        return fn(txMock);
      });

      const res = await request(app)
        .post('/api/ordenes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          clienteId: 'cliente-1',
          lineas: [{ descripcion: 'Vidrio 4mm', cantidad: 1, precioUnit: 50000 }],
        });

      expect(res.status).toBe(201);
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/ordenes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          clienteId: 'nonexistent',
          lineas: [{ descripcion: 'Vidrio', cantidad: 1, precioUnit: 50000 }],
        });

      expect(res.status).toBe(404);
    });

    it('debería retornar 404 si el cliente está inactivo', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.cliente.findUnique.mockResolvedValue({ id: 'cliente-1', activo: false });

      const res = await request(app)
        .post('/api/ordenes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          clienteId: 'cliente-1',
          lineas: [{ descripcion: 'Vidrio', cantidad: 1, precioUnit: 50000 }],
        });

      expect(res.status).toBe(404);
    });

    it('debería validar datos requeridos', async () => {
      const res = await request(app)
        .post('/api/ordenes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/ordenes/:id', () => {
    it('debería retornar una orden por id', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.orden.findUnique.mockResolvedValue(mockOrden);

      const res = await request(app)
        .get('/api/ordenes/orden-1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
    });

    it('debería retornar 404 si la orden no existe', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.orden.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/ordenes/nonexistent')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/ordenes/:id', () => {
    it('debería actualizar una orden', async () => {
      const mockPrismaInstance = new (require('@prisma/client').PrismaClient)();
      mockPrismaInstance.orden.findUnique.mockResolvedValue(mockOrden);
      mockPrismaInstance.orden.update.mockResolvedValue({ ...mockOrden, estado: 'EN_PROCESO' });

      const res = await request(app)
        .put('/api/ordenes/orden-1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ estado: 'EN_PROCESO' });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/ordenes/calcular', () => {
    it('debería calcular el total de una orden', async () => {
      const res = await request(app)
        .post('/api/ordenes/calcular')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          lineas: [{ descripcion: 'Vidrio', cantidad: 2, precioUnit: 50000 }],
          descuento: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
    });

    it('debería retornar 400 si no hay líneas', async () => {
      const res = await request(app)
        .post('/api/ordenes/calcular')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ lineas: [] });

      expect(res.status).toBe(400);
    });
  });
});

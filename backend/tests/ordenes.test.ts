import { calcularOrden } from '../src/services/calculo.service';

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

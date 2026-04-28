import { LineaOrdenInput } from '../schemas/ordenes.schema';

export interface ResultadoCalculo {
  subtotal: number;
  descuentoMonto: number;
  total: number;
  lineas: Array<{ subtotal: number } & LineaOrdenInput>;
}

/**
 * Calcula los totales de una orden con sus líneas.
 * El servidor es la fuente canónica de los cálculos.
 */
export const calcularOrden = (
  lineas: LineaOrdenInput[],
  descuentoPorcentaje: number = 0,
): ResultadoCalculo => {
  const lineasCalculadas = lineas.map((linea) => ({
    ...linea,
    subtotal: Number((linea.cantidad * linea.precioUnit).toFixed(2)),
  }));

  const subtotal = Number(
    lineasCalculadas.reduce((acc, l) => acc + l.subtotal, 0).toFixed(2),
  );

  const descuentoMonto = Number(((subtotal * descuentoPorcentaje) / 100).toFixed(2));
  const total = Number((subtotal - descuentoMonto).toFixed(2));

  return { subtotal, descuentoMonto, total, lineas: lineasCalculadas };
};

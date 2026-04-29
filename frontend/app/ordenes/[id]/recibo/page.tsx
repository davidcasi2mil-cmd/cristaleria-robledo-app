'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

interface LineaOrden {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

interface Orden {
  id: string;
  numero: number;
  estado: string;
  subtotal: number;
  descuento: number;
  descuentoMonto: number;
  total: number;
  notas?: string;
  creadoEn: string;
  cliente: { id: string; nombre: string; telefono?: string; email?: string; direccion?: string };
  lineas: LineaOrden[];
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export default function ReciboPage({ params }: { params: { id: string } }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
      return;
    }

    const fetchOrden = async () => {
      try {
        const res = await api.get(`/ordenes/${params.id}`);
        setOrden(res.data.orden ?? res.data);
      } catch {
        setError('No se pudo cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrden();
  }, [token, router, params.id]);

  const handleExportPDF = async () => {
    if (!orden) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Cristalería Robledo', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Recibo de Orden #${orden.numero}`, 105, 30, { align: 'center' });
    doc.text(`Fecha: ${new Date(orden.creadoEn).toLocaleDateString('es-ES')}`, 105, 38, { align: 'center' });

    doc.setFontSize(11);
    doc.text('Cliente:', 14, 52);
    doc.text(orden.cliente.nombre, 14, 60);
    if (orden.cliente.telefono) doc.text(`Tel: ${orden.cliente.telefono}`, 14, 67);
    if (orden.cliente.email) doc.text(`Email: ${orden.cliente.email}`, 14, 74);

    doc.text('Estado: ' + (ESTADO_LABELS[orden.estado] ?? orden.estado), 140, 52);

    // Encabezado tabla
    let y = 90;
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.text('Descripción', 16, y);
    doc.text('Cant.', 110, y, { align: 'right' });
    doc.text('P. Unit.', 140, y, { align: 'right' });
    doc.text('Subtotal', 196, y, { align: 'right' });

    y += 8;
    orden.lineas.forEach((linea) => {
      doc.text(linea.descripcion.substring(0, 50), 16, y);
      doc.text(String(linea.cantidad), 110, y, { align: 'right' });
      doc.text(`€${Number(linea.precioUnit).toFixed(2)}`, 140, y, { align: 'right' });
      doc.text(`€${Number(linea.subtotal).toFixed(2)}`, 196, y, { align: 'right' });
      y += 8;
    });

    y += 6;
    doc.line(14, y, 196, y);
    y += 6;
    doc.text(`Subtotal: €${Number(orden.subtotal).toFixed(2)}`, 196, y, { align: 'right' });
    if (Number(orden.descuento) > 0) {
      y += 7;
      doc.text(`Descuento (${orden.descuento}%): -€${Number(orden.descuentoMonto).toFixed(2)}`, 196, y, { align: 'right' });
    }
    y += 7;
    doc.setFontSize(13);
    doc.text(`TOTAL: €${Number(orden.total).toFixed(2)}`, 196, y, { align: 'right' });

    if (orden.notas) {
      y += 14;
      doc.setFontSize(10);
      doc.text('Notas:', 14, y);
      doc.text(orden.notas.substring(0, 100), 14, y + 7);
    }

    doc.save(`recibo-orden-${orden.numero}.pdf`);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando...</div>;
  }

  if (error || !orden) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Orden no encontrada'}</p>
        <Link href="/ordenes" className="text-blue-700 hover:underline">
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Botones de acción (no se imprimen) */}
      <div className="no-print flex gap-3 mb-6">
        <Link
          href={`/ordenes/${orden.id}`}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors"
        >
          ← Volver al detalle
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Recibo imprimible */}
      <div className="bg-white max-w-2xl mx-auto shadow border rounded-lg p-8 print:shadow-none print:border-none">
        {/* Encabezado */}
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-700">🪟 Cristalería Robledo</h1>
          <h2 className="text-lg text-gray-700 mt-1">Recibo de Orden</h2>
        </div>

        {/* Info básica */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Nº de Orden</p>
            <p className="font-bold text-lg">#{orden.numero}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Fecha</p>
            <p className="font-medium">
              {new Date(orden.creadoEn).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Cliente</p>
            <p className="font-medium">{orden.cliente.nombre}</p>
            {orden.cliente.telefono && <p className="text-gray-600">📞 {orden.cliente.telefono}</p>}
            {orden.cliente.email && <p className="text-gray-600">✉️ {orden.cliente.email}</p>}
            {orden.cliente.direccion && <p className="text-gray-600">📍 {orden.cliente.direccion}</p>}
          </div>
          <div className="text-right">
            <p className="text-gray-500">Estado</p>
            <p className="font-medium">{ESTADO_LABELS[orden.estado] ?? orden.estado}</p>
          </div>
        </div>

        {/* Líneas */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2">Descripción</th>
              <th className="text-right px-3 py-2">Cant.</th>
              <th className="text-right px-3 py-2">P. Unit.</th>
              <th className="text-right px-3 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orden.lineas.map((linea) => (
              <tr key={linea.id}>
                <td className="px-3 py-2">{linea.descripcion}</td>
                <td className="px-3 py-2 text-right">{linea.cantidad}</td>
                <td className="px-3 py-2 text-right">€{Number(linea.precioUnit).toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-medium">€{Number(linea.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="border-t pt-4 flex flex-col items-end space-y-1 text-sm">
          <div className="flex justify-between w-52">
            <span className="text-gray-500">Subtotal:</span>
            <span>€{Number(orden.subtotal).toFixed(2)}</span>
          </div>
          {Number(orden.descuento) > 0 && (
            <div className="flex justify-between w-52 text-red-600">
              <span>Descuento ({orden.descuento}%):</span>
              <span>-€{Number(orden.descuentoMonto).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-52 font-bold text-base border-t pt-1">
            <span>TOTAL:</span>
            <span className="text-blue-700">€{Number(orden.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Notas */}
        {orden.notas && (
          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-500 font-medium mb-1">Notas:</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{orden.notas}</p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          Gracias por confiar en Cristalería Robledo
        </div>
      </div>
    </div>
  );
}

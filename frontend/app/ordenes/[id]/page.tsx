'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

interface LineaOrden {
  id: string;
  tipo: string;
  referencia?: string;
  descripcion: string;
  cantidad: number;
  precioUnit: number;
  perfil?: number;
  ancho?: number;
  alto?: number;
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
  anchoOriginal?: number;
  altoOriginal?: number;
  creadoEn: string;
  cliente: { id: string; nombre: string; telefono?: string; email?: string };
  lineas: LineaOrden[];
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

const TIPO_LABELS: Record<string, string> = {
  CRISTAL: 'Cristal',
  MOLDURA: 'Moldura',
  PASSPARTOUS: 'Passpartous',
  ACCESORIO: 'Accesorio',
  EXTRA: 'Extra',
};

export default function DetalleOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const { id } = use(params);
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
        const res = await api.get(`/ordenes/${id}`);
        setOrden(res.data.orden ?? res.data);
      } catch {
        setError('No se pudo cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrden();
  }, [token, router, id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando...</div>;
  }

  if (error || !orden) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Orden no encontrada'}</p>
        <Link href="/ordenes" className="text-blue-700 hover:underline">
          ← Volver al historial
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/ordenes" className="text-blue-700 hover:underline text-sm">
            ← Volver al historial
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Orden #{orden.numero}
          </h1>
        </div>
        <div className="flex gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${ESTADO_COLORS[orden.estado] ?? 'bg-gray-100 text-gray-700'}`}>
            {ESTADO_LABELS[orden.estado] ?? orden.estado}
          </span>
          <Link
            href={`/ordenes/${orden.id}/recibo`}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            🖨️ Imprimir Recibo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Cliente */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Cliente</h2>
          <p className="font-medium">{orden.cliente.nombre}</p>
          {orden.cliente.telefono && (
            <p className="text-gray-500 text-sm">📞 {orden.cliente.telefono}</p>
          )}
          {orden.cliente.email && (
            <p className="text-gray-500 text-sm">✉️ {orden.cliente.email}</p>
          )}
        </div>

        {/* Medida original */}
        {(orden.anchoOriginal || orden.altoOriginal) && (
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Medida Original</h2>
            <p className="text-gray-700 text-lg font-medium">
              {Number(orden.anchoOriginal).toFixed(1)} × {Number(orden.altoOriginal).toFixed(1)} cm
            </p>
          </div>
        )}

        {/* Detalles */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Detalles</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha:</span>
              <span>{new Date(orden.creadoEn).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Número:</span>
              <span className="font-medium">#{orden.numero}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Líneas */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-700">Artículos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ref.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">P. unit.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Uds/Perfil</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ancho</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Alto</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orden.lineas.map((linea) => {
                const mostrarPerfil = linea.tipo === 'MOLDURA' || linea.tipo === 'PASSPARTOUS';
                return (
                  <tr key={linea.id}>
                    <td className="px-4 py-3">{TIPO_LABELS[linea.tipo] ?? linea.tipo}</td>
                    <td className="px-4 py-3 text-gray-500">{linea.referencia ?? '–'}</td>
                    <td className="px-4 py-3">{linea.descripcion}</td>
                    <td className="px-4 py-3 text-right">€{Number(linea.precioUnit).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {mostrarPerfil
                        ? linea.perfil != null ? `${Number(linea.perfil).toFixed(2)} m` : '–'
                        : linea.cantidad}
                    </td>
                    <td className="px-4 py-3 text-right">{linea.ancho != null ? `${Number(linea.ancho).toFixed(1)} cm` : '–'}</td>
                    <td className="px-4 py-3 text-right">{linea.alto != null ? `${Number(linea.alto).toFixed(1)} cm` : '–'}</td>
                    <td className="px-4 py-3 text-right font-medium">€{Number(linea.subtotal).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-4 border-t">
          <div className="flex flex-col items-end space-y-1 text-sm">
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
              <span>Total:</span>
              <span className="text-blue-700">€{Number(orden.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      {orden.notas && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="font-semibold text-gray-700 mb-2">Notas</h2>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{orden.notas}</p>
        </div>
      )}
    </div>
  );
}

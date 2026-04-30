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
  PENDIENTE: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  EN_PROCESO: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  COMPLETADA: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CANCELADA: 'bg-red-50 text-red-600 ring-1 ring-red-200',
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
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando orden...
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium mb-4">{error || 'Orden no encontrada'}</p>
        <Link href="/ordenes" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline">
          ← Volver al historial
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/ordenes" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
            ← Historial de órdenes
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold text-gray-900">
              Orden #{orden.numero}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[orden.estado] ?? 'bg-gray-100 text-gray-600'}`}>
              {ESTADO_LABELS[orden.estado] ?? orden.estado}
            </span>
          </div>
        </div>
        <Link
          href={`/ordenes/${orden.id}/recibo`}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Recibo
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Cliente */}
        <div className="card p-5">
          <p className="label mb-3">Cliente</p>
          <p className="font-semibold text-gray-900 text-base">{orden.cliente.nombre}</p>
          {orden.cliente.telefono && (
            <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {orden.cliente.telefono}
            </p>
          )}
          {orden.cliente.email && (
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {orden.cliente.email}
            </p>
          )}
        </div>

        {/* Medida original */}
        {(orden.anchoOriginal || orden.altoOriginal) && (
          <div className="card p-5">
            <p className="label mb-3">Medida Original</p>
            <p className="text-2xl font-bold text-gray-900">
              {Number(orden.anchoOriginal).toFixed(1)} <span className="text-gray-400 font-normal text-lg">×</span> {Number(orden.altoOriginal).toFixed(1)}
              <span className="text-sm font-normal text-gray-500 ml-1">cm</span>
            </p>
          </div>
        )}

        {/* Detalles */}
        <div className="card p-5">
          <p className="label mb-3">Información</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Fecha</span>
              <span className="font-medium text-gray-800">
                {new Date(orden.creadoEn).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Número</span>
              <span className="font-semibold text-gray-900">#{orden.numero}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lines table */}
      <div className="card mb-6 overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Artículos</h2>
          <span className="text-sm text-gray-500">{orden.lineas.length} líneas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref.</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">P. unit.</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Uds/Perfil</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ancho</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alto</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orden.lineas.map((linea) => {
                const mostrarPerfil = linea.tipo === 'MOLDURA' || linea.tipo === 'PASSPARTOUS';
                return (
                  <tr key={linea.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        {TIPO_LABELS[linea.tipo] ?? linea.tipo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{linea.referencia ?? '–'}</td>
                    <td className="px-5 py-3.5 text-gray-800">{linea.descripcion}</td>
                    <td className="px-5 py-3.5 text-right text-gray-700">€{Number(linea.precioUnit).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-700">
                      {mostrarPerfil
                        ? linea.perfil != null ? `${Number(linea.perfil).toFixed(2)} m` : '–'
                        : linea.cantidad}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{linea.ancho != null ? `${Number(linea.ancho).toFixed(1)} cm` : '–'}</td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{linea.alto != null ? `${Number(linea.alto).toFixed(1)} cm` : '–'}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">€{Number(linea.subtotal).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex justify-end">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>€{Number(orden.subtotal).toFixed(2)}</span>
              </div>
              {Number(orden.descuento) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento ({orden.descuento}%)</span>
                  <span>–€{Number(orden.descuentoMonto).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-indigo-600">€{Number(orden.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {orden.notas && (
        <div className="card p-5">
          <p className="label mb-2">Notas</p>
          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{orden.notas}</p>
        </div>
      )}
    </div>
  );
}

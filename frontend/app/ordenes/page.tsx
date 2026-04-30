'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

interface Orden {
  id: string;
  numero: number;
  estado: string;
  total: number;
  creadoEn: string;
  cliente: { nombre: string };
}

const ESTADOS = ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];

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

const POR_PAGINA = 10;

export default function HistorialOrdenesPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrdenes = useCallback(async (busq: string, estado: string, pag: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        pagina: pag,
        limite: POR_PAGINA,
      };
      if (busq) params.busqueda = busq;
      if (estado !== 'TODOS') params.estado = estado;

      const res = await api.get('/ordenes', { params });
      setOrdenes(res.data.ordenes ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
      return;
    }
    fetchOrdenes(busqueda, estadoFiltro, pagina);
  }, [token, router, fetchOrdenes, pagina, estadoFiltro]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBusqueda = (valor: string) => {
    setBusqueda(valor);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPagina(1);
      fetchOrdenes(valor, estadoFiltro, 1);
    }, 300);
  };

  const handleEstado = (estado: string) => {
    setEstadoFiltro(estado);
    setPagina(1);
    fetchOrdenes(busqueda, estado, 1);
  };

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Órdenes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} órdenes en total</p>
        </div>
        <Link href="/ordenes/nueva" className="btn-primary flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Orden
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            placeholder="Buscar por cliente o número..."
            className="input-field pl-9"
          />
        </div>
        <select
          value={estadoFiltro}
          onChange={(e) => handleEstado(e.target.value)}
          className="select-field w-auto min-w-40"
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e === 'TODOS' ? 'Todos los estados' : ESTADO_LABELS[e]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando órdenes...
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No se encontraron órdenes</p>
            <p className="text-sm mt-1">Prueba ajustando los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nº</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">#{orden.numero}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{orden.cliente?.nombre}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(orden.creadoEn).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[orden.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ESTADO_LABELS[orden.estado] ?? orden.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-semibold text-gray-900">
                      €{Number(orden.total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-center">
                      <Link
                        href={`/ordenes/${orden.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, total)} de {total}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

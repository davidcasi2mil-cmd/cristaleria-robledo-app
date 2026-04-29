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
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Órdenes</h1>
        <Link
          href="/ordenes/nueva"
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition-colors text-sm"
        >
          + Nueva Orden
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow border p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => handleBusqueda(e.target.value)}
          placeholder="Buscar por cliente o número..."
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-48"
        />
        <select
          value={estadoFiltro}
          onChange={(e) => handleEstado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e === 'TODOS' ? 'Todos los estados' : ESTADO_LABELS[e]}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : ordenes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron órdenes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nº</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">#{orden.numero}</td>
                    <td className="px-4 py-3 text-sm">{orden.cliente?.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(orden.creadoEn).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[orden.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                        {ESTADO_LABELS[orden.estado] ?? orden.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      €{Number(orden.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <Link
                        href={`/ordenes/${orden.id}`}
                        className="text-blue-700 hover:underline text-sm"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, total)} de {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
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

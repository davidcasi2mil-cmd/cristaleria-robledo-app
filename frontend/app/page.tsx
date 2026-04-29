'use client';

import { useEffect, useState } from 'react';
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

interface Stats {
  totalOrdenes: number;
  ordenesRecientes: Orden[];
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

export default function HomePage() {
  const { usuario, token } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const [ordenesRes, recientesRes] = await Promise.all([
          api.get('/ordenes'),
          api.get('/ordenes?limite=5'),
        ]);
        setStats({
          totalOrdenes: ordenesRes.data.total ?? ordenesRes.data.ordenes?.length ?? 0,
          ordenesRecientes: recientesRes.data.ordenes ?? [],
        });
      } catch {
        setStats({ totalOrdenes: 0, ordenesRecientes: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, router]);

  if (!token && typeof window !== 'undefined' && !localStorage.getItem('cr_token')) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Bienvenido{usuario ? `, ${usuario.nombre}` : ''}
      </h1>
      <p className="text-gray-500 mb-6">Panel de control de Cristalería Robledo</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/ordenes/nueva"
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg p-6 shadow transition-colors flex flex-col items-center gap-2"
        >
          <span className="text-3xl">➕</span>
          <span className="font-semibold text-lg">Nueva Orden</span>
          <span className="text-blue-200 text-sm">Crear una nueva orden de trabajo</span>
        </Link>

        <Link
          href="/ordenes"
          className="bg-white hover:bg-gray-50 text-gray-800 rounded-lg p-6 shadow border transition-colors flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📋</span>
          <span className="font-semibold text-lg">Ver Historial</span>
          <span className="text-gray-500 text-sm">Consultar órdenes anteriores</span>
        </Link>

        <div className="bg-white rounded-lg p-6 shadow border flex flex-col items-center gap-2">
          <span className="text-3xl">📊</span>
          <span className="font-semibold text-lg text-gray-800">Total Órdenes</span>
          {loading ? (
            <span className="text-gray-400">Cargando...</span>
          ) : (
            <span className="text-3xl font-bold text-blue-700">{stats?.totalOrdenes ?? 0}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Órdenes Recientes</h2>
          <Link href="/ordenes" className="text-blue-700 hover:underline text-sm">
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : stats?.ordenesRecientes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay órdenes todavía</div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.ordenesRecientes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/ordenes/${orden.id}`} className="text-blue-700 hover:underline font-medium">
                        #{orden.numero}
                      </Link>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  const { usuario, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
            🪟 Cristalería Robledo
          </Link>
          {usuario && (
            <div className="flex gap-4">
              <Link href="/" className="hover:text-blue-200 transition-colors text-sm">
                Inicio
              </Link>
              <Link href="/ordenes/nueva" className="hover:text-blue-200 transition-colors text-sm">
                Nueva Orden
              </Link>
              <Link href="/ordenes" className="hover:text-blue-200 transition-colors text-sm">
                Historial
              </Link>
            </div>
          )}
        </div>
        {usuario && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-200">
              {usuario.nombre}
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-800 hover:bg-blue-900 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

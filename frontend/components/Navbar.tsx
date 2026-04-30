'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  const { usuario, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/ordenes/nueva', label: 'Nueva Orden' },
    { href: '/ordenes', label: 'Historial' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo + Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-lg hover:text-indigo-700 transition-colors">
              <span className="text-xl">🪟</span>
              <span className="hidden sm:block">Cristalería Robledo</span>
            </Link>

            {usuario && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ href, label }) => {
                  const isActive = pathname === href || (href !== '/ordenes/nueva' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* User + Logout */}
          {usuario && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-500 font-medium">
                {usuario.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-150 font-medium"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

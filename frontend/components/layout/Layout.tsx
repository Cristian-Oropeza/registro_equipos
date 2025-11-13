import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaFutbol, FaUsers, FaChevronDown, FaHeart } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';

// ============================================
// NAVBAR COMPONENT
// ============================================
const Navbar: React.FC = () => {
  const router = useRouter();
  const [equiposOpen, setEquiposOpen] = useState(false);
  const [jugadoresOpen, setJugadoresOpen] = useState(false);

  const isActive = (path: string): boolean => {
    return router.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <FaFutbol className="text-verde-primavera text-3xl" />
            <span className="text-xl font-bold text-azul-marino">
              Liga de Fútbol
            </span>
          </Link>

          {/* Links de navegación */}
          <div className="flex items-center space-x-8">
            {/* Inicio */}
            <Link
              href="/"
              className={`
                text-base font-medium transition-colors relative
                ${isActive('/') 
                  ? 'text-verde-primavera' 
                  : 'text-gray-700 hover:text-verde-primavera'
                }
              `}
            >
              Inicio
              {isActive('/') && (
                <span className="absolute -bottom-5 left-0 right-0 h-1 bg-verde-primavera rounded-t-full" />
              )}
            </Link>

            {/* Dropdown Equipos */}
            <div
              className="relative"
              onMouseEnter={() => setEquiposOpen(true)}
              onMouseLeave={() => setEquiposOpen(false)}
            >
              <button
                className={`
                  flex items-center space-x-1 text-base font-medium transition-colors relative
                  ${isActive('/equipos') || router.pathname.startsWith('/equipo/')
                    ? 'text-verde-primavera' 
                    : 'text-gray-700 hover:text-verde-primavera'
                  }
                `}
              >
                <span>Equipos</span>
                <FaChevronDown 
                  className={`text-xs transition-transform ${equiposOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {(isActive('/equipos') || router.pathname.startsWith('/equipo/')) && (
                <span className="absolute -bottom-5 left-0 right-0 h-1 bg-verde-primavera rounded-t-full" />
              )}

              {/* Dropdown menu */}
              {equiposOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slideInUp">
                  <Link
                    href="/equipos"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-verde-primavera hover:bg-opacity-10 hover:text-verde-primavera transition-colors"
                  >
                    <MdGroups className="text-xl" />
                    <span className="font-medium">Ver todos los equipos</span>
                  </Link>
                  <Link
                    href="/nuevoEquipo"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-verde-primavera hover:bg-opacity-10 hover:text-verde-primavera transition-colors"
                  >
                    <FaFutbol className="text-xl" />
                    <span className="font-medium">Registrar nuevo equipo</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Dropdown Jugadores */}
            <div
              className="relative"
              onMouseEnter={() => setJugadoresOpen(true)}
              onMouseLeave={() => setJugadoresOpen(false)}
            >
              <button
                className={`
                  flex items-center space-x-1 text-base font-medium transition-colors relative
                  ${isActive('/jugadores') || router.pathname.startsWith('/jugador/')
                    ? 'text-verde-primavera' 
                    : 'text-gray-700 hover:text-verde-primavera'
                  }
                `}
              >
                <span>Jugadores</span>
                <FaChevronDown 
                  className={`text-xs transition-transform ${jugadoresOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {(isActive('/jugadores') || router.pathname.startsWith('/jugador/')) && (
                <span className="absolute -bottom-5 left-0 right-0 h-1 bg-verde-primavera rounded-t-full" />
              )}

              {/* Dropdown menu */}
              {jugadoresOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slideInUp">
                  <Link
                    href="/jugadores"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-verde-primavera hover:bg-opacity-10 hover:text-verde-primavera transition-colors"
                  >
                    <FaUsers className="text-xl" />
                    <span className="font-medium">Ver todos los jugadores</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Icono y texto principal */}
          <div className="flex items-center space-x-2 text-gray-600">
            <FaFutbol className="text-verde-primavera text-lg" />
            <span className="text-sm font-medium">
              © {currentYear} Liga de Fútbol
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-sm">Sistema de Registro de Equipos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// LAYOUT COMPONENT (MAIN WRAPPER)
// ============================================
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar sticky */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
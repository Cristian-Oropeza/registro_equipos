import React from 'react';
import { FaFutbol, FaUsers } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
        {/* Hero section */}
        <div className="space-y-4 animate-fadeIn">
          <FaFutbol className="text-8xl text-verde-primavera mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-azul-marino">
            Bienvenido a la Liga de Fútbol
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema integral de registro y gestión de equipos y jugadores
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 animate-slideInUp">
          {/* Card Equipos */}
          <Link href="/equipos">
            <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-verde-primavera">
              <div className="flex flex-col items-center space-y-4 p-6">
                <MdGroups className="text-6xl text-juniper group-hover:text-verde-primavera transition-colors" />
                <h3 className="text-2xl font-bold text-azul-marino">
                  Equipos
                </h3>
                <p className="text-gray-600 text-center">
                  Explora todos los equipos registrados en la liga
                </p>
                <span className="text-verde-primavera font-semibold group-hover:underline">
                  Ver equipos →
                </span>
              </div>
            </div>
          </Link>

          {/* Card Jugadores */}
          <Link href="/jugadores">
            <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-juniper">
              <div className="flex flex-col items-center space-y-4 p-6">
                <FaUsers className="text-6xl text-verde-primavera group-hover:text-juniper transition-colors" />
                <h3 className="text-2xl font-bold text-azul-marino">
                  Jugadores
                </h3>
                <p className="text-gray-600 text-center">
                  Consulta la información de todos los jugadores
                </p>
                <span className="text-juniper font-semibold group-hover:underline">
                  Ver jugadores →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick action button */}
        <div className="mt-12 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/nuevoEquipo"
            className="inline-flex items-center space-x-2 bg-verde-primavera text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <FaFutbol />
            <span>Registrar Nuevo Equipo</span>
          </Link>
        </div>

        {/* Stats preview (opcional, puede ser dinámico después) */}
        <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-4xl font-bold text-verde-primavera">--</p>
            <p className="text-gray-600 mt-2">Equipos Registrados</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-juniper">--</p>
            <p className="text-gray-600 mt-2">Jugadores Activos</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-azul-marino">--</p>
            <p className="text-gray-600 mt-2">Partidos Jugados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
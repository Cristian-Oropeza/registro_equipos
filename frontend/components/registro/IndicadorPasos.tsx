import React from 'react';
import { Check } from 'lucide-react';

interface IndicadorPasosProps {
  pasoActual: number;
  pasos: string[];
}

const IndicadorPasos: React.FC<IndicadorPasosProps> = ({ pasoActual, pasos }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {pasos.map((paso, index) => {
          const numeroPaso = index + 1;
          const estaCompleto = numeroPaso < pasoActual;
          const esActual = numeroPaso === pasoActual;

          return (
            <React.Fragment key={numeroPaso}>
              {/* Círculo del paso */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    transition-all duration-300 border-2
                    ${estaCompleto 
                      ? 'bg-verde-primavera border-verde-primavera text-white' 
                      : esActual
                      ? 'bg-verde-primavera border-verde-primavera text-white scale-110 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {estaCompleto ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    numeroPaso
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium text-center
                    ${esActual ? 'text-verde-primavera' : estaCompleto ? 'text-gray-700' : 'text-gray-400'}
                  `}
                >
                  {paso}
                </span>
              </div>

              {/* Línea conectora (no mostrar después del último paso) */}
              {numeroPaso < pasos.length && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-2 mb-6">
                  <div
                    className={`h-full transition-all duration-300 ${
                      estaCompleto ? 'bg-verde-primavera' : 'bg-gray-300'
                    }`}
                    style={{ width: estaCompleto ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default IndicadorPasos;
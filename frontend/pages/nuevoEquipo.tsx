import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import IndicadorPasos from '@/components/registro/IndicadorPasos';
import PasoEquipo from '@/components/registro/PasoEquipo';
import PasoJugadores from '@/components/registro/PasoJugadores';
import PasoExtras from '@/components/registro/PasoExtras';
import { equipoService } from '@/services';
import { FormEquipo, FormJugador, FormExtrasJugador, RegistroEquipoCompleto } from '@/types';

const PASOS = ['Datos del Equipo', 'Agregar Jugadores', 'Extras (Opcional)', 'Finalizar'];

const RegistroEquipoPage = () => {
  const router = useRouter();
  const [pasoActual, setPasoActual] = useState(1);
  const [cargando, setCargando] = useState(false);

  // Datos del formulario
  const [datosEquipo, setDatosEquipo] = useState<FormEquipo | null>(null);
  const [jugadores, setJugadores] = useState<FormJugador[]>([]);
  const [extrasJugadores, setExtrasJugadores] = useState<Map<number, FormExtrasJugador>>(
    new Map()
  );

  // Handlers de navegación entre pasos
  const handleSiguientePaso1 = (datos: FormEquipo) => {
    setDatosEquipo(datos);
    setPasoActual(2);
  };

  const handleSiguientePaso2 = (jugadoresData: FormJugador[]) => {
    setJugadores(jugadoresData);
    setPasoActual(3);
  };

  const handleSiguientePaso3 = async (extras: Map<number, FormExtrasJugador>) => {
    setExtrasJugadores(extras);
    await enviarRegistro(extras);
  };

  const handleAnteriorPaso2 = () => {
    setPasoActual(1);
  };

  const handleAnteriorPaso3 = () => {
    setPasoActual(2);
  };

  // Enviar registro al backend
  const enviarRegistro = async (extras: Map<number, FormExtrasJugador>) => {
    if (!datosEquipo) return;

    try {
      setCargando(true);

      // Preparar jugadores con sus extras
      const jugadoresCompletos = jugadores.map((jugador, index) => {
        const extrasJugador = extras.get(index);
        return {
          nombre_completo: jugador.nombre_completo,
          sexo: jugador.sexo,
          fecha_nacimiento: jugador.fecha_nacimiento,
          peso: jugador.peso,
          estatura: jugador.estatura,
          apodo: jugador.apodo,
          posicion_id: jugador.posicion_id,
          ciudad_nacimiento_id: jugador.ciudad_nacimiento_id,
          anos_experiencia: jugador.anos_experiencia,
          correo_electronico: jugador.correo_electronico,
          pasatiempos: extrasJugador?.pasatiempos || [],
          musica_favorita: extrasJugador?.musica_favorita || [],
          redes_sociales: extrasJugador?.redes_sociales || [],
        };
      });

      // Datos del registro completo
      const datosRegistro: RegistroEquipoCompleto = {
        equipo: {
          nombre: datosEquipo.nombre,
          colores: datosEquipo.colores,
        },
        jugadores: jugadoresCompletos,
      };

      // Preparar archivos
      const archivos: {
        logotipo?: File;
        fotos?: Map<number, File>;
      } = {};

      // Logo del equipo
      if (datosEquipo.logotipo) {
        archivos.logotipo = datosEquipo.logotipo;
      }

      // Fotos de jugadores
      const fotosMap = new Map<number, File>();
      jugadores.forEach((jugador, index) => {
        if (jugador.foto) {
          fotosMap.set(index, jugador.foto);
        }
      });

      if (fotosMap.size > 0) {
        archivos.fotos = fotosMap;
      }

      // Enviar al backend
      await equipoService.registrarEquipo(datosRegistro, archivos);

      // Éxito
      toast.success('¡Equipo registrado exitosamente! Se han enviado los correos de confirmación.');
      
      // Redirigir a la lista de equipos
      setTimeout(() => {
        router.push('/equipos');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar equipo:', error);
      
      let mensaje = 'Error al registrar el equipo';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-verde-primavera mx-auto" />
          <h2 className="text-2xl font-bold">Registrando equipo...</h2>
          <p className="text-muted-foreground">
            Estamos procesando la información y enviando los correos de confirmación.
            <br />
            Por favor espera un momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Registrar Nuevo Equipo</h1>
        <p className="text-muted-foreground">
          Completa el formulario para registrar tu equipo en la liga
        </p>
      </div>

      {/* Indicador de pasos */}
      <IndicadorPasos pasoActual={pasoActual} pasos={PASOS} />

      {/* Contenido del paso actual */}
      <div className="mt-8">
        {pasoActual === 1 && (
          <PasoEquipo datosIniciales={datosEquipo || undefined} onSiguiente={handleSiguientePaso1} />
        )}

        {pasoActual === 2 && (
          <PasoJugadores
            jugadoresIniciales={jugadores}
            onSiguiente={handleSiguientePaso2}
            onAnterior={handleAnteriorPaso2}
          />
        )}

        {pasoActual === 3 && (
          <PasoExtras
            jugadores={jugadores}
            extrasIniciales={extrasJugadores}
            onSiguiente={handleSiguientePaso3}
            onAnterior={handleAnteriorPaso3}
          />
        )}
      </div>
    </div>
  );
};

export default RegistroEquipoPage;
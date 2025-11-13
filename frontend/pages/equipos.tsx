import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, Search, Users, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TarjetaEquipo from '@/components/equipo/TarjetaEquipo';
import ModalConfirmacion from '@/components/ui/ModalConfirmacion';
import { equipoService } from '@/services';
import { Equipo } from '@/types';

const EquiposPage: React.FC = () => {
  const router = useRouter();
  
  // Estados
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroJugadores, setFiltroJugadores] = useState('todos');
  
  // Modal de confirmación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [equipoAEliminar, setEquipoAEliminar] = useState<Equipo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Aplicar filtros (useCallback para evitar warning de dependencias)
  const aplicarFiltros = useCallback(() => {
    let resultados = [...equipos];

    // Filtro por nombre
    if (searchTerm.trim()) {
      resultados = resultados.filter(equipo =>
        equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por cantidad de jugadores
    if (filtroJugadores !== 'todos') {
      resultados = resultados.filter(equipo => {
        const totalJugadores = equipo.total_jugadores || equipo.jugadores?.length || 0;
        
        switch (filtroJugadores) {
          case 'minimo':
            return totalJugadores >= 8 && totalJugadores <= 11;
          case 'moderado':
            return totalJugadores >= 12 && totalJugadores <= 18;
          case 'completo':
            return totalJugadores >= 19 && totalJugadores <= 25;
          default:
            return true;
        }
      });
    }

    setEquiposFiltrados(resultados);
  }, [equipos, searchTerm, filtroJugadores]);

  // Cargar equipos al montar el componente
  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        setLoading(true);
        const data = await equipoService.obtenerEquipos();
        setEquipos(data);
        setEquiposFiltrados(data);
      } catch (error) {
        console.error('Error al cargar equipos:', error);
        const mensaje = error instanceof Error ? error.message : 'Error al cargar los equipos';
        toast.error(mensaje);
      } finally {
        setLoading(false);
      }
    };

    cargarEquipos();
  }, []);

  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const handleEliminarClick = (id: number) => {
    const equipo = equipos.find(e => e.id === id);
    if (equipo) {
      setEquipoAEliminar(equipo);
      setModalEliminar(true);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!equipoAEliminar) return;

    try {
      setEliminando(true);
      await equipoService.eliminarEquipo(equipoAEliminar.id);
      
      toast.success(`Equipo "${equipoAEliminar.nombre}" eliminado exitosamente`);
      
      // Actualizar lista de equipos
      setEquipos(prev => prev.filter(e => e.id !== equipoAEliminar.id));
      setModalEliminar(false);
      setEquipoAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar el equipo';
      toast.error(mensaje);
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelarEliminar = () => {
    setModalEliminar(false);
    setEquipoAEliminar(null);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroJugadores('todos');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-verde-primavera animate-spin" />
        <p className="text-gray-600 text-lg">Cargando equipos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y botón agregar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-azul-marino">Equipos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los equipos de la liga
          </p>
        </div>
        <Button
          onClick={() => router.push('/nuevoEquipo')}
          className="bg-verde-primavera hover:bg-verde-primavera/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Equipo
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre del equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por cantidad de jugadores */}
          <div className="flex items-center space-x-2">
            <Users className="text-gray-400 w-5 h-5 flex-shrink-0" />
            <Select value={filtroJugadores} onValueChange={setFiltroJugadores}>
              <SelectTrigger>
                <SelectValue placeholder="Cantidad de jugadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="minimo">Mínimo (8-11)</SelectItem>
                <SelectItem value="moderado">Moderado (12-18)</SelectItem>
                <SelectItem value="completo">Completo (19-25)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {(searchTerm || filtroJugadores !== 'todos') && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-verde-primavera">{equiposFiltrados.length}</span> de {equipos.length} equipos
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="text-gray-600 hover:text-verde-primavera"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Grid de equipos */}
      {equiposFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {equiposFiltrados.map((equipo) => (
            <TarjetaEquipo
              key={equipo.id}
              equipo={equipo}
              onEliminar={handleEliminarClick}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
          <AlertCircle className="w-16 h-16 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700">
            {searchTerm || filtroJugadores !== 'todos' 
              ? 'No se encontraron equipos' 
              : 'No hay equipos registrados'}
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            {searchTerm || filtroJugadores !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda para ver más resultados.'
              : 'Comienza registrando tu primer equipo en la liga.'}
          </p>
          {(searchTerm || filtroJugadores !== 'todos') ? (
            <Button
              variant="outline"
              onClick={limpiarFiltros}
              className="mt-4"
            >
              Limpiar filtros
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/nuevoEquipo')}
              className="mt-4 bg-verde-primavera hover:bg-verde-primavera/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primer Equipo
            </Button>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ModalConfirmacion
        open={modalEliminar}
        onOpenChange={setModalEliminar}
        onConfirm={handleConfirmarEliminar}
        titulo="¿Eliminar equipo?"
        descripcion={
          equipoAEliminar
            ? `¿Estás seguro de eliminar el equipo "${equipoAEliminar.nombre}"? Esto eliminará también a todos sus jugadores (${equipoAEliminar.total_jugadores || equipoAEliminar.jugadores?.length || 0} jugadores). Esta acción no se puede deshacer.`
            : ''
        }
        textoConfirmar={eliminando ? 'Eliminando...' : 'Eliminar'}
        textoCancelar="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default EquiposPage;
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Loader2, 
  Users,
  X,
  AlertCircle
} from 'lucide-react';
import TarjetaJugador from '@/components/jugador/TarjetaJugador';
import ModalConfirmacion from '@/components/ui/ModalConfirmacion';
import { jugadorService, equipoService, catalogoService } from '@/services';
import { Jugador, Equipo, Posicion, Ciudad, Sexo } from '@/types';

const JugadoresPage = () => {
  // Estados principales
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState<string>('');
  const [filtroSexo, setFiltroSexo] = useState<string>('');
  const [filtroPosicion, setFiltroPosicion] = useState<string>('');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('');

  // Estados del modal
  const [modalEliminar, setModalEliminar] = useState(false);
  const [jugadorAEliminar, setJugadorAEliminar] = useState<number | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [jugadoresData, equiposData, posicionesData, ciudadesData] = await Promise.all([
        jugadorService.obtenerJugadores(),
        equipoService.obtenerEquipos(),
        catalogoService.obtenerPosiciones(),
        catalogoService.obtenerCiudades(),
      ]);

      setJugadores(jugadoresData);
      setEquipos(equiposData);
      setPosiciones(posicionesData);
      setCiudades(ciudadesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar jugadores (cliente side)
  const jugadoresFiltrados = useMemo(() => {
    return jugadores
      .filter((jugador) => {
        // Filtro por nombre
        if (filtroNombre && !jugador.nombre_completo.toLowerCase().includes(filtroNombre.toLowerCase())) {
          return false;
        }

        // Filtro por equipo
        if (filtroEquipo && jugador.equipo_id !== parseInt(filtroEquipo)) {
          return false;
        }

        // Filtro por sexo
        if (filtroSexo && jugador.sexo !== filtroSexo) {
          return false;
        }

        // Filtro por posición
        if (filtroPosicion && jugador.posicion_id !== parseInt(filtroPosicion)) {
          return false;
        }

        // Filtro por ciudad
        if (filtroCiudad && jugador.ciudad_nacimiento_id !== parseInt(filtroCiudad)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)); // Ordenar por nombre
  }, [jugadores, filtroNombre, filtroEquipo, filtroSexo, filtroPosicion, filtroCiudad]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroEquipo('');
    setFiltroSexo('');
    setFiltroPosicion('');
    setFiltroCiudad('');
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtroNombre || filtroEquipo || filtroSexo || filtroPosicion || filtroCiudad;

  // Manejar eliminación
  const handleEliminarClick = (id: number) => {
    setJugadorAEliminar(id);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!jugadorAEliminar) return;

    try {
      await jugadorService.eliminarJugador(jugadorAEliminar);
      toast.success('Jugador eliminado exitosamente');
      
      // Recargar toda la lista
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      toast.error('Error al eliminar el jugador');
    } finally {
      setJugadorAEliminar(null);
      setModalEliminar(false);
    }
  };

  // Obtener nombre del jugador para el modal
  const nombreJugadorAEliminar = jugadores.find(j => j.id === jugadorAEliminar)?.nombre_completo || '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verde-primavera mx-auto" />
          <p className="text-lg text-muted-foreground">Cargando jugadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">
          Jugadores
        </h1>
        <p className="text-muted-foreground">
          Explora el directorio completo de jugadores registrados en la liga
        </p>
      </div>

      {/* Card de Filtros */}
      <Card className="mb-8 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Título de filtros */}
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-verde-primavera" />
              <h3 className="text-lg font-semibold">Filtros de búsqueda</h3>
            </div>

            {/* Grid de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Buscar por nombre */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nombre</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre del jugador..."
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtrar por equipo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipo</label>
                <Select value={filtroEquipo} onValueChange={setFiltroEquipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los equipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los equipos</SelectItem>
                    {equipos.map((equipo) => (
                      <SelectItem key={equipo.id} value={equipo.id.toString()}>
                        {equipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtrar por sexo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <Select value={filtroSexo} onValueChange={setFiltroSexo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtrar por posición */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Posición</label>
                <Select value={filtroPosicion} onValueChange={setFiltroPosicion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las posiciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las posiciones</SelectItem>
                    {posiciones.map((posicion) => (
                      <SelectItem key={posicion.id} value={posicion.id.toString()}>
                        {posicion.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtrar por ciudad */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ciudad de nacimiento</label>
                <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las ciudades</SelectItem>
                    {ciudades.map((ciudad) => (
                      <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                        {ciudad.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Indicador de filtros y botón limpiar */}
            {hayFiltrosActivos && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant="secondary" className="text-sm">
                  {jugadoresFiltrados.length} {jugadoresFiltrados.length === 1 ? 'resultado' : 'resultados'} 
                  {jugadores.length > 0 && ` de ${jugadores.length}`}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid de jugadores */}
      {jugadores.length === 0 ? (
        // Empty state - No hay jugadores
        <Card className="shadow-lg">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">No hay jugadores registrados</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Aún no se han registrado jugadores en la liga. Los jugadores aparecerán aquí una vez que se registren equipos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : jugadoresFiltrados.length === 0 ? (
        // Empty state - Filtros sin resultados
        <Card className="shadow-lg">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">No se encontraron jugadores</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No hay jugadores que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.
              </p>
              <Button onClick={limpiarFiltros} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Grid de tarjetas de jugadores
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jugadoresFiltrados.map((jugador) => (
            <TarjetaJugador
              key={jugador.id}
              jugador={jugador}
              onEliminar={handleEliminarClick}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        open={modalEliminar}
        onOpenChange={setModalEliminar}
        onConfirm={confirmarEliminar}
        titulo="¿Eliminar jugador?"
        descripcion={`¿Estás seguro de que deseas eliminar a ${nombreJugadorAEliminar}? Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, eliminar"
        textoCancelar="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default JugadoresPage;
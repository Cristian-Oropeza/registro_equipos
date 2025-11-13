import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Edit, Trash2, Users, Trophy, XCircle, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

import { equipoService } from '@/services';
import { Equipo, Jugador } from '@/types';
import TarjetaJugador from '@/components/jugador/TarjetaJugador';
import ModalConfirmacion from '@/components/ui/ModalConfirmacion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Interfaz extendida para Jugador con campos del backend
interface JugadorConRelaciones extends Jugador {
  posicion_nombre?: string;
  ciudad_nombre?: string;
  equipo_nombre?: string;
}

// Interface para Equipo con estructura real del backend
interface EquipoBackend {
  id: number;
  nombre: string;
  logotipo: string | null;
  juegos_ganados: number;
  juegos_perdidos: number;
  created_at: string;
  updated_at: string;
  colores: string[]; // Array de strings hex, no objetos
}

export default function DetalleEquipo() {
  const router = useRouter();
  const { id } = router.query;

  // Estados
  const [equipo, setEquipo] = useState<EquipoBackend | null>(null);
  const [jugadores, setJugadores] = useState<JugadorConRelaciones[]>([]);
  const [jugadoresFiltrados, setJugadoresFiltrados] = useState<JugadorConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJugadores, setLoadingJugadores] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    nombre: '',
    posicion: '',
    ciudad: '',
  });

  // Cargar equipo y jugadores
  useEffect(() => {
    if (id) {
      cargarEquipo();
      cargarJugadores();
    }
  }, [id]);

  // Aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, jugadores]);

  const cargarEquipo = async () => {
    try {
      setLoading(true);
      const response = await equipoService.obtenerEquipoPorId(Number(id));
        setEquipo(response as unknown as EquipoBackend);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cargar el equipo';
      toast.error(errorMsg);
      router.push('/equipos');
    } finally {
      setLoading(false);
    }
  };

  const cargarJugadores = async () => {
    try {
      setLoadingJugadores(true);
      const data = await equipoService.obtenerJugadoresEquipo(Number(id), {});
      setJugadores(data as JugadorConRelaciones[]);
    } catch (error) {
      toast.error('Error al cargar los jugadores');
    } finally {
      setLoadingJugadores(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...jugadores];

    if (filtros.nombre && filtros.nombre.trim()) {
      resultado = resultado.filter((j) =>
        j.nombre_completo.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    if (filtros.posicion && filtros.posicion.trim()) {
      resultado = resultado.filter((j) => j.posicion_nombre === filtros.posicion);
    }

    if (filtros.ciudad && filtros.ciudad.trim()) {
      resultado = resultado.filter((j) => j.ciudad_nombre === filtros.ciudad);
    }

    setJugadoresFiltrados(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', posicion: '', ciudad: '' });
  };

  const handleEliminar = async () => {
    try {
      setEliminando(true);
      await equipoService.eliminarEquipo(Number(id));
      toast.success('Equipo eliminado exitosamente');
      router.push('/equipos');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al eliminar el equipo';
      toast.error(errorMsg);
    } finally {
      setEliminando(false);
      setModalEliminar(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (!equipo || jugadores.length === 0) return null;

    const totalJuegos = equipo.juegos_ganados + equipo.juegos_perdidos;
    const porcentajeVictorias = totalJuegos > 0 
      ? ((equipo.juegos_ganados / totalJuegos) * 100).toFixed(1)
      : '0.0';

    // Distribución por posiciones
    const posiciones: Record<string, number> = {};
    jugadores.forEach((j) => {
      const posicion = j.posicion_nombre || 'Sin posición';
      posiciones[posicion] = (posiciones[posicion] || 0) + 1;
    });

    const distribucionPosiciones = Object.entries(posiciones).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }));

    // Promedio años de experiencia
    const promedioExperiencia = jugadores.length > 0
      ? (jugadores.reduce((sum, j) => sum + j.anos_experiencia, 0) / jugadores.length).toFixed(1)
      : '0';

    // Jugador con más puntos
    const jugadorMasPuntos = jugadores.reduce((max, j) => 
      j.puntos_acumulados > max.puntos_acumulados ? j : max
    , jugadores[0]);

    // Jugador con más amonestaciones
    const jugadorMasAmonestaciones = jugadores.reduce((max, j) => 
      j.amonestaciones > max.amonestaciones ? j : max
    , jugadores[0]);

    return {
      totalJuegos,
      porcentajeVictorias,
      distribucionPosiciones,
      promedioExperiencia,
      jugadorMasPuntos,
      jugadorMasAmonestaciones,
    };
  };

  const estadisticas = calcularEstadisticas();

  // Posiciones únicas para filtro
  const posicionesUnicas = Array.from(
    new Set(jugadores.map((j) => j.posicion_nombre).filter(Boolean))
  ) as string[];
  
  const ciudadesUnicas = Array.from(
    new Set(jugadores.map((j) => j.ciudad_nombre).filter(Boolean))
  ) as string[];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!equipo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-12 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Equipo no encontrado</h2>
          <p className="text-gray-600 mb-6">El equipo que buscas no existe o fue eliminado.</p>
          <Button onClick={() => router.push('/equipos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Equipos
          </Button>
        </Card>
      </div>
    );
  }

  const porcentajeEfectividad = equipo.juegos_ganados + equipo.juegos_perdidos > 0
    ? (equipo.juegos_ganados / (equipo.juegos_ganados + equipo.juegos_perdidos)) * 100
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
      {/* Botón Volver */}
      <Button
        variant="ghost"
        onClick={() => router.push('/equipos')}
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Equipos
      </Button>

      {/* Header del Equipo */}
      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {equipo.logotipo ? (
                <img
                  src={`http://localhost:5000/${equipo.logotipo}`}
                  alt={equipo.nombre}
                  className="w-32 h-32 object-contain rounded-lg border-2 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-[#00986C] to-[#6C9A8B] rounded-lg flex items-center justify-center">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
              )}
            </div>

            {/* Info del Equipo */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold mb-3 text-gray-900">{equipo.nombre}</h1>
              
              {/* Colores */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-600">Colores:</span>
                <div className="flex gap-2">
                  {equipo.colores && equipo.colores.length > 0 ? (
                    equipo.colores.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Sin colores definidos</span>
                  )}
                </div>
              </div>

              {/* Badges de Estadísticas */}
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="secondary" className="text-sm py-1.5 px-3">
                  <Users className="h-4 w-4 mr-1" />
                  {jugadores.length} Jugadores
                </Badge>
                <Badge variant="secondary" className="text-sm py-1.5 px-3 bg-green-100 text-green-700">
                  <Trophy className="h-4 w-4 mr-1" />
                  {equipo.juegos_ganados} Ganados
                </Badge>
                <Badge variant="secondary" className="text-sm py-1.5 px-3 bg-red-100 text-red-700">
                  <XCircle className="h-4 w-4 mr-1" />
                  {equipo.juegos_perdidos} Perdidos
                </Badge>
              </div>

              {/* Barra de Efectividad */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Efectividad</span>
                  <span className="text-sm font-bold text-[#00986C]">
                    {porcentajeEfectividad.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#00986C] to-[#6C9A8B] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeEfectividad}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button
                onClick={() => router.push(`/equipo/${id}/editar`)}
                className="bg-[#00986C] hover:bg-[#007a56] w-full md:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Equipo
              </Button>
              <Button
                variant="destructive"
                onClick={() => setModalEliminar(true)}
                className="w-full md:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Equipo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="jugadores" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="jugadores" className="text-base">
            <Users className="h-4 w-4 mr-2" />
            Jugadores
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="text-base">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="informacion" className="text-base">
            <Trophy className="h-4 w-4 mr-2" />
            Información
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: JUGADORES */}
        <TabsContent value="jugadores" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Jugadores del Equipo</CardTitle>
                  <CardDescription>
                    {jugadoresFiltrados.length} de {jugadores.length} jugadores
                  </CardDescription>
                </div>
                <Button className="bg-[#00986C] hover:bg-[#007a56]">
                  Agregar Jugador
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Input
                  placeholder="Buscar por nombre..."
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                />
                <Select
                  value={filtros.posicion || 'todas'}
                  onValueChange={(value) => setFiltros({ ...filtros, posicion: value === 'todas' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las posiciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las posiciones</SelectItem>
                    {posicionesUnicas.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filtros.ciudad || 'todas'}
                  onValueChange={(value) => setFiltros({ ...filtros, ciudad: value === 'todas' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las ciudades</SelectItem>
                    {ciudadesUnicas.map((ciudad) => (
                      <SelectItem key={ciudad} value={ciudad}>
                        {ciudad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  disabled={!filtros.nombre && !filtros.posicion && !filtros.ciudad}
                >
                  Limpiar Filtros
                </Button>
              </div>

              {/* Grid de Jugadores */}
              {loadingJugadores ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : jugadoresFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No se encontraron jugadores
                  </h3>
                  <p className="text-gray-500">
                    {jugadores.length === 0
                      ? 'Este equipo aún no tiene jugadores registrados.'
                      : 'No hay jugadores que coincidan con los filtros aplicados.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jugadoresFiltrados.map((jugador) => (
                    <div
                      key={jugador.id}
                      onClick={() => router.push(`/jugador/${jugador.id}`)}
                      className="cursor-pointer"
                    >
                      <TarjetaJugador jugador={jugador} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ESTADÍSTICAS */}
        <TabsContent value="estadisticas" className="space-y-6">
          {estadisticas && (
            <>
              {/* Cards de Stats Principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total de Juegos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {estadisticas.totalJuegos}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {equipo.juegos_ganados}G - {equipo.juegos_perdidos}P
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      % de Victorias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#00986C]">
                      {estadisticas.porcentajeVictorias}%
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {equipo.juegos_ganados} victorias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Promedio Experiencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {estadisticas.promedioExperiencia}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">años por jugador</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfica de Distribución por Posiciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Posiciones</CardTitle>
                  <CardDescription>
                    Cantidad de jugadores por posición
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={estadisticas.distribucionPosiciones}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="nombre" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                        {estadisticas.distribucionPosiciones.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index % 3 === 0
                                ? '#00986C'
                                : index % 3 === 1
                                ? '#6C9A8B'
                                : '#000080'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cards de Jugadores Destacados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Jugador con Más Puntos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {estadisticas.jugadorMasPuntos.foto ? (
                        <img
                          src={`http://localhost:5000/${estadisticas.jugadorMasPuntos.foto}`}
                          alt={estadisticas.jugadorMasPuntos.nombre_completo}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#00986C] flex items-center justify-center text-white font-bold text-xl">
                          {estadisticas.jugadorMasPuntos.nombre_completo
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg">
                          {estadisticas.jugadorMasPuntos.nombre_completo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {estadisticas.jugadorMasPuntos.posicion_nombre || 'Sin posición'}
                        </p>
                        <p className="text-2xl font-bold text-[#00986C] mt-1">
                          {estadisticas.jugadorMasPuntos.puntos_acumulados} pts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Jugador con Más Amonestaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {estadisticas.jugadorMasAmonestaciones.foto ? (
                        <img
                          src={`http://localhost:5000/${estadisticas.jugadorMasAmonestaciones.foto}`}
                          alt={estadisticas.jugadorMasAmonestaciones.nombre_completo}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#00986C] flex items-center justify-center text-white font-bold text-xl">
                          {estadisticas.jugadorMasAmonestaciones.nombre_completo
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg">
                          {estadisticas.jugadorMasAmonestaciones.nombre_completo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {estadisticas.jugadorMasAmonestaciones.posicion_nombre || 'Sin posición'}
                        </p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                          {estadisticas.jugadorMasAmonestaciones.amonestaciones}{' '}
                          {estadisticas.jugadorMasAmonestaciones.amonestaciones === 1
                            ? 'tarjeta'
                            : 'tarjetas'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* TAB 3: INFORMACIÓN */}
        <TabsContent value="informacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colores Detallados */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Colores del Equipo</h3>
                {equipo.colores && equipo.colores.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {equipo.colores.map((color, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition"
                      >
                        <div
                          className="w-20 h-20 rounded-full mb-2 border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-mono text-gray-600">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Este equipo no tiene colores definidos.</p>
                )}
              </div>

              <Separator />

              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Estadísticas Generales</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de jugadores:</span>
                      <span className="font-semibold">{jugadores.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Juegos ganados:</span>
                      <span className="font-semibold text-green-600">
                        {equipo.juegos_ganados}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Juegos perdidos:</span>
                      <span className="font-semibold text-red-600">
                        {equipo.juegos_perdidos}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efectividad:</span>
                      <span className="font-semibold text-[#00986C]">
                        {porcentajeEfectividad.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Fechas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de registro:</span>
                      <span className="font-semibold">
                        {equipo.created_at
                          ? new Date(equipo.created_at).toLocaleDateString('es-MX')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmacion
        open={modalEliminar}
        onOpenChange={setModalEliminar}
        titulo="¿Eliminar equipo?"
        descripcion={`¿Estás seguro de eliminar el equipo "${equipo.nombre}"? Esto eliminará también a todos los jugadores (${jugadores.length} jugadores). Esta acción no se puede deshacer.`}
        onConfirm={handleEliminar}
        textoCancelar="Cancelar"
        textoConfirmar={eliminando ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
      />
    </div>
  );
}
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  Trophy,
  Target,
  User,
  Heart,
  Music,
  Share2,
  XCircle,
  Cake,
  Clock,
  Award,
  AlertTriangle,
} from 'lucide-react';

import { jugadorService } from '@/services';
import { RedSocialNombre } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ModalConfirmacion from '@/components/ui/ModalConfirmacion';
import ModalEditarJugador from '@/components/jugador/ModalEditarJugador';

// Interface extendida para el jugador del backend
interface JugadorBackend {
  id: number;
  equipo_id: number;
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string;
  peso: string;
  estatura: string;
  apodo: string;
  posicion_id: number;
  foto: string | null;
  ciudad_nacimiento_id: number;
  anos_experiencia: number;
  correo_electronico: string;
  amonestaciones: number;
  puntos_acumulados: number;
  folio: string;
  created_at: string;
  updated_at: string;
  equipo_nombre: string;
  posicion_nombre: string;
  ciudad_nombre: string;
  pasatiempos: string[];
  musica: string[];
  redesSociales: Array<{ nombre_plataforma: RedSocialNombre; url: string }>; // ← CAMBIAR ESTA LÍNEA
}

export default function DetalleJugador() {
  const router = useRouter();
  const { id } = router.query;

  const [jugador, setJugador] = useState<JugadorBackend | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarJugador();
    }
  }, [id]);

  const cargarJugador = async () => {
    try {
      setLoading(true);
      const data = await jugadorService.obtenerJugadorPorId(Number(id));
      setJugador(data as unknown as JugadorBackend);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cargar el jugador';
      toast.error(errorMsg);
      router.push('/jugadores');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      setEliminando(true);
      await jugadorService.eliminarJugador(Number(id));
      toast.success('Jugador eliminado exitosamente');
      router.push('/jugadores');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al eliminar el jugador';
      toast.error(errorMsg);
    } finally {
      setEliminando(false);
      setModalEliminar(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (nombre: string) => {
    const parts = nombre.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : nombre.substring(0, 2);
  };

  const getSexoBadgeColor = (sexo: string) => {
    switch (sexo) {
      case 'Masculino':
        return 'bg-blue-100 text-blue-700';
      case 'Femenino':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  const getRedSocialIcon = (plataforma: string) => {
    return <Share2 className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!jugador) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-12 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Jugador no encontrado</h2>
          <p className="text-gray-600 mb-6">El jugador que buscas no existe o fue eliminado.</p>
          <Button onClick={() => router.push('/jugadores')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Jugadores
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
      {/* Botón Volver */}
      <Button
        variant="ghost"
        onClick={() => router.push('/jugadores')}
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Jugadores
      </Button>

      {/* Header del Jugador */}
      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Foto */}
            <div className="flex-shrink-0">
              <Avatar className="w-40 h-40 border-4 border-[#00986C] shadow-xl">
                <AvatarImage
                  src={
                    jugador.foto ? `http://localhost:5000/${jugador.foto}` : undefined
                  }
                  alt={jugador.nombre_completo}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#00986C] to-[#6C9A8B] text-white text-4xl font-bold">
                  {getInitials(jugador.nombre_completo)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info Principal */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold mb-2 text-gray-900">
                {jugador.nombre_completo}
              </h1>
              <p className="text-xl text-gray-600 italic mb-4">{jugador.apodo}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className={getSexoBadgeColor(jugador.sexo)}>
                  <User className="w-3 h-3 mr-1" />
                  {jugador.sexo}
                </Badge>
                <Badge className="bg-[#6C9A8B] text-white">
                  <Target className="w-3 h-3 mr-1" />
                  {jugador.posicion_nombre}
                </Badge>
                <Badge className="bg-[#000080] text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  {jugador.equipo_nombre}
                </Badge>
              </div>

              {/* Estadísticas Destacadas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-[#00986C]">
                    {jugador.puntos_acumulados}
                  </div>
                  <div className="text-sm text-gray-600">Puntos</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {jugador.amonestaciones}
                  </div>
                  <div className="text-sm text-gray-600">Tarjetas</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {jugador.anos_experiencia}
                  </div>
                  <div className="text-sm text-gray-600">
                    Años {jugador.anos_experiencia === 1 ? '' : 'de exp.'}
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {calcularEdad(jugador.fecha_nacimiento)}
                  </div>
                  <div className="text-sm text-gray-600">Años</div>
                </div>
              </div>

              {/* Folio */}
              <div className="mt-4">
                <span className="text-sm text-gray-600">Folio de participación:</span>
                <code className="ml-2 text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                  {jugador.folio}
                </code>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button
                onClick={() => setModalEditar(true)}
                className="bg-[#00986C] hover:bg-[#007a56] w-full md:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Jugador
              </Button>
              <Button
                variant="destructive"
                onClick={() => setModalEliminar(true)}
                className="w-full md:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Jugador
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="informacion" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="informacion" className="text-base">
            <User className="h-4 w-4 mr-2" />
            Información Personal
          </TabsTrigger>
          <TabsTrigger value="gustos" className="text-base">
            <Heart className="h-4 w-4 mr-2" />
            Gustos Personales
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="text-base">
            <Award className="h-4 w-4 mr-2" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INFORMACIÓN PERSONAL */}
        <TabsContent value="informacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha de Nacimiento */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cake className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                    <p className="font-semibold">{formatearFecha(jugador.fecha_nacimiento)}</p>
                    <p className="text-sm text-gray-500">
                      {calcularEdad(jugador.fecha_nacimiento)} años
                    </p>
                  </div>
                </div>

                {/* Ciudad de Nacimiento */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ciudad de nacimiento</p>
                    <p className="font-semibold">{jugador.ciudad_nombre}</p>
                  </div>
                </div>

                {/* Peso */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Weight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Peso</p>
                    <p className="font-semibold">{jugador.peso} kg</p>
                  </div>
                </div>

                {/* Estatura */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Ruler className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estatura</p>
                    <p className="font-semibold">{jugador.estatura} m</p>
                  </div>
                </div>

                {/* Correo */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correo electrónico</p>
                    <a
                      href={`mailto:${jugador.correo_electronico}`}
                      className="font-semibold text-[#00986C] hover:underline"
                    >
                      {jugador.correo_electronico}
                    </a>
                  </div>
                </div>

                {/* Experiencia */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Años de experiencia</p>
                    <p className="font-semibold">
                      {jugador.anos_experiencia}{' '}
                      {jugador.anos_experiencia === 1 ? 'año' : 'años'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fechas del Sistema */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Registro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de registro</p>
                    <p className="font-medium">{formatearFecha(jugador.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última actualización</p>
                    <p className="font-medium">{formatearFecha(jugador.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GUSTOS PERSONALES */}
        <TabsContent value="gustos" className="space-y-6">
          {/* Pasatiempos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Pasatiempos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jugador.pasatiempos && jugador.pasatiempos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jugador.pasatiempos.map((pasatiempo, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-2 px-3">
                      {pasatiempo}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No se han registrado pasatiempos</p>
              )}
            </CardContent>
          </Card>

          {/* Música Favorita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-500" />
                Música Favorita
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jugador.musica && jugador.musica.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jugador.musica.map((musica, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-2 px-3">
                      <Music className="w-3 h-3 mr-1" />
                      {musica}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No se ha registrado música favorita</p>
              )}
            </CardContent>
          </Card>

          {/* Redes Sociales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-500" />
                Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jugador.redesSociales && jugador.redesSociales.length > 0 ? (
                <div className="space-y-3">
                  {jugador.redesSociales.map((red, index) => (
                    <a
                      key={index}
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      {getRedSocialIcon(red.nombre_plataforma)}
                      <div className="flex-1">
                        <p className="font-medium">{red.nombre_plataforma}</p>
                        <p className="text-sm text-gray-500 truncate">{red.url}</p>
                      </div>
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No se han registrado redes sociales</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: ESTADÍSTICAS */}
        <TabsContent value="estadisticas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rendimiento General */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Puntos acumulados</span>
                  <span className="text-2xl font-bold text-[#00986C]">
                    {jugador.puntos_acumulados}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amonestaciones</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {jugador.amonestaciones}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Años de experiencia</span>
                  <span className="text-xl font-semibold">{jugador.anos_experiencia}</span>
                </div>
              </CardContent>
            </Card>

            {/* Info del Equipo */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Equipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Equipo</p>
                  <p className="text-xl font-bold text-[#000080]">{jugador.equipo_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Posición</p>
                  <Badge className="bg-[#6C9A8B] text-white text-base py-1.5 px-3">
                    <Target className="w-4 h-4 mr-1" />
                    {jugador.posicion_nombre}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ver equipo completo</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/equipo/${jugador.equipo_id}`)}
                    className="w-full"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Ir al equipo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Edición */}
      {jugador && (
        <ModalEditarJugador
          open={modalEditar}
          onOpenChange={setModalEditar}
          jugadorId={jugador.id}
          datosIniciales={{
            nombre_completo: jugador.nombre_completo,
            peso: parseFloat(jugador.peso),
            estatura: parseFloat(jugador.estatura),
            apodo: jugador.apodo,
            anos_experiencia: jugador.anos_experiencia,
            puntos_acumulados: jugador.puntos_acumulados,
            amonestaciones: jugador.amonestaciones,
            pasatiempos: jugador.pasatiempos,
            musica_favorita: jugador.musica,
            redes_sociales: jugador.redesSociales,
            foto: jugador.foto,
          }}
          onActualizado={cargarJugador}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmacion
        open={modalEliminar}
        onOpenChange={setModalEliminar}
        titulo="¿Eliminar jugador?"
        descripcion={`¿Estás seguro de eliminar a ${jugador.nombre_completo}? Esta acción no se puede deshacer y el jugador será eliminado del equipo ${jugador.equipo_nombre}.`}
        onConfirm={handleEliminar}
        textoCancelar="Cancelar"
        textoConfirmar={eliminando ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
      />
    </div>
  );
}
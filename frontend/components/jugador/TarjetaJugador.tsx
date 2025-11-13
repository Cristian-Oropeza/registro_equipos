import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Trophy, 
  Target, 
  AlertCircle,
  Eye,
  Trash2,
  UserCircle
} from 'lucide-react';
import { Jugador } from '@/types';

// Extender interface para incluir campos del backend
interface JugadorExtendido extends Jugador {
  posicion_nombre?: string;
  ciudad_nombre?: string;
  equipo_nombre?: string;
}

interface TarjetaJugadorProps {
  jugador: JugadorExtendido;
  onEliminar?: (id: number) => void;
  showActions?: boolean;
}

const TarjetaJugador: React.FC<TarjetaJugadorProps> = ({ 
  jugador, 
  onEliminar,
  showActions = true 
}) => {
  const router = useRouter();

  const handleVerPerfil = () => {
    router.push(`/jugador/${jugador.id}`);
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEliminar) {
      onEliminar(jugador.id);
    }
  };

  const getInitials = (nombre: string) => {
    const parts = nombre.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}` 
      : nombre.substring(0, 2);
  };

  const getSexoBadgeColor = (sexo: string) => {
    switch (sexo) {
      case 'Masculino':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'Femenino':
        return 'bg-pink-100 text-pink-700 hover:bg-pink-100';
      default:
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
    }
  };

  // Obtener foto correctamente (sin duplicar uploads/)
  const getFotoUrl = () => {
    if (!jugador.foto) return undefined;
    
    // Si la foto ya tiene la ruta completa con uploads/
    if (jugador.foto.startsWith('uploads/')) {
      return `http://localhost:5000/${jugador.foto}`;
    }
    
    // Si solo tiene el nombre del archivo
    return `http://localhost:5000/uploads/fotos/${jugador.foto}`;
  };

  return (
    <Card 
      className="card-hover cursor-pointer group relative overflow-hidden"
      onClick={handleVerPerfil}
    >
      {/* Botón de eliminar (esquina superior derecha) */}
      {showActions && onEliminar && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEliminar}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <CardHeader className="pb-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Foto del jugador */}
          <Avatar className="w-24 h-24 border-4 border-verde-primavera shadow-lg group-hover:scale-110 transition-transform">
            <AvatarImage
              src={getFotoUrl()}
              alt={jugador.nombre_completo}
            />
            <AvatarFallback className="bg-gradient-to-br from-verde-primavera to-juniper text-white text-xl font-bold">
              {getInitials(jugador.nombre_completo)}
            </AvatarFallback>
          </Avatar>

          {/* Nombre del jugador */}
          <div className="text-center">
            <h3 className="text-lg font-bold group-hover:text-verde-primavera transition-colors">
              {jugador.nombre_completo}
            </h3>
            <p className="text-sm text-muted-foreground italic">
              {jugador.apodo}
            </p>
          </div>

          {/* Badge de sexo */}
          <Badge className={getSexoBadgeColor(jugador.sexo)}>
            <UserCircle className="w-3 h-3 mr-1" />
            {jugador.sexo}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Posición */}
        <div className="flex items-center justify-center">
          <Badge 
            variant="secondary" 
            className="bg-juniper text-white hover:bg-juniper/90"
          >
            <Target className="w-3 h-3 mr-1" />
            {jugador.posicion_nombre || jugador.posicion?.nombre || 'Sin posición'}
          </Badge>
        </div>

        {/* Equipo */}
        {(jugador.equipo_nombre || jugador.equipo) && (
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Trophy className="w-4 h-4 text-azul-marino" />
            <span className="font-medium text-azul-marino">
              {jugador.equipo_nombre || jugador.equipo?.nombre}
            </span>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          {/* Puntos */}
          <div className="text-center">
            <div className="text-2xl font-bold text-verde-primavera">
              {jugador.puntos_acumulados}
            </div>
            <div className="text-xs text-muted-foreground">Puntos</div>
          </div>

          {/* Amonestaciones */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">
                {jugador.amonestaciones}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Tarjetas</div>
          </div>
        </div>

        {/* Experiencia */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Experiencia</span>
          <Badge variant="outline">
            {jugador.anos_experiencia} {jugador.anos_experiencia === 1 ? 'año' : 'años'}
          </Badge>
        </div>

        {/* Folio */}
        <div className="text-center pt-2">
          <div className="text-xs text-muted-foreground">Folio</div>
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
            {jugador.folio}
          </code>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group-hover:bg-verde-primavera group-hover:text-white transition-colors"
          variant="outline"
          onClick={handleVerPerfil}
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Perfil
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TarjetaJugador;
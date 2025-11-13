import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Trash2,
  Eye 
} from 'lucide-react';
import { Equipo } from '@/types';

interface TarjetaEquipoProps {
  equipo: Equipo;
  onEliminar?: (id: number) => void;
  showActions?: boolean;
}

const TarjetaEquipo: React.FC<TarjetaEquipoProps> = ({ 
  equipo, 
  onEliminar,
  showActions = true 
}) => {
  const router = useRouter();

  const handleVerDetalle = () => {
    router.push(`/equipo/${equipo.id}`);
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEliminar) {
      onEliminar(equipo.id);
    }
  };

  const totalJuegos = equipo.juegos_ganados + equipo.juegos_perdidos;
  const porcentajeVictorias = totalJuegos > 0 
    ? Math.round((equipo.juegos_ganados / totalJuegos) * 100)
    : 0;

  return (
    <Card 
      className="card-hover cursor-pointer group relative overflow-hidden"
      onClick={handleVerDetalle}
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
          {/* Logo del equipo */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-verde-primavera to-juniper flex items-center justify-center shadow-lg">
            {equipo.logotipo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${equipo.logotipo}`}
                alt={equipo.nombre}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <Trophy className="w-10 h-10 text-white" />
            )}
          </div>

          {/* Nombre del equipo */}
          <h3 className="text-xl font-bold text-center group-hover:text-verde-primavera transition-colors">
            {equipo.nombre}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Colores del equipo */}
        {equipo.colores && equipo.colores.length > 0 && (
          <div className="flex items-center justify-center space-x-1">
            <span className="text-sm text-muted-foreground mr-2">Colores:</span>
            {equipo.colores.slice(0, 5).map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color.color_hex }}
                title={color.color_hex}
              />
            ))}
          </div>
        )}

        {/* Estadísticas */}
        <div className="space-y-2">
          {/* Jugadores */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-juniper" />
              <span className="text-muted-foreground">Jugadores</span>
            </div>
            <Badge variant="secondary">
              {equipo.total_jugadores || equipo.jugadores?.length || 0}
            </Badge>
          </div>

          {/* Juegos ganados */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Ganados</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {equipo.juegos_ganados}
            </Badge>
          </div>

          {/* Juegos perdidos */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-muted-foreground">Perdidos</span>
            </div>
            <Badge variant="outline" className="text-red-600 border-red-600">
              {equipo.juegos_perdidos}
            </Badge>
          </div>
        </div>

        {/* Porcentaje de victorias */}
        {totalJuegos > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Efectividad</span>
              <span className="font-semibold">{porcentajeVictorias}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-verde-primavera to-juniper h-2 rounded-full transition-all duration-500"
                style={{ width: `${porcentajeVictorias}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group-hover:bg-verde-primavera group-hover:text-white transition-colors"
          variant="outline"
          onClick={handleVerDetalle}
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalle
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TarjetaEquipo;
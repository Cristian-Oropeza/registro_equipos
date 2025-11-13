import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Trophy,
  Image as ImageIcon,
  X,
  Plus,
  Loader2,
  Palette,
  Users,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { equipoService, jugadorService } from '@/services';
import ModalConfirmacion from '@/components/ui/ModalConfirmacion';

interface JugadorSimple {
  id: number;
  nombre_completo: string;
  apodo: string;
  foto: string | null;
  posicion_nombre?: string;
}

interface EquipoEditData {
  id: number;
  nombre: string;
  logotipo: string | null;
  colores: string[];
  juegos_ganados: number;
  juegos_perdidos: number;
  jugadores: JugadorSimple[];
}

interface ModalEditarEquipoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipoId: number;
  datosIniciales: EquipoEditData;
  onActualizado: () => void;
}

const ModalEditarEquipo: React.FC<ModalEditarEquipoProps> = ({
  open,
  onOpenChange,
  equipoId,
  datosIniciales,
  onActualizado,
}) => {
  // Estados del formulario
  const [colores, setColores] = useState<string[]>(datosIniciales.colores || []);
  const [juegosGanados, setJuegosGanados] = useState(datosIniciales.juegos_ganados);
  const [juegosPerdidos, setJuegosPerdidos] = useState(datosIniciales.juegos_perdidos);
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(
    datosIniciales.logotipo ? `http://localhost:5000/${datosIniciales.logotipo}` : null
  );
  const [jugadores, setJugadores] = useState<JugadorSimple[]>(datosIniciales.jugadores || []);

  // Estados temporales
  const [nuevoColor, setNuevoColor] = useState('#000000');

  // Estados de UI
  const [guardando, setGuardando] = useState(false);
  const [modalEliminarJugador, setModalEliminarJugador] = useState(false);
  const [jugadorAEliminar, setJugadorAEliminar] = useState<JugadorSimple | null>(null);
  const [eliminandoJugador, setEliminandoJugador] = useState(false);

  // Reiniciar estados cuando cambien los datos iniciales
  useEffect(() => {
    if (open) {
      setColores(datosIniciales.colores || []);
      setJuegosGanados(datosIniciales.juegos_ganados);
      setJuegosPerdidos(datosIniciales.juegos_perdidos);
      setJugadores(datosIniciales.jugadores || []);
      setLogo(null);
      setPreviewLogo(
        datosIniciales.logotipo ? `http://localhost:5000/${datosIniciales.logotipo}` : null
      );
    }
  }, [open, datosIniciales]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 10MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Solo se permiten imágenes JPG o PNG');
        return;
      }
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarColor = () => {
    if (colores.length >= 5) {
      toast.error('Máximo 5 colores');
      return;
    }
    if (colores.includes(nuevoColor)) {
      toast.error('Este color ya está agregado');
      return;
    }
    setColores([...colores, nuevoColor]);
  };

  const eliminarColor = (index: number) => {
    if (colores.length <= 1) {
      toast.error('Debe haber al menos 1 color');
      return;
    }
    setColores(colores.filter((_, i) => i !== index));
  };

  const handleEliminarJugadorClick = (jugador: JugadorSimple) => {
    if (jugadores.length <= 8) {
      toast.error('El equipo debe tener al menos 8 jugadores');
      return;
    }
    setJugadorAEliminar(jugador);
    setModalEliminarJugador(true);
  };

  const confirmarEliminarJugador = async () => {
    if (!jugadorAEliminar) return;

    try {
      setEliminandoJugador(true);
      await jugadorService.eliminarJugador(jugadorAEliminar.id);
      
      // Actualizar lista local
      setJugadores(jugadores.filter((j) => j.id !== jugadorAEliminar.id));
      
      toast.success(`${jugadorAEliminar.nombre_completo} eliminado del equipo`);
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      toast.error('Error al eliminar el jugador');
    } finally {
      setEliminandoJugador(false);
      setModalEliminarJugador(false);
      setJugadorAEliminar(null);
    }
  };

  const handleGuardar = async () => {
    // Validaciones
    if (colores.length === 0) {
      toast.error('Debe haber al menos 1 color');
      return;
    }
    if (colores.length > 5) {
      toast.error('Máximo 5 colores');
      return;
    }
    if (juegosGanados < 0) {
      toast.error('Los juegos ganados no pueden ser negativos');
      return;
    }
    if (juegosPerdidos < 0) {
      toast.error('Los juegos perdidos no pueden ser negativos');
      return;
    }

    try {
      setGuardando(true);

      const datosActualizar = {
        colores,
        juegos_ganados: juegosGanados,
        juegos_perdidos: juegosPerdidos,
      };

      await equipoService.actualizarEquipo(equipoId, datosActualizar, logo || undefined);

      toast.success('Equipo actualizado exitosamente');
      onActualizado();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      toast.error('Error al actualizar el equipo');
    } finally {
      setGuardando(false);
    }
  };

  const getInitials = (nombre: string) => {
    const parts = nombre.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : nombre.substring(0, 2);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#00986C]" />
              Editar Equipo
            </DialogTitle>
            <DialogDescription>
              Actualiza la información de {datosIniciales.nombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Logo del Equipo */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Logo del Equipo</Label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 border-4 border-[#00986C] rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Trophy className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-input"
                    accept="image/jpeg,image/png"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-input')?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {logo ? 'Cambiar logo' : 'Subir logo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG o PNG, máximo 10MB</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Colores del Equipo */}
            <div>
              <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Colores del Equipo
              </Label>
              <div className="space-y-4">
                {/* Colores actuales */}
                <div className="flex flex-wrap gap-3">
                  {colores.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-lg bg-white"
                    >
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-mono">{color}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarColor(index)}
                        disabled={colores.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Agregar color */}
                {colores.length < 5 && (
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={nuevoColor}
                      onChange={(e) => setNuevoColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={nuevoColor}
                      onChange={(e) => setNuevoColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                    <Button type="button" onClick={agregarColor} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-gray-500">Mínimo 1, máximo 5 colores</p>
              </div>
            </div>

            <Separator />

            {/* Estadísticas */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Estadísticas</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Juegos Ganados */}
                <div className="space-y-2">
                  <Label htmlFor="ganados" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-600" />
                    Juegos Ganados
                  </Label>
                  <Input
                    id="ganados"
                    type="number"
                    min="0"
                    value={juegosGanados}
                    onChange={(e) => setJuegosGanados(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Juegos Perdidos */}
                <div className="space-y-2">
                  <Label htmlFor="perdidos" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Juegos Perdidos
                  </Label>
                  <Input
                    id="perdidos"
                    type="number"
                    min="0"
                    value={juegosPerdidos}
                    onChange={(e) => setJuegosPerdidos(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Jugadores del Equipo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Jugadores del Equipo
                </Label>
                <Badge variant="secondary" className="text-sm">
                  {jugadores.length} jugadores
                </Badge>
              </div>

              {jugadores.length < 8 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      El equipo debe tener al menos 8 jugadores
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {jugadores.map((jugador) => (
                  <Card key={jugador.id} className="hover:shadow-md transition">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-[#00986C]">
                          <AvatarImage
                            src={
                              jugador.foto
                                ? `http://localhost:5000/${jugador.foto}`
                                : undefined
                            }
                          />
                          <AvatarFallback className="bg-gradient-to-br from-[#00986C] to-[#6C9A8B] text-white text-sm font-bold">
                            {getInitials(jugador.nombre_completo)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {jugador.nombre_completo}
                          </p>
                          <p className="text-xs text-gray-500 italic">
                            {jugador.apodo}
                          </p>
                          {jugador.posicion_nombre && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {jugador.posicion_nombre}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminarJugadorClick(jugador)}
                          disabled={jugadores.length <= 8}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {jugadores.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay jugadores en este equipo</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={guardando || jugadores.length < 8}
              className="bg-[#00986C] hover:bg-[#007a56]"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación para Eliminar Jugador */}
      {jugadorAEliminar && (
        <ModalConfirmacion
          open={modalEliminarJugador}
          onOpenChange={setModalEliminarJugador}
          titulo="¿Eliminar jugador del equipo?"
          descripcion={`¿Estás seguro de eliminar a ${jugadorAEliminar.nombre_completo} del equipo? El jugador se eliminará completamente de la base de datos. Esta acción no se puede deshacer.`}
          onConfirm={confirmarEliminarJugador}
          textoCancelar="Cancelar"
          textoConfirmar={eliminandoJugador ? 'Eliminando...' : 'Eliminar'}
          variant="destructive"
        />
      )}
    </>
  );
};

export default ModalEditarEquipo;
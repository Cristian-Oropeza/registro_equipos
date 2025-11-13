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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Weight,
  Ruler,
  Trophy,
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  X,
  Plus,
  Heart,
  Music,
  Share2,
  Loader2,
} from 'lucide-react';
import { jugadorService } from '@/services';
import { RedSocialNombre } from '@/types';

interface JugadorEditData {
  peso: number;
  estatura: number;
  apodo: string;
  anos_experiencia: number;
  puntos_acumulados: number;
  amonestaciones: number;
  pasatiempos: string[];
  musica_favorita: string[];
  redes_sociales: Array<{ nombre_plataforma: RedSocialNombre; url: string }>;
}

interface ModalEditarJugadorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jugadorId: number;
  datosIniciales: JugadorEditData & {
    nombre_completo: string;
    foto: string | null;
  };
  onActualizado: () => void;
}

const REDES_DISPONIBLES: RedSocialNombre[] = [
  'Facebook',
  'Instagram',
  'X (Twitter)',
  'TikTok',
  'YouTube',
];

const ModalEditarJugador: React.FC<ModalEditarJugadorProps> = ({
  open,
  onOpenChange,
  jugadorId,
  datosIniciales,
  onActualizado,
}) => {
  // Estados del formulario
  const [peso, setPeso] = useState(datosIniciales.peso);
  const [estatura, setEstatura] = useState(datosIniciales.estatura);
  const [apodo, setApodo] = useState(datosIniciales.apodo);
  const [anosExperiencia, setAnosExperiencia] = useState(datosIniciales.anos_experiencia);
  const [puntos, setPuntos] = useState(datosIniciales.puntos_acumulados);
  const [amonestaciones, setAmonestaciones] = useState(datosIniciales.amonestaciones);
  const [pasatiempos, setPasatiempos] = useState<string[]>(datosIniciales.pasatiempos || []);
  const [musica, setMusica] = useState<string[]>(datosIniciales.musica_favorita || []);
  const [redes, setRedes] = useState<Array<{ nombre_plataforma: RedSocialNombre; url: string }>>(
    datosIniciales.redes_sociales || []
  );
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(
    datosIniciales.foto ? `http://localhost:5000/${datosIniciales.foto}` : null
  );

  // Estados de campos temporales
  const [nuevoPasatiempo, setNuevoPasatiempo] = useState('');
  const [nuevaMusica, setNuevaMusica] = useState('');
  const [nuevaRedPlataforma, setNuevaRedPlataforma] = useState<RedSocialNombre>('Facebook');
  const [nuevaRedUrl, setNuevaRedUrl] = useState('');

  // Estados de UI
  const [guardando, setGuardando] = useState(false);

  // Reiniciar estados cuando cambien los datos iniciales
  useEffect(() => {
    if (open) {
      setPeso(datosIniciales.peso);
      setEstatura(datosIniciales.estatura);
      setApodo(datosIniciales.apodo);
      setAnosExperiencia(datosIniciales.anos_experiencia);
      setPuntos(datosIniciales.puntos_acumulados);
      setAmonestaciones(datosIniciales.amonestaciones);
      setPasatiempos(datosIniciales.pasatiempos || []);
      setMusica(datosIniciales.musica_favorita || []);
      setRedes(datosIniciales.redes_sociales || []);
      setFoto(null);
      setPreviewFoto(
        datosIniciales.foto ? `http://localhost:5000/${datosIniciales.foto}` : null
      );
    }
  }, [open, datosIniciales]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarPasatiempo = () => {
    if (!nuevoPasatiempo.trim()) {
      toast.error('Escribe un pasatiempo');
      return;
    }
    if (pasatiempos.length >= 10) {
      toast.error('Máximo 10 pasatiempos');
      return;
    }
    setPasatiempos([...pasatiempos, nuevoPasatiempo.trim()]);
    setNuevoPasatiempo('');
  };

  const eliminarPasatiempo = (index: number) => {
    setPasatiempos(pasatiempos.filter((_, i) => i !== index));
  };

  const agregarMusica = () => {
    if (!nuevaMusica.trim()) {
      toast.error('Escribe un género o artista');
      return;
    }
    if (musica.length >= 10) {
      toast.error('Máximo 10 géneros/artistas');
      return;
    }
    setMusica([...musica, nuevaMusica.trim()]);
    setNuevaMusica('');
  };

  const eliminarMusica = (index: number) => {
    setMusica(musica.filter((_, i) => i !== index));
  };

  const agregarRed = () => {
    if (!nuevaRedUrl.trim()) {
      toast.error('Ingresa la URL de la red social');
      return;
    }
    if (redes.length >= 5) {
      toast.error('Máximo 5 redes sociales');
      return;
    }
    // Validar URL básica
    try {
      new URL(nuevaRedUrl);
    } catch {
      toast.error('URL inválida');
      return;
    }
    setRedes([...redes, { nombre_plataforma: nuevaRedPlataforma, url: nuevaRedUrl.trim() }]);
    setNuevaRedUrl('');
  };

  const eliminarRed = (index: number) => {
    setRedes(redes.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    // Validaciones
    if (peso < 50 || peso > 130) {
      toast.error('El peso debe estar entre 50 y 130 kg');
      return;
    }
    if (estatura < 1.5 || estatura > 2.1) {
      toast.error('La estatura debe estar entre 1.50 y 2.10 m');
      return;
    }
    if (!apodo.trim() || apodo.length > 50) {
      toast.error('El apodo debe tener entre 1 y 50 caracteres');
      return;
    }
    if (anosExperiencia < 0 || anosExperiencia > 30) {
      toast.error('Los años de experiencia deben estar entre 0 y 30');
      return;
    }
    if (puntos < 0) {
      toast.error('Los puntos no pueden ser negativos');
      return;
    }
    if (amonestaciones < 0) {
      toast.error('Las amonestaciones no pueden ser negativas');
      return;
    }

    try {
      setGuardando(true);

      const datosActualizar = {
        peso,
        estatura,
        apodo: apodo.trim(),
        anos_experiencia: anosExperiencia,
        puntos_acumulados: puntos,
        amonestaciones,
        pasatiempos,
        musica_favorita: musica,
        redes_sociales: redes,
      };

      await jugadorService.actualizarJugador(jugadorId, datosActualizar, foto || undefined);

      toast.success('Jugador actualizado exitosamente');
      onActualizado();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      toast.error('Error al actualizar el jugador');
    } finally {
      setGuardando(false);
    }
  };

  const getInitials = (nombre: string) => {
    const parts = nombre.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : nombre.substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="w-6 h-6 text-[#00986C]" />
            Editar Jugador
          </DialogTitle>
          <DialogDescription>
            Actualiza la información de {datosIniciales.nombre_completo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Foto del Jugador */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Foto del Jugador</Label>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-[#00986C]">
                <AvatarImage src={previewFoto || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#00986C] to-[#6C9A8B] text-white text-2xl">
                  {getInitials(datosIniciales.nombre_completo)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="file"
                  id="foto-input"
                  accept="image/jpeg,image/png"
                  onChange={handleFotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('foto-input')?.click()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {foto ? 'Cambiar foto' : 'Subir foto'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">JPG o PNG, máximo 10MB</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Datos Básicos */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Datos Básicos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso */}
              <div className="space-y-2">
                <Label htmlFor="peso" className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-purple-600" />
                  Peso (kg)
                </Label>
                <Input
                  id="peso"
                  type="number"
                  min="50"
                  max="130"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500">Entre 50 y 130 kg</p>
              </div>

              {/* Estatura */}
              <div className="space-y-2">
                <Label htmlFor="estatura" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-orange-600" />
                  Estatura (m)
                </Label>
                <Input
                  id="estatura"
                  type="number"
                  min="1.5"
                  max="2.1"
                  step="0.01"
                  value={estatura}
                  onChange={(e) => setEstatura(parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500">Entre 1.50 y 2.10 m</p>
              </div>

              {/* Apodo */}
              <div className="space-y-2">
                <Label htmlFor="apodo" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Apodo
                </Label>
                <Input
                  id="apodo"
                  type="text"
                  maxLength={50}
                  value={apodo}
                  onChange={(e) => setApodo(e.target.value)}
                />
                <p className="text-xs text-gray-500">Máximo 50 caracteres</p>
              </div>

              {/* Años de Experiencia */}
              <div className="space-y-2">
                <Label htmlFor="experiencia" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Años de Experiencia
                </Label>
                <Input
                  id="experiencia"
                  type="number"
                  min="0"
                  max="30"
                  value={anosExperiencia}
                  onChange={(e) => setAnosExperiencia(parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Entre 0 y 30 años</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estadísticas */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Estadísticas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Puntos */}
              <div className="space-y-2">
                <Label htmlFor="puntos" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#00986C]" />
                  Puntos Acumulados
                </Label>
                <Input
                  id="puntos"
                  type="number"
                  min="0"
                  value={puntos}
                  onChange={(e) => setPuntos(parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Amonestaciones */}
              <div className="space-y-2">
                <Label htmlFor="amonestaciones" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Amonestaciones
                </Label>
                <Input
                  id="amonestaciones"
                  type="number"
                  min="0"
                  value={amonestaciones}
                  onChange={(e) => setAmonestaciones(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pasatiempos */}
          <div>
            <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Pasatiempos
            </Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ej: Leer, jugar videojuegos..."
                value={nuevoPasatiempo}
                onChange={(e) => setNuevoPasatiempo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarPasatiempo()}
                maxLength={200}
              />
              <Button type="button" onClick={agregarPasatiempo} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pasatiempos.map((pasatiempo, index) => (
                <Badge key={index} variant="outline" className="text-sm py-1.5 px-3">
                  {pasatiempo}
                  <button
                    type="button"
                    onClick={() => eliminarPasatiempo(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {pasatiempos.length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay pasatiempos agregados</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Máximo 10 pasatiempos</p>
          </div>

          <Separator />

          {/* Música Favorita */}
          <div>
            <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-500" />
              Música Favorita
            </Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ej: Rock, The Beatles..."
                value={nuevaMusica}
                onChange={(e) => setNuevaMusica(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarMusica()}
                maxLength={100}
              />
              <Button type="button" onClick={agregarMusica} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {musica.map((item, index) => (
                <Badge key={index} variant="outline" className="text-sm py-1.5 px-3">
                  <Music className="w-3 h-3 mr-1" />
                  {item}
                  <button
                    type="button"
                    onClick={() => eliminarMusica(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {musica.length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay música agregada</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Máximo 10 géneros/artistas</p>
          </div>

          <Separator />

          {/* Redes Sociales */}
          <div>
            <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-500" />
              Redes Sociales
            </Label>
            <div className="flex gap-2 mb-3">
              <Select value={nuevaRedPlataforma} onValueChange={(v) => setNuevaRedPlataforma(v as RedSocialNombre)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REDES_DISPONIBLES.map((red) => (
                    <SelectItem key={red} value={red}>
                      {red}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="https://..."
                value={nuevaRedUrl}
                onChange={(e) => setNuevaRedUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarRed()}
              />
              <Button type="button" onClick={agregarRed} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {redes.map((red, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{red.nombre_plataforma}</p>
                      <p className="text-xs text-gray-500 truncate max-w-md">{red.url}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarRed(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {redes.length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay redes sociales agregadas</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Máximo 5 redes sociales</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={guardando}
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
  );
};

export default ModalEditarJugador;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/ui/FileUpload';
import { Plus, Trash2, Edit, AlertCircle, Users, Target } from 'lucide-react';
import { FormJugador, Posicion, Ciudad, Sexo } from '@/types';
import { catalogoService } from '@/services';
import { toast } from 'react-toastify';

interface PasoJugadoresProps {
  jugadoresIniciales?: FormJugador[];
  onSiguiente: (jugadores: FormJugador[]) => void;
  onAnterior: () => void;
}

const PasoJugadores: React.FC<PasoJugadoresProps> = ({
  jugadoresIniciales = [],
  onSiguiente,
  onAnterior,
}) => {
  const [jugadores, setJugadores] = useState<FormJugador[]>(jugadoresIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [jugadorEditando, setJugadorEditando] = useState<number | null>(null);
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormJugador>();

  const [fotoJugador, setFotoJugador] = useState<File | null>(null);

  // Cargar catálogos
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [posicionesData, ciudadesData] = await Promise.all([
        catalogoService.obtenerPosiciones(),
        catalogoService.obtenerCiudades(),
      ]);
      setPosiciones(posicionesData);
      setCiudades(ciudadesData);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      toast.error('Error al cargar los datos necesarios');
    }
  };

  const abrirModalAgregar = () => {
    reset({
      nombre_completo: '',
      sexo: 'Masculino',
      fecha_nacimiento: '',
      peso: 70,
      estatura: 1.75,
      apodo: '',
      posicion_id: undefined,
      ciudad_nacimiento_id: undefined,
      anos_experiencia: 0,
      correo_electronico: '',
      foto: null,
    });
    setFotoJugador(null);
    setJugadorEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (index: number) => {
    const jugador = jugadores[index];
    reset(jugador);
    setFotoJugador(jugador.foto || null);
    setJugadorEditando(index);
    setModalAbierto(true);
  };

  const guardarJugador = (data: FormJugador) => {
    const jugadorCompleto = {
      ...data,
      foto: fotoJugador,
    };

    if (jugadorEditando !== null) {
      // Editar jugador existente
      const nuevosJugadores = [...jugadores];
      nuevosJugadores[jugadorEditando] = jugadorCompleto;
      setJugadores(nuevosJugadores);
      toast.success('Jugador actualizado');
    } else {
      // Agregar nuevo jugador
      setJugadores([...jugadores, jugadorCompleto]);
      toast.success('Jugador agregado');
    }

    setModalAbierto(false);
    setJugadorEditando(null);
    setFotoJugador(null);
  };

  const eliminarJugador = (index: number) => {
    const nuevosJugadores = jugadores.filter((_, i) => i !== index);
    setJugadores(nuevosJugadores);
    toast.success('Jugador eliminado');
  };

  const validarYContinuar = () => {
    // Validar mínimo de jugadores
    if (jugadores.length < 8) {
      toast.error('Debes agregar al menos 8 jugadores');
      return;
    }

    // Validar máximo de jugadores
    if (jugadores.length > 25) {
      toast.error('No puedes agregar más de 25 jugadores');
      return;
    }

    // Validar posiciones obligatorias
    const posicionesJugadores = jugadores.map(j => j.posicion_id);
    
    const tienePortero = posicionesJugadores.includes(1); // ID 1 = Portero
    const tieneDefensa = posicionesJugadores.some(id => [2, 3, 4].includes(id)); // Defensas
    const tieneMedio = posicionesJugadores.some(id => [5, 6, 7, 8, 9].includes(id)); // Medios
    const tieneDelantero = posicionesJugadores.some(id => [10, 11].includes(id)); // Delanteros

    if (!tienePortero) {
      toast.error('Debes tener al menos 1 Portero');
      return;
    }
    if (!tieneDefensa) {
      toast.error('Debes tener al menos 1 Defensa');
      return;
    }
    if (!tieneMedio) {
      toast.error('Debes tener al menos 1 Mediocampista');
      return;
    }
    if (!tieneDelantero) {
      toast.error('Debes tener al menos 1 Delantero');
      return;
    }

    onSiguiente(jugadores);
  };

  const obtenerNombrePosicion = (id: number) => {
    return posiciones.find(p => p.id === id)?.nombre || 'Sin posición';
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

  return (
    <div className="space-y-6">
      {/* Header con contador */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-verde-primavera" />
              <span>Jugadores del Equipo</span>
            </CardTitle>
            <Badge
              variant={jugadores.length >= 8 ? 'default' : 'destructive'}
              className={jugadores.length >= 8 ? 'bg-verde-primavera' : ''}
            >
              {jugadores.length} / 25 jugadores
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Mínimo 8 jugadores • Máximo 25 jugadores • Posiciones obligatorias: 1 Portero, 1 Defensa, 1 Medio, 1 Delantero
          </p>
        </CardHeader>
      </Card>

      {/* Botón para agregar jugador */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={abrirModalAgregar}
          className="bg-verde-primavera hover:bg-verde-primavera/90"
          disabled={jugadores.length >= 25}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Jugador
        </Button>
      </div>

      {/* Lista de jugadores */}
      {jugadores.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No hay jugadores agregados</h3>
              <p className="text-muted-foreground">
                Comienza agregando jugadores al equipo
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jugadores.map((jugador, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {/* Número */}
                  <div className="flex-shrink-0 w-10 h-10 bg-verde-primavera rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>

                  {/* Info del jugador */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{jugador.nombre_completo}</h4>
                    <p className="text-sm text-muted-foreground italic">{jugador.apodo}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {obtenerNombrePosicion(jugador.posicion_id)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {calcularEdad(jugador.fecha_nacimiento)} años
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {jugador.anos_experiencia} años exp.
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {jugador.correo_electronico}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEditar(index)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarJugador(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Validaciones */}
      {jugadores.length > 0 && jugadores.length < 8 && (
        <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>Necesitas agregar al menos {8 - jugadores.length} jugador(es) más</span>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onAnterior}>
          Anterior
        </Button>
        <Button
          type="button"
          onClick={validarYContinuar}
          className="bg-verde-primavera hover:bg-verde-primavera/90"
          disabled={jugadores.length < 8 || jugadores.length > 25}
        >
          Siguiente: Agregar Extras
        </Button>
      </div>

      {/* Modal para agregar/editar jugador */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {jugadorEditando !== null ? 'Editar Jugador' : 'Agregar Jugador'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(guardarJugador)} className="space-y-4">
            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre_completo"
                {...register('nombre_completo', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                  maxLength: { value: 150, message: 'Máximo 150 caracteres' },
                })}
                placeholder="Ej: Juan Pérez García"
              />
              {errors.nombre_completo && (
                <span className="text-red-500 text-sm">{errors.nombre_completo.message}</span>
              )}
            </div>

            {/* Grid 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sexo */}
              <div className="space-y-2">
                <Label htmlFor="sexo">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('sexo', value as Sexo)}
                  defaultValue={watch('sexo')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  {...register('fecha_nacimiento', {
                    required: 'La fecha es obligatoria',
                    validate: (value) => {
                      const edad = calcularEdad(value);
                      if (edad < 16) return 'Edad mínima: 16 años';
                      if (edad > 45) return 'Edad máxima: 45 años';
                      return true;
                    },
                  })}
                />
                {errors.fecha_nacimiento && (
                  <span className="text-red-500 text-sm">{errors.fecha_nacimiento.message}</span>
                )}
              </div>

              {/* Peso */}
              <div className="space-y-2">
                <Label htmlFor="peso">
                  Peso (kg) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  {...register('peso', {
                    required: 'El peso es obligatorio',
                    min: { value: 50, message: 'Peso mínimo: 50 kg' },
                    max: { value: 130, message: 'Peso máximo: 130 kg' },
                  })}
                />
                {errors.peso && (
                  <span className="text-red-500 text-sm">{errors.peso.message}</span>
                )}
              </div>

              {/* Estatura */}
              <div className="space-y-2">
                <Label htmlFor="estatura">
                  Estatura (m) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estatura"
                  type="number"
                  step="0.01"
                  {...register('estatura', {
                    required: 'La estatura es obligatoria',
                    min: { value: 1.5, message: 'Estatura mínima: 1.50 m' },
                    max: { value: 2.1, message: 'Estatura máxima: 2.10 m' },
                  })}
                />
                {errors.estatura && (
                  <span className="text-red-500 text-sm">{errors.estatura.message}</span>
                )}
              </div>

              {/* Apodo */}
              <div className="space-y-2">
                <Label htmlFor="apodo">
                  Apodo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apodo"
                  {...register('apodo', {
                    required: 'El apodo es obligatorio',
                    minLength: { value: 1, message: 'Mínimo 1 caracter' },
                    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                  })}
                  placeholder="Ej: El Rayo"
                />
                {errors.apodo && (
                  <span className="text-red-500 text-sm">{errors.apodo.message}</span>
                )}
              </div>

              {/* Posición */}
              <div className="space-y-2">
                <Label htmlFor="posicion_id">
                  Posición <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('posicion_id', parseInt(value))}
                  defaultValue={watch('posicion_id')?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {posiciones.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id.toString()}>
                        {pos.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.posicion_id && (
                  <span className="text-red-500 text-sm">La posición es obligatoria</span>
                )}
              </div>

              {/* Ciudad de nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="ciudad_nacimiento_id">
                  Ciudad de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('ciudad_nacimiento_id', parseInt(value))}
                  defaultValue={watch('ciudad_nacimiento_id')?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ciudades.map((ciudad) => (
                      <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                        {ciudad.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ciudad_nacimiento_id && (
                  <span className="text-red-500 text-sm">La ciudad es obligatoria</span>
                )}
              </div>

              {/* Años de experiencia */}
              <div className="space-y-2">
                <Label htmlFor="anos_experiencia">
                  Años de Experiencia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="anos_experiencia"
                  type="number"
                  {...register('anos_experiencia', {
                    required: 'La experiencia es obligatoria',
                    min: { value: 0, message: 'Mínimo: 0 años' },
                    max: { value: 30, message: 'Máximo: 30 años' },
                  })}
                />
                {errors.anos_experiencia && (
                  <span className="text-red-500 text-sm">{errors.anos_experiencia.message}</span>
                )}
              </div>
            </div>

            {/* Correo electrónico */}
            <div className="space-y-2">
              <Label htmlFor="correo_electronico">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="correo_electronico"
                type="email"
                {...register('correo_electronico', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Correo inválido',
                  },
                })}
                placeholder="ejemplo@correo.com"
              />
              {errors.correo_electronico && (
                <span className="text-red-500 text-sm">{errors.correo_electronico.message}</span>
              )}
            </div>

            {/* Foto */}
            <div className="space-y-2">
              <Label>Foto del Jugador (Opcional)</Label>
              <p className="text-sm text-muted-foreground">JPG o PNG, máximo 10MB</p>
              <FileUpload
                onFileSelect={setFotoJugador}
                accept="image/jpeg,image/png"
                maxSize={10}
                preview={true}
                label="Seleccionar foto del jugador"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-verde-primavera hover:bg-verde-primavera/90">
                {jugadorEditando !== null ? 'Guardar Cambios' : 'Agregar Jugador'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasoJugadores;
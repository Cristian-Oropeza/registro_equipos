import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/ui/FileUpload';
import ColorPicker from '@/components/ui/ColorPicker';
import { AlertCircle } from 'lucide-react';
import { FormEquipo } from '@/types';

interface PasoEquipoProps {
  datosIniciales?: FormEquipo;
  onSiguiente: (datos: FormEquipo) => void;
}

const PasoEquipo: React.FC<PasoEquipoProps> = ({ datosIniciales, onSiguiente }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormEquipo>({
    defaultValues: datosIniciales || {
      nombre: '',
      colores: [],
      logotipo: null,
    },
  });

  const [colores, setColores] = useState<string[]>(datosIniciales?.colores || []);
  const [logotipo, setLogotipo] = useState<File | null>(datosIniciales?.logotipo || null);

  const onSubmit = (data: FormEquipo) => {
    // Validar colores
    if (colores.length === 0) {
      return;
    }

    onSiguiente({
      ...data,
      colores,
      logotipo,
    });
  };

  const handleColoresChange = (nuevosColores: string[]) => {
    setColores(nuevosColores);
    setValue('colores', nuevosColores);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre del equipo */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Equipo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
              placeholder="Ej: Águilas del Norte"
            />
            {errors.nombre && (
              <div className="flex items-center space-x-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.nombre.message}</span>
              </div>
            )}
          </div>

          {/* Colores del equipo */}
          <div className="space-y-2">
            <Label>
              Colores del Equipo <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Selecciona entre 1 y 5 colores representativos
            </p>
            <ColorPicker
              colores={colores}
              onChange={handleColoresChange}
              min={1}
              max={5}
            />
            {colores.length === 0 && (
              <div className="flex items-center space-x-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Debes seleccionar al menos 1 color</span>
              </div>
            )}
          </div>

        {/* Logo del equipo */}
        <div className="space-y-2">
        <Label htmlFor="logotipo">Logo del Equipo (Opcional)</Label>
        <p className="text-sm text-muted-foreground mb-2">
            JPG o PNG, máximo 10MB
        </p>
        <FileUpload
            onFileSelect={setLogotipo}
            accept="image/jpeg,image/png"
            maxSize={10}
            preview={true}
            label="Arrastra el logo aquí o haz clic para seleccionar"
        />
        </div>
        </CardContent>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-verde-primavera hover:bg-verde-primavera/90"
        >
          Siguiente: Agregar Jugadores
        </Button>
      </div>
    </form>
  );
};

export default PasoEquipo;
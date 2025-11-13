import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  colores: string[];
  onChange: (colores: string[]) => void;
  min?: number;
  max?: number;
  error?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colores,
  onChange,
  min = 1,
  max = 5,
  error,
}) => {
  const [nuevoColor, setNuevoColor] = useState('#000000');

  const agregarColor = () => {
    if (colores.length >= max) {
      return;
    }

    if (!colores.includes(nuevoColor)) {
      onChange([...colores, nuevoColor]);
    }
  };

  const eliminarColor = (index: number) => {
    if (colores.length <= min) {
      return;
    }

    const nuevosColores = colores.filter((_, i) => i !== index);
    onChange(nuevosColores);
  };

  const isValidHex = (color: string) => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          Colores del equipo
          <span className="text-muted-foreground ml-2 text-xs">
            (mín: {min}, máx: {max})
          </span>
        </Label>
      </div>

      {/* Colores seleccionados */}
      <div className="flex flex-wrap gap-2">
        {colores.map((color, index) => (
          <Card
            key={index}
            className="relative group overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <div className="w-20 h-20 flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => eliminarColor(index)}
                disabled={colores.length <= min}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
              {color}
            </div>
          </Card>
        ))}

        {/* Agregar nuevo color */}
        {colores.length < max && (
          <Card className="w-20 h-20 flex items-center justify-center border-2 border-dashed cursor-pointer hover:border-verde-primavera transition-colors">
            <div className="text-center">
              <input
                type="color"
                value={nuevoColor}
                onChange={(e) => setNuevoColor(e.target.value)}
                className="opacity-0 absolute w-20 h-20 cursor-pointer"
              />
              <Plus className="w-8 h-8 text-muted-foreground mx-auto" />
            </div>
          </Card>
        )}
      </div>

      {/* Input manual de color */}
      {colores.length < max && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="#000000"
              value={nuevoColor}
              onChange={(e) => setNuevoColor(e.target.value.toUpperCase())}
              maxLength={7}
              className={cn(!isValidHex(nuevoColor) && 'border-red-500')}
            />
          </div>
          <Button
            type="button"
            onClick={agregarColor}
            disabled={!isValidHex(nuevoColor) || colores.includes(nuevoColor)}
            className="bg-verde-primavera hover:bg-verde-primavera/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Ayuda */}
      <p className="text-xs text-muted-foreground">
        Haz click en el cuadro con + o ingresa un color en formato hexadecimal (ej: #FF5733)
      </p>
    </div>
  );
};

export default ColorPicker;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, X, Music, Heart, Share2, AlertCircle } from 'lucide-react';
import { FormJugador, FormExtrasJugador, RedSocialNombre } from '@/types';
import { toast } from 'react-toastify';

interface PasoExtrasProps {
  jugadores: FormJugador[];
  extrasIniciales?: Map<number, FormExtrasJugador>;
  onSiguiente: (extras: Map<number, FormExtrasJugador>) => void;
  onAnterior: () => void;
}

const REDES_SOCIALES: RedSocialNombre[] = [
  'Facebook',
  'Instagram',
  'X (Twitter)',
  'TikTok',
  'YouTube',
];

const PasoExtras: React.FC<PasoExtrasProps> = ({
  jugadores,
  extrasIniciales,
  onSiguiente,
  onAnterior,
}) => {
  const [extras, setExtras] = useState<Map<number, FormExtrasJugador>>(
    extrasIniciales || new Map()
  );

  // Estados temporales para inputs
  const [pasatiempoTemp, setPasatiempoTemp] = useState<{ [key: number]: string }>({});
  const [musicaTemp, setMusicaTemp] = useState<{ [key: number]: string }>({});
  const [redSocialTemp, setRedSocialTemp] = useState<{
    [key: number]: { plataforma: RedSocialNombre; url: string };
  }>({});

  const obtenerExtras = (jugadorIndex: number): FormExtrasJugador => {
    return (
      extras.get(jugadorIndex) || {
        jugador_index: jugadorIndex,
        pasatiempos: [],
        musica_favorita: [],
        redes_sociales: [],
      }
    );
  };

  const actualizarExtras = (jugadorIndex: number, nuevosExtras: FormExtrasJugador) => {
    const nuevosExtrasMap = new Map(extras);
    nuevosExtrasMap.set(jugadorIndex, nuevosExtras);
    setExtras(nuevosExtrasMap);
  };

  // Pasatiempos
  const agregarPasatiempo = (jugadorIndex: number) => {
    const pasatiempo = pasatiempoTemp[jugadorIndex]?.trim();
    if (!pasatiempo) {
      toast.error('Escribe un pasatiempo');
      return;
    }

    const extrasActuales = obtenerExtras(jugadorIndex);
    if (extrasActuales.pasatiempos.length >= 8) {
      toast.error('Máximo 8 pasatiempos');
      return;
    }

    actualizarExtras(jugadorIndex, {
      ...extrasActuales,
      pasatiempos: [...extrasActuales.pasatiempos, pasatiempo],
    });

    setPasatiempoTemp({ ...pasatiempoTemp, [jugadorIndex]: '' });
  };

  const eliminarPasatiempo = (jugadorIndex: number, index: number) => {
    const extrasActuales = obtenerExtras(jugadorIndex);
    actualizarExtras(jugadorIndex, {
      ...extrasActuales,
      pasatiempos: extrasActuales.pasatiempos.filter((_, i) => i !== index),
    });
  };

  // Música
  const agregarMusica = (jugadorIndex: number) => {
    const musica = musicaTemp[jugadorIndex]?.trim();
    if (!musica) {
      toast.error('Escribe una canción o artista');
      return;
    }

    const extrasActuales = obtenerExtras(jugadorIndex);
    if (extrasActuales.musica_favorita.length >= 8) {
      toast.error('Máximo 8 canciones/artistas');
      return;
    }

    actualizarExtras(jugadorIndex, {
      ...extrasActuales,
      musica_favorita: [...extrasActuales.musica_favorita, musica],
    });

    setMusicaTemp({ ...musicaTemp, [jugadorIndex]: '' });
  };

  const eliminarMusica = (jugadorIndex: number, index: number) => {
    const extrasActuales = obtenerExtras(jugadorIndex);
    actualizarExtras(jugadorIndex, {
      ...extrasActuales,
      musica_favorita: extrasActuales.musica_favorita.filter((_, i) => i !== index),
    });
  };

  // Redes sociales
  const agregarRedSocial = (jugadorIndex: number) => {
    const red = redSocialTemp[jugadorIndex];
    if (!red || !red.plataforma || !red.url.trim()) {
      toast.error('Completa los datos de la red social');
      return;
    }

    // Validar URL
    try {
      new URL(red.url);
    } catch {
      toast.error('URL inválida');
      return;
    }

    const extrasActuales = obtenerExtras(jugadorIndex);
    if (extrasActuales.redes_sociales.length >= 4) {
      toast.error('Máximo 4 redes sociales');
      return;
    }

    // Verificar que no esté duplicada la plataforma
    if (extrasActuales.redes_sociales.some(r => r.nombre_plataforma === red.plataforma)) {
      toast.error('Ya agregaste esta red social');
      return;
    }

    actualizarExtras(jugadorIndex, {
      ...extrasActuales,
      redes_sociales: [
        ...extrasActuales.redes_sociales,
        { nombre_plataforma: red.plataforma, url: red.url },
      ],
    });

    setRedSocialTemp({
      ...redSocialTemp,
      [jugadorIndex]: { plataforma: 'Facebook', url: '' },
    });
  };

  const eliminarRedSocial = (jugadorIndex: number, index: number) => {
    const extrasActuales = obtenerExtras(jugadorIndex);
    actualizarExtras(jugadorIndex, {
      ...extrasActuales,
      redes_sociales: extrasActuales.redes_sociales.filter((_, i) => i !== index),
    });
  };

  const handleContinuar = () => {
    onSiguiente(extras);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Extras de Jugadores (Opcional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Agrega información adicional sobre los pasatiempos, música favorita y redes sociales de cada jugador.
            Este paso es completamente opcional.
          </p>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="space-y-4">
        {jugadores.map((jugador, index) => {
          const extrasJugador = obtenerExtras(index);
          const totalExtras =
            extrasJugador.pasatiempos.length +
            extrasJugador.musica_favorita.length +
            extrasJugador.redes_sociales.length;

          return (
            <AccordionItem key={index} value={`jugador-${index}`}>
              <Card>
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-verde-primavera rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold">{jugador.nombre_completo}</h4>
                        <p className="text-sm text-muted-foreground">{jugador.apodo}</p>
                      </div>
                    </div>
                    {totalExtras > 0 && (
                      <Badge variant="secondary">{totalExtras} extras</Badge>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <CardContent className="space-y-6 pt-4">
                    {/* Pasatiempos */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-verde-primavera" />
                        <Label>Pasatiempos (máximo 8)</Label>
                      </div>

                      <div className="flex space-x-2">
                        <Input
                          placeholder="Ej: Leer, jugar videojuegos..."
                          value={pasatiempoTemp[index] || ''}
                          onChange={(e) =>
                            setPasatiempoTemp({ ...pasatiempoTemp, [index]: e.target.value })
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              agregarPasatiempo(index);
                            }
                          }}
                          maxLength={200}
                        />
                        <Button
                          type="button"
                          onClick={() => agregarPasatiempo(index)}
                          disabled={extrasJugador.pasatiempos.length >= 8}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {extrasJugador.pasatiempos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {extrasJugador.pasatiempos.map((pasatiempo, i) => (
                            <Badge key={i} variant="secondary" className="pl-3 pr-1">
                              {pasatiempo}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-2"
                                onClick={() => eliminarPasatiempo(index, i)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Música */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Music className="w-5 h-5 text-verde-primavera" />
                        <Label>Música Favorita (máximo 8)</Label>
                      </div>

                      <div className="flex space-x-2">
                        <Input
                          placeholder="Ej: Rock, Banda MS, Bad Bunny..."
                          value={musicaTemp[index] || ''}
                          onChange={(e) =>
                            setMusicaTemp({ ...musicaTemp, [index]: e.target.value })
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              agregarMusica(index);
                            }
                          }}
                          maxLength={100}
                        />
                        <Button
                          type="button"
                          onClick={() => agregarMusica(index)}
                          disabled={extrasJugador.musica_favorita.length >= 8}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {extrasJugador.musica_favorita.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {extrasJugador.musica_favorita.map((musica, i) => (
                            <Badge key={i} variant="secondary" className="pl-3 pr-1">
                              {musica}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-2"
                                onClick={() => eliminarMusica(index, i)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Redes Sociales */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Share2 className="w-5 h-5 text-verde-primavera" />
                        <Label>Redes Sociales (máximo 4)</Label>
                      </div>

                      <div className="flex space-x-2">
                        <Select
                          value={redSocialTemp[index]?.plataforma || 'Facebook'}
                          onValueChange={(value) =>
                            setRedSocialTemp({
                              ...redSocialTemp,
                              [index]: {
                                plataforma: value as RedSocialNombre,
                                url: redSocialTemp[index]?.url || '',
                              },
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REDES_SOCIALES.map((red) => (
                              <SelectItem key={red} value={red}>
                                {red}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="https://..."
                          value={redSocialTemp[index]?.url || ''}
                          onChange={(e) =>
                            setRedSocialTemp({
                              ...redSocialTemp,
                              [index]: {
                                plataforma: redSocialTemp[index]?.plataforma || 'Facebook',
                                url: e.target.value,
                              },
                            })
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => agregarRedSocial(index)}
                          disabled={extrasJugador.redes_sociales.length >= 4}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {extrasJugador.redes_sociales.length > 0 && (
                        <div className="space-y-2">
                          {extrasJugador.redes_sociales.map((red, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{red.nombre_plataforma}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {red.url}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => eliminarRedSocial(index, i)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Info */}
      <div className="flex items-start space-x-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Este paso es completamente opcional. Puedes omitir la información de extras si lo deseas
          y continuar con el registro.
        </p>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onAnterior}>
          Anterior
        </Button>
        <Button
          type="button"
          onClick={handleContinuar}
          className="bg-verde-primavera hover:bg-verde-primavera/90"
        >
          Finalizar Registro
        </Button>
      </div>
    </div>
  );
};

export default PasoExtras;
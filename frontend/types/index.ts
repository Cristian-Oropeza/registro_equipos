// TIPOS Y ENUMS
export type Sexo = 'Masculino' | 'Femenino' | 'Otro';

export type RedSocialNombre = 
  | 'Facebook' 
  | 'Instagram' 
  | 'X (Twitter)' 
  | 'TikTok' 
  | 'YouTube';

// CATÁLOGOS
export interface Ciudad {
  id: number;
  nombre: string;
}

export interface Posicion {
  id: number;
  nombre: string;
}

// EQUIPO
export interface Equipo {
  id: number;
  nombre: string;
  logotipo: string | null;
  juegos_ganados: number;
  juegos_perdidos: number;
  fecha_registro: string;
  colores?: ColorEquipo[];
  jugadores?: Jugador[];
  total_jugadores?: number;
}

export interface ColorEquipo {
  id: number;
  equipo_id: number;
  color_hex: string;
}

// JUGADOR
export interface Jugador {
  id: number;
  equipo_id: number;
  nombre_completo: string;
  sexo: Sexo;
  fecha_nacimiento: string;
  peso: number;
  estatura: number;
  apodo: string;
  posicion_id: number;
  foto: string | null;
  ciudad_nacimiento_id: number;
  anos_experiencia: number;
  correo_electronico: string;
  folio: string;
  amonestaciones: number;
  puntos_acumulados: number;
  fecha_registro: string;
  // Relaciones (cuando se incluyen en queries)
  equipo?: Equipo;
  posicion?: Posicion;
  ciudad_nacimiento?: Ciudad;
  pasatiempos?: Pasatiempo[];
  musica_favorita?: MusicaFavorita[];
  redes_sociales?: RedSocial[];
}

// EXTRAS DE JUGADOR
export interface Pasatiempo {
  id: number;
  jugador_id: number;
  descripcion: string;
}

export interface MusicaFavorita {
  id: number;
  jugador_id: number;
  descripcion: string;
}

export interface RedSocial {
  id: number;
  jugador_id: number;
  nombre_plataforma: RedSocialNombre;
  url: string;
}

// RESPUESTAS API
export interface ApiResponse<T = unknown> {
  success: boolean;
  mensaje?: string;
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  mensaje: string;
  error?: string;
}

// DATOS DE FORMULARIOS

// Formulario de Equipo (Paso 1)
export interface FormEquipo {
  nombre: string;
  colores: string[];
  logotipo?: File | null;
}

// Formulario de Jugador (Paso 2)
export interface FormJugador {
  nombre_completo: string;
  sexo: Sexo;
  fecha_nacimiento: string;
  peso: number;
  estatura: number;
  apodo: string;
  posicion_id: number;
  ciudad_nacimiento_id: number;
  anos_experiencia: number;
  correo_electronico: string;
  foto?: File | null;
}

// Formulario de Extras (Paso 3)
export interface FormExtrasJugador {
  jugador_index: number;
  pasatiempos: string[];
  musica_favorita: string[];
  redes_sociales: FormRedSocial[];
}

export interface FormRedSocial {
  nombre_plataforma: RedSocialNombre;
  url: string;
}

// Datos completos para registro
export interface RegistroEquipoCompleto {
  equipo: {
    nombre: string;
    colores: string[];
  };
  jugadores: Array<{
    nombre_completo: string;
    sexo: Sexo;
    fecha_nacimiento: string;
    peso: number;
    estatura: number;
    apodo: string;
    posicion_id: number;
    ciudad_nacimiento_id: number;
    anos_experiencia: number;
    correo_electronico: string;
    pasatiempos?: string[];
    musica_favorita?: string[];
    redes_sociales?: FormRedSocial[];
  }>;
}

// Respuestas específicas
export interface RegistroEquipoResponse {
  success: true;
  mensaje: string;
  data: {
    equipo_id: number;
    total_jugadores: number;
    folios: string[];
    correos_enviados: number;
  };
}

export interface EquipoDetalleResponse {
  success: true;
  data: Equipo & {
    colores: ColorEquipo[];
    jugadores: Jugador[];
  };
}

export interface JugadorDetalleResponse {
  success: true;
  data: Jugador & {
    equipo: Equipo;
    posicion: Posicion;
    ciudad_nacimiento: Ciudad;
    pasatiempos: Pasatiempo[];
    musica_favorita: MusicaFavorita[];
    redes_sociales: RedSocial[];
  };
}

// FILTROS
export interface FiltrosEquipos {
  nombre?: string;
}

export interface FiltrosJugadores {
  equipo?: number;
  nombre?: string;
  posicion?: number;
  ciudad?: number;
}

// ACTUALIZACIÓN
export interface ActualizarEquipo {
  colores?: string[];
  juegos_ganados?: number;
  juegos_perdidos?: number;
  logotipo?: File | null;
}

export interface ActualizarJugador {
  peso?: number;
  estatura?: number;
  apodo?: string;
  anos_experiencia?: number;
  amonestaciones?: number;
  puntos_acumulados?: number;
  foto?: File | null;
  pasatiempos?: string[];
  musica_favorita?: string[];
  redes_sociales?: FormRedSocial[];
}

// VALIDACIONES (útiles para el frontend)
export interface ValidationError {
  field: string;
  message: string;
}

// ESTADO DEL FORMULARIO MULTI-PASO
export interface RegistroState {
  pasoActual: number;
  datosEquipo: FormEquipo | null;
  jugadores: FormJugador[];
  extrasJugadores: Map<number, FormExtrasJugador>;
}

// UTILIDADES
export type OrderBy = 'asc' | 'desc';

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: OrderBy;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
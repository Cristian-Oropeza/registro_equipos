// Validaciones
export const VALIDACIONES = {
  // Equipo
  NOMBRE_EQUIPO_MIN: 3,
  NOMBRE_EQUIPO_MAX: 100,
  COLORES_MIN: 1,
  COLORES_MAX: 5,
  
  // Jugador
  NOMBRE_JUGADOR_MIN: 5,
  NOMBRE_JUGADOR_MAX: 150,
  EDAD_MIN: 16,
  EDAD_MAX: 45,
  PESO_MIN: 50,
  PESO_MAX: 130,
  ESTATURA_MIN: 1.50,
  ESTATURA_MAX: 2.10,
  APODO_MIN: 1,
  APODO_MAX: 50,
  EXPERIENCIA_MIN: 0,
  EXPERIENCIA_MAX: 30,
  
  // Extras
  PASATIEMPOS_MAX: 10,
  MUSICA_MAX: 10,
  REDES_SOCIALES_MAX: 5,
  
  // Equipo completo
  JUGADORES_MIN: 8,
  JUGADORES_MAX: 25,
  
  // Archivos
  ARCHIVO_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ARCHIVO_TIPOS_PERMITIDOS: ['image/jpeg', 'image/png']
}

// Tipos para opciones
interface Opcion {
  value: string
  label: string
}

// Sexos
export const SEXOS: Opcion[] = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' }
]

// Redes sociales soportadas
export const REDES_SOCIALES: Opcion[] = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'YouTube', label: 'YouTube' }
]

// Mensajes de error comunes
export const MENSAJES_ERROR = {
  REQUERIDO: 'Este campo es obligatorio',
  EMAIL_INVALIDO: 'Correo electrónico inválido',
  ARCHIVO_GRANDE: 'El archivo es demasiado grande (máximo 10MB)',
  ARCHIVO_TIPO: 'Solo se permiten archivos JPG o PNG',
  EDAD_INVALIDA: 'La edad debe estar entre 16 y 45 años',
  PESO_INVALIDO: 'El peso debe estar entre 50 y 130 kg',
  ESTATURA_INVALIDA: 'La estatura debe estar entre 1.50 y 2.10 m'
}

// Colores del proyecto
export const COLORES = {
  VERDE_PRIMAVERA: '#00FF7F',
  JUNIPER: '#6C9A8B',
  AZUL_MARINO: '#000080'
}
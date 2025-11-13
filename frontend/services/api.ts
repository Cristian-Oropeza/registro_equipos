import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ mensaje?: string }>) => {
    // Extraer mensaje de error del backend
    const mensaje = error.response?.data?.mensaje || 'Error de conexión con el servidor'
    
    console.error('Error API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      mensaje
    })
    
    return Promise.reject(error)
  }
)

// Helper para crear FormData
export const crearFormData = (datos: Record<string, unknown>): FormData => {
  const formData = new FormData()
  
  Object.keys(datos).forEach(key => {
    const valor = datos[key]
    
    if (valor instanceof File) {
      // Si es un archivo, agregarlo directamente
      formData.append(key, valor)
    } else if (Array.isArray(valor) || (typeof valor === 'object' && valor !== null)) {
      // Si es array u objeto, convertir a JSON string
      formData.append(key, JSON.stringify(valor))
    } else if (valor !== null && valor !== undefined) {
      // Si es primitivo, agregarlo como string
      formData.append(key, String(valor))
    }
  })
  
  return formData
}

// Helper para obtener URL completa de imagen
export const obtenerURLImagen = (ruta: string | null | undefined): string | null => {
  if (!ruta) return null
  if (ruta.startsWith('http')) return ruta
  return `http://localhost:5000/${ruta}`
}

export default api
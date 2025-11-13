import api from './api';
import {
  ApiResponse,
  Equipo,
  RegistroEquipoCompleto,
  RegistroEquipoResponse,
  EquipoDetalleResponse,
  FiltrosEquipos,
  ActualizarEquipo,
  Jugador
} from '@/types';

class EquipoService {
  // Registrar equipo completo (con jugadores)
  async registrarEquipo(datos: RegistroEquipoCompleto, archivos: {
    logotipo?: File;
    fotos?: Map<number, File>;
  }): Promise<RegistroEquipoResponse['data']> {
    try {
      const formData = new FormData();
      
      // Datos del equipo
      formData.append('equipo', JSON.stringify(datos.equipo));
      
      // Datos de jugadores
      formData.append('jugadores', JSON.stringify(datos.jugadores));
      
      // Logo del equipo
      if (archivos.logotipo) {
        formData.append('logotipo', archivos.logotipo);
      }
      
      // Fotos de jugadores
      if (archivos.fotos) {
        archivos.fotos.forEach((foto, index) => {
          formData.append(`foto_${index}`, foto);
        });
      }
      
      const response = await api.post<RegistroEquipoResponse>(
        '/equipos/registrar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error al registrar equipo:', error);
      throw error;
    }
  }

  // Listar todos los equipos
  async obtenerEquipos(filtros?: FiltrosEquipos): Promise<Equipo[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.nombre) {
        params.append('nombre', filtros.nombre);
      }
      
      const url = `/equipos${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<Equipo[]>>(url);
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      throw error;
    }
  }

  // Obtener equipo por ID (con jugadores y colores)
  async obtenerEquipoPorId(id: number): Promise<EquipoDetalleResponse['data']> {
    try {
      const response = await api.get<EquipoDetalleResponse>(`/equipos/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener equipo:', error);
      throw error;
    }
  }

  // Obtener jugadores de un equipo
  async obtenerJugadoresEquipo(equipoId: number, filtros?: {
    nombre?: string;
    posicion?: number;
    ciudad?: number;
  }): Promise<Jugador[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.nombre) {
        params.append('nombre', filtros.nombre);
      }
      if (filtros?.posicion) {
        params.append('posicion', filtros.posicion.toString());
      }
      if (filtros?.ciudad) {
        params.append('ciudad', filtros.ciudad.toString());
      }
      
      const url = `/equipos/${equipoId}/jugadores${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<Jugador[]>>(url);
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener jugadores del equipo:', error);
      throw error;
    }
  }

  // Actualizar equipo
  async actualizarEquipo(id: number, datos: ActualizarEquipo, logoNuevo?: File): Promise<void> {
    try {
      const formData = new FormData();
      
      // Datos a actualizar
      if (datos.colores) {
        formData.append('colores', JSON.stringify(datos.colores));
      }
      if (datos.juegos_ganados !== undefined) {
        formData.append('juegos_ganados', datos.juegos_ganados.toString());
      }
      if (datos.juegos_perdidos !== undefined) {
        formData.append('juegos_perdidos', datos.juegos_perdidos.toString());
      }
      
      // Logo nuevo
      if (logoNuevo) {
        formData.append('logotipo', logoNuevo);
      }
      
      await api.put(`/equipos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      throw error;
    }
  }

  // Eliminar equipo
  async eliminarEquipo(id: number): Promise<void> {
    try {
      await api.delete(`/equipos/${id}`);
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      throw error;
    }
  }

  // Actualizar estadísticas del equipo
  async actualizarEstadisticas(id: number, datos: {
    juegos_ganados: number;
    juegos_perdidos: number;
  }): Promise<void> {
    try {
      await api.put(`/equipos/${id}`, datos);
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  // Actualizar colores del equipo
  async actualizarColores(id: number, colores: string[]): Promise<void> {
    try {
      await api.put(`/equipos/${id}`, { colores });
    } catch (error) {
      console.error('Error al actualizar colores:', error);
      throw error;
    }
  }

  // Actualizar logo del equipo
  async actualizarLogo(id: number, logo: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('logotipo', logo);
      
      await api.put(`/equipos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error al actualizar logo:', error);
      throw error;
    }
  }
}

export default new EquipoService();
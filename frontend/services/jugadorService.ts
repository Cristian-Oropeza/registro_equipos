import api from './api';
import {
  ApiResponse,
  Jugador,
  JugadorDetalleResponse,
  FiltrosJugadores,
  ActualizarJugador
} from '@/types';

class JugadorService {
  // Listar todos los jugadores
  async obtenerJugadores(filtros?: FiltrosJugadores): Promise<Jugador[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.equipo) {
        params.append('equipo', filtros.equipo.toString());
      }
      if (filtros?.nombre) {
        params.append('nombre', filtros.nombre);
      }
      if (filtros?.posicion) {
        params.append('posicion', filtros.posicion.toString());
      }
      if (filtros?.ciudad) {
        params.append('ciudad', filtros.ciudad.toString());
      }
      
      const url = `/jugadores${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<Jugador[]>>(url);
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      throw error;
    }
  }

  // Obtener jugador por ID (con todas sus relaciones)
  async obtenerJugadorPorId(id: number): Promise<JugadorDetalleResponse['data']> {
    try {
      const response = await api.get<JugadorDetalleResponse>(`/jugadores/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener jugador:', error);
      throw error;
    }
  }

  // Actualizar jugador
  async actualizarJugador(id: number, datos: ActualizarJugador, fotoNueva?: File): Promise<void> {
    try {
      const formData = new FormData();
      
      // Datos básicos
      if (datos.peso !== undefined) {
        formData.append('peso', datos.peso.toString());
      }
      if (datos.estatura !== undefined) {
        formData.append('estatura', datos.estatura.toString());
      }
      if (datos.apodo) {
        formData.append('apodo', datos.apodo);
      }
      if (datos.anos_experiencia !== undefined) {
        formData.append('anos_experiencia', datos.anos_experiencia.toString());
      }
      if (datos.amonestaciones !== undefined) {
        formData.append('amonestaciones', datos.amonestaciones.toString());
      }
      if (datos.puntos_acumulados !== undefined) {
        formData.append('puntos_acumulados', datos.puntos_acumulados.toString());
      }
      
      // Extras
      if (datos.pasatiempos) {
        formData.append('pasatiempos', JSON.stringify(datos.pasatiempos));
      }
      if (datos.musica_favorita) {
        formData.append('musica_favorita', JSON.stringify(datos.musica_favorita));
      }
      if (datos.redes_sociales) {
        formData.append('redes_sociales', JSON.stringify(datos.redes_sociales));
      }
      
      // Foto nueva
      if (fotoNueva) {
        formData.append('foto', fotoNueva);
      }
      
      await api.put(`/jugadores/${id}`, formData, {
          headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      throw error;
    }
  }

  // Eliminar jugador
  async eliminarJugador(id: number): Promise<void> {
    try {
      await api.delete(`/jugadores/${id}`);
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      throw error;
    }
  }

  // Actualizar estadísticas del jugador
  async actualizarEstadisticas(id: number, datos: {
    amonestaciones?: number;
    puntos_acumulados?: number;
  }): Promise<void> {
    try {
      await api.put(`/jugadores/${id}`, datos);
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  // Actualizar foto del jugador
  async actualizarFoto(id: number, foto: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('foto', foto);
      
      await api.put(`/jugadores/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error al actualizar foto:', error);
      throw error;
    }
  }

  // Actualizar pasatiempos
  async actualizarPasatiempos(id: number, pasatiempos: string[]): Promise<void> {
    try {
      await api.put(`/jugadores/${id}`, { 
        pasatiempos: JSON.stringify(pasatiempos) 
      });
    } catch (error) {
      console.error('Error al actualizar pasatiempos:', error);
      throw error;
    }
  }

  // Actualizar música favorita
  async actualizarMusicaFavorita(id: number, musica: string[]): Promise<void> {
    try {
      await api.put(`/jugadores/${id}`, { 
        musica_favorita: JSON.stringify(musica) 
      });
    } catch (error) {
      console.error('Error al actualizar música favorita:', error);
      throw error;
    }
  }

  // Actualizar redes sociales
  async actualizarRedesSociales(id: number, redes: Array<{
    nombre_plataforma: string;
    url: string;
  }>): Promise<void> {
    try {
      await api.put(`/jugadores/${id}`, { 
        redes_sociales: JSON.stringify(redes) 
      });
    } catch (error) {
      console.error('Error al actualizar redes sociales:', error);
      throw error;
    }
  }

  // Buscar jugadores por nombre (útil para autocompletado)
  async buscarPorNombre(nombre: string): Promise<Jugador[]> {
    try {
      return await this.obtenerJugadores({ nombre });
    } catch (error) {
      console.error('Error al buscar jugadores por nombre:', error);
      throw error;
    }
  }

  // Obtener jugadores por equipo
  async obtenerPorEquipo(equipoId: number): Promise<Jugador[]> {
    try {
      return await this.obtenerJugadores({ equipo: equipoId });
    } catch (error) {
      console.error('Error al obtener jugadores por equipo:', error);
      throw error;
    }
  }

  // Obtener jugadores por posición
  async obtenerPorPosicion(posicionId: number): Promise<Jugador[]> {
    try {
      return await this.obtenerJugadores({ posicion: posicionId });
    } catch (error) {
      console.error('Error al obtener jugadores por posición:', error);
      throw error;
    }
  }

  // Obtener jugadores por ciudad
  async obtenerPorCiudad(ciudadId: number): Promise<Jugador[]> {
    try {
      return await this.obtenerJugadores({ ciudad: ciudadId });
    } catch (error) {
      console.error('Error al obtener jugadores por ciudad:', error);
      throw error;
    }
  }
}

export default new JugadorService();
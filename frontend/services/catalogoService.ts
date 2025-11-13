import api from './api';
import { ApiResponse, Ciudad, Posicion } from '@/types';

class CatalogoService {
  // Obtener todas las ciudades
  async obtenerCiudades(): Promise<Ciudad[]> {
    try {
      const response = await api.get<ApiResponse<Ciudad[]>>('/catalogos/ciudades');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      throw error;
    }
  }

  // Obtener todas las posiciones
  async obtenerPosiciones(): Promise<Posicion[]> {
    try {
      const response = await api.get<ApiResponse<Posicion[]>>('/catalogos/posiciones');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener posiciones:', error);
      throw error;
    }
  }

  // Obtener ciudad por ID
  async obtenerCiudadPorId(id: number): Promise<Ciudad | null> {
    try {
      const ciudades = await this.obtenerCiudades();
      return ciudades.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error al obtener ciudad por ID:', error);
      throw error;
    }
  }

  // Obtener posición por ID
  async obtenerPosicionPorId(id: number): Promise<Posicion | null> {
    try {
      const posiciones = await this.obtenerPosiciones();
      return posiciones.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error al obtener posición por ID:', error);
      throw error;
    }
  }
}

export default new CatalogoService();
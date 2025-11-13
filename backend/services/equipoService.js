// services/equipoService.js
const Equipo = require('../models/Equipo');
const ColorEquipo = require('../models/ColorEquipo');

class EquipoService {
    // Crear equipo con colores
    async crear(datos, connection) {
        try {
            // Validar nombre único
            const existe = await Equipo.existsByNombre(datos.nombre);
            if (existe) {
                throw new Error('Ya existe un equipo con ese nombre');
            }

            // Insertar equipo
            const equipoId = await Equipo.insert(datos, connection);

            // Insertar colores
            if (datos.colores && datos.colores.length > 0) {
                await ColorEquipo.insertMultiple(equipoId, datos.colores, connection);
            }

            return equipoId;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar equipo
    async actualizar(id, datos, connection) {
        try {
            // Verificar que el equipo existe
            const equipo = await Equipo.findById(id);
            if (!equipo) {
                throw new Error('Equipo no encontrado');
            }

            // Actualizar datos del equipo
            await Equipo.update(id, datos, connection);

            // Si se actualizan colores
            if (datos.colores) {
                await ColorEquipo.deleteByEquipo(id, connection);
                if (datos.colores.length > 0) {
                    await ColorEquipo.insertMultiple(id, datos.colores, connection);
                }
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar equipo (se eliminan jugadores en cascada por FK)
    async eliminar(id, connection) {
        try {
            const eliminado = await Equipo.delete(id, connection);
            if (!eliminado) {
                throw new Error('Equipo no encontrado');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Obtener equipo por ID
    async obtenerPorId(id) {
        try {
            const equipo = await Equipo.findById(id);
            if (!equipo) {
                throw new Error('Equipo no encontrado');
            }
            return equipo;
        } catch (error) {
            throw error;
        }
    }

    // Listar todos los equipos
    async listarTodos(filtros = {}) {
        try {
            return await Equipo.findAll(filtros);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new EquipoService();
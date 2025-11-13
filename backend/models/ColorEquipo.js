// models/ColorEquipo.js
const db = require('../config/database');

class ColorEquipo {
    // Insertar múltiples colores
    static async insertMultiple(equipoId, colores, connection = null) {
        const conn = connection || db;
        
        try {
            if (!colores || colores.length === 0) return;
            
            const values = colores.map(color => [equipoId, color]);
            const query = 'INSERT INTO colores_equipo (equipo_id, color_hex) VALUES ?';
            
            await conn.query(query, [values]);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar todos los colores de un equipo
    static async deleteByEquipo(equipoId, connection = null) {
        const conn = connection || db;
        
        try {
            const query = 'DELETE FROM colores_equipo WHERE equipo_id = ?';
            await conn.query(query, [equipoId]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener colores de un equipo
    static async findByEquipo(equipoId) {
        try {
            const query = 'SELECT color_hex FROM colores_equipo WHERE equipo_id = ?';
            const [rows] = await db.query(query, [equipoId]);
            return rows.map(r => r.color_hex);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ColorEquipo;
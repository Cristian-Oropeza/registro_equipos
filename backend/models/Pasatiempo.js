// models/Pasatiempo.js
const db = require('../config/database');

class Pasatiempo {
    // Insertar múltiples pasatiempos
    static async insertMultiple(jugadorId, pasatiempos, connection = null) {
        const conn = connection || db;
        
        try {
            if (!pasatiempos || pasatiempos.length === 0) return;
            
            const values = pasatiempos.map(p => [jugadorId, p]);
            const query = 'INSERT INTO pasatiempos (jugador_id, descripcion) VALUES ?';
            
            await conn.query(query, [values]);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar todos los pasatiempos de un jugador
    static async deleteByJugador(jugadorId, connection = null) {
        const conn = connection || db;
        
        try {
            const query = 'DELETE FROM pasatiempos WHERE jugador_id = ?';
            await conn.query(query, [jugadorId]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener pasatiempos de un jugador
    static async findByJugador(jugadorId) {
        try {
            const query = 'SELECT descripcion FROM pasatiempos WHERE jugador_id = ?';
            const [rows] = await db.query(query, [jugadorId]);
            return rows.map(r => r.descripcion);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pasatiempo;
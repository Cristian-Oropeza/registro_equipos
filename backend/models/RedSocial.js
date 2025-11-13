// models/RedSocial.js
const db = require('../config/database');

class RedSocial {
    // Insertar múltiples redes sociales
    static async insertMultiple(jugadorId, redes, connection = null) {
        const conn = connection || db;
        
        try {
            if (!redes || redes.length === 0) return;
            
            const values = redes.map(r => [jugadorId, r.plataforma, r.url]);
            const query = 'INSERT INTO redes_sociales (jugador_id, plataforma, url) VALUES ?';
            
            await conn.query(query, [values]);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar todas las redes sociales de un jugador
    static async deleteByJugador(jugadorId, connection = null) {
        const conn = connection || db;
        
        try {
            const query = 'DELETE FROM redes_sociales WHERE jugador_id = ?';
            await conn.query(query, [jugadorId]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener redes sociales de un jugador
    static async findByJugador(jugadorId) {
        try {
            const query = 'SELECT plataforma, url FROM redes_sociales WHERE jugador_id = ?';
            const [rows] = await db.query(query, [jugadorId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RedSocial;
// models/MusicaFavorita.js
const db = require('../config/database');

class MusicaFavorita {
    // Insertar múltiples géneros musicales
    static async insertMultiple(jugadorId, musica, connection = null) {
        const conn = connection || db;
        
        try {
            if (!musica || musica.length === 0) return;
            
            const values = musica.map(m => [jugadorId, m]);
            const query = 'INSERT INTO musica_favorita (jugador_id, descripcion) VALUES ?';
            
            await conn.query(query, [values]);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar toda la música de un jugador
    static async deleteByJugador(jugadorId, connection = null) {
        const conn = connection || db;
        
        try {
            const query = 'DELETE FROM musica_favorita WHERE jugador_id = ?';
            await conn.query(query, [jugadorId]);
        } catch (error) {
            throw error;
        }
    }

    // Obtener música favorita de un jugador
    static async findByJugador(jugadorId) {
        try {
            const query = 'SELECT descripcion FROM musica_favorita WHERE jugador_id = ?';
            const [rows] = await db.query(query, [jugadorId]);
            return rows.map(r => r.descripcion);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MusicaFavorita;
// models/Posicion.js
const db = require('../config/database');

class Posicion {
    // Obtener todas las posiciones
    static async findAll() {
        try {
            const [rows] = await db.query(
                'SELECT id, nombre FROM posiciones ORDER BY id ASC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Posicion;
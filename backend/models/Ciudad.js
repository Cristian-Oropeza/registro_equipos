// models/Ciudad.js
const db = require('../config/database');

class Ciudad {
    // Obtener todas las ciudades
    static async findAll() {
        try {
            const [rows] = await db.query(
                'SELECT id, nombre FROM ciudades ORDER BY nombre ASC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Ciudad;
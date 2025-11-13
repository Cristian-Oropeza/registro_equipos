// models/Equipo.js
const db = require('../config/database');

class Equipo {
    // Insertar nuevo equipo
    static async insert(datos, connection = null) {
        const conn = connection || db;
        
        try {
            const query = `
                INSERT INTO equipos (nombre, logotipo, juegos_ganados, juegos_perdidos)
                VALUES (?, ?, ?, ?)
            `;
            
            const [result] = await conn.query(query, [
                datos.nombre,
                datos.logotipo || null,
                datos.juegos_ganados || 0,
                datos.juegos_perdidos || 0
            ]);
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar equipo
    static async update(id, datos, connection = null) {
        const conn = connection || db;
        
        try {
            const query = `
                UPDATE equipos 
                SET nombre = ?, 
                    logotipo = ?,
                    juegos_ganados = ?,
                    juegos_perdidos = ?
                WHERE id = ?
            `;
            
            const [result] = await conn.query(query, [
                datos.nombre,
                datos.logotipo,
                datos.juegos_ganados,
                datos.juegos_perdidos,
                id
            ]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar equipo
    static async delete(id, connection = null) {
        const conn = connection || db;
        
        try {
            const query = 'DELETE FROM equipos WHERE id = ?';
            const [result] = await conn.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener equipo por ID con sus colores
    static async findById(id) {
        try {
            const queryEquipo = 'SELECT * FROM equipos WHERE id = ?';
            const [equipos] = await db.query(queryEquipo, [id]);
            
            if (equipos.length === 0) return null;
            
            const equipo = equipos[0];
            
            // Obtener colores del equipo
            const queryColores = 'SELECT color_hex FROM colores_equipo WHERE equipo_id = ?';
            const [colores] = await db.query(queryColores, [id]);
            
            equipo.colores = colores.map(c => c.color_hex);
            
            return equipo;
        } catch (error) {
            throw error;
        }
    }

    // Listar todos los equipos con filtros opcionales
    static async findAll(filtros = {}) {
        try {
            let query = `
                SELECT e.*, 
                    COUNT(j.id) as total_jugadores
                FROM equipos e
                LEFT JOIN jugadores j ON e.id = j.equipo_id
            `;
            
            const params = [];
            const conditions = [];
            
            if (filtros.nombre) {
                conditions.push('e.nombre LIKE ?');
                params.push(`%${filtros.nombre}%`);
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' GROUP BY e.id ORDER BY e.nombre ASC';
            
            const [equipos] = await db.query(query, params);
            
            // Obtener colores para cada equipo
            for (let equipo of equipos) {
                const [colores] = await db.query(
                    'SELECT color_hex FROM colores_equipo WHERE equipo_id = ?',
                    [equipo.id]
                );
                equipo.colores = colores.map(c => c.color_hex);
            }
            
            return equipos;
        } catch (error) {
            throw error;
        }
    }

    // Verificar si existe un equipo por nombre
    static async existsByNombre(nombre, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM equipos WHERE nombre = ?';
            const params = [nombre];
            
            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }
            
            const [rows] = await db.query(query, params);
            return rows[0].count > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener el consecutivo del equipo (para generar folios)
    static async getConsecutivo(id) {
        try {
            const query = `
                SELECT COUNT(*) + 1 as consecutivo 
                FROM equipos 
                WHERE id < ?
            `;
            const [rows] = await db.query(query, [id]);
            return rows[0].consecutivo;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Equipo;
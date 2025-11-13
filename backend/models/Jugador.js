// models/Jugador.js
const db = require('../config/database');

class Jugador {
    // Insertar nuevo jugador
    static async insert(datos, connection = null) {
        const conn = connection || db;
        
        try {
            const query = `
                INSERT INTO jugadores (
                    equipo_id, nombre_completo, sexo, fecha_nacimiento, peso, estatura,
                    apodo, posicion_id, foto, ciudad_nacimiento_id, anos_experiencia,
                    correo_electronico, folio, amonestaciones, puntos_acumulados
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await conn.query(query, [
                datos.equipo_id,
                datos.nombre_completo,
                datos.sexo,
                datos.fecha_nacimiento,
                datos.peso,
                datos.estatura,
                datos.apodo,
                datos.posicion_id,
                datos.foto || null,
                datos.ciudad_nacimiento_id,
                datos.anos_experiencia,
                datos.correo_electronico,
                datos.folio,
                datos.amonestaciones || 0,
                datos.puntos_acumulados || 0
            ]);
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar jugador (dinámico - solo actualiza los campos que se envían)
    static async update(id, datos, connection = null) {
        const conn = connection || db;
        
        try {
            // Construir query dinámicamente solo con los campos que vienen
            const campos = [];
            const valores = [];
            
            if (datos.nombre_completo !== undefined) {
                campos.push('nombre_completo = ?');
                valores.push(datos.nombre_completo);
            }
            if (datos.sexo !== undefined) {
                campos.push('sexo = ?');
                valores.push(datos.sexo);
            }
            if (datos.fecha_nacimiento !== undefined) {
                campos.push('fecha_nacimiento = ?');
                valores.push(datos.fecha_nacimiento);
            }
            if (datos.peso !== undefined) {
                campos.push('peso = ?');
                valores.push(datos.peso);
            }
            if (datos.estatura !== undefined) {
                campos.push('estatura = ?');
                valores.push(datos.estatura);
            }
            if (datos.apodo !== undefined) {
                campos.push('apodo = ?');
                valores.push(datos.apodo);
            }
            if (datos.posicion_id !== undefined) {
                campos.push('posicion_id = ?');
                valores.push(datos.posicion_id);
            }
            if (datos.foto !== undefined) {
                campos.push('foto = ?');
                valores.push(datos.foto);
            }
            if (datos.ciudad_nacimiento_id !== undefined) {
                campos.push('ciudad_nacimiento_id = ?');
                valores.push(datos.ciudad_nacimiento_id);
            }
            if (datos.anos_experiencia !== undefined || datos.anosExperiencia !== undefined) {
                campos.push('anos_experiencia = ?');
                valores.push(datos.anos_experiencia || datos.anosExperiencia);
            }
            if (datos.correo_electronico !== undefined || datos.correoElectronico !== undefined) {
                campos.push('correo_electronico = ?');
                valores.push(datos.correo_electronico || datos.correoElectronico);
            }
            if (datos.amonestaciones !== undefined) {
                campos.push('amonestaciones = ?');
                valores.push(datos.amonestaciones);
            }
            if (datos.puntos_acumulados !== undefined || datos.puntosAcumulados !== undefined) {
                campos.push('puntos_acumulados = ?');
                valores.push(datos.puntos_acumulados || datos.puntosAcumulados);
            }
            
            // Si no hay campos para actualizar, retornar true
            if (campos.length === 0) {
                return true;
            }
            
            valores.push(id);
            
            const query = `UPDATE jugadores SET ${campos.join(', ')} WHERE id = ?`;
            
            const [result] = await conn.query(query, valores);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar jugador
    static async delete(id, connection = null) {
        const conn = connection || db;
        
        try {
            const query = 'DELETE FROM jugadores WHERE id = ?';
            const [result] = await conn.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener jugador por ID con toda su info
    static async findById(id) {
        try {
            const query = `
                SELECT j.*, 
                    e.nombre as equipo_nombre,
                    p.nombre as posicion_nombre,
                    c.nombre as ciudad_nombre
                FROM jugadores j
                LEFT JOIN equipos e ON j.equipo_id = e.id
                LEFT JOIN posiciones p ON j.posicion_id = p.id
                LEFT JOIN ciudades c ON j.ciudad_nacimiento_id = c.id
                WHERE j.id = ?
            `;
            
            const [rows] = await db.query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Listar jugadores con filtros
    static async findAll(filtros = {}) {
        try {
            let query = `
                SELECT j.*, 
                    e.nombre as equipo_nombre,
                    p.nombre as posicion_nombre,
                    c.nombre as ciudad_nombre
                FROM jugadores j
                LEFT JOIN equipos e ON j.equipo_id = e.id
                LEFT JOIN posiciones p ON j.posicion_id = p.id
                LEFT JOIN ciudades c ON j.ciudad_nacimiento_id = c.id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (filtros.equipoId) {
                query += ' AND j.equipo_id = ?';
                params.push(filtros.equipoId);
            }
            
            if (filtros.nombre) {
                query += ' AND j.nombre_completo LIKE ?';
                params.push(`%${filtros.nombre}%`);
            }
            
            if (filtros.posicionId) {
                query += ' AND j.posicion_id = ?';
                params.push(filtros.posicionId);
            }
            
            if (filtros.ciudadId) {
                query += ' AND j.ciudad_nacimiento_id = ?';
                params.push(filtros.ciudadId);
            }
            
            query += ' ORDER BY j.nombre_completo ASC';
            
            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Verificar si existe un correo
    static async existsByCorreo(correo, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM jugadores WHERE correo_electronico = ?';
            const params = [correo];
            
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

    // Contar jugadores por equipo
    static async countByEquipo(equipoId) {
        try {
            const query = 'SELECT COUNT(*) as count FROM jugadores WHERE equipo_id = ?';
            const [rows] = await db.query(query, [equipoId]);
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Obtener consecutivo del jugador dentro de su equipo
    static async getConsecutivoEnEquipo(equipoId, jugadorId) {
        try {
            const query = `
                SELECT COUNT(*) + 1 as consecutivo 
                FROM jugadores 
                WHERE equipo_id = ? AND id < ?
            `;
            const [rows] = await db.query(query, [equipoId, jugadorId]);
            return rows[0].consecutivo;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Jugador;
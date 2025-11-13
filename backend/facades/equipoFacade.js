// facades/EquipoFacade.js
const db = require('../config/database');
const equipoService = require('../services/equipoService');
const jugadorService = require('../services/jugadorService');
const folioService = require('../services/folioService');
const emailService = require('../services/emailService');
const fileService = require('../services/fileService');
const Equipo = require('../models/Equipo');
const Jugador = require('../models/Jugador');

class EquipoFacade {
    // Registrar equipo completo con jugadores
    async registrarEquipoCompleto(datosEquipo, jugadores) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // PASO 1: Validar cantidad de jugadores
            if (jugadores.length < 8) {
                throw new Error('El equipo debe tener al menos 8 jugadores');
            }
            if (jugadores.length > 25) {
                throw new Error('El equipo no puede tener más de 25 jugadores');
            }

            // PASO 2: Validar posiciones mínimas
            jugadorService.validarPosicionesMinimas(jugadores);

            // PASO 3: Crear equipo
            const equipoId = await equipoService.crear(datosEquipo, connection);

            // PASO 4: Obtener consecutivo del equipo para folios
            const consecutivoEquipo = await Equipo.getConsecutivo(equipoId);

            // PASO 5: Registrar cada jugador
            const jugadoresRegistrados = [];
            let consecutivoJugador = 1;

            for (const datosJugador of jugadores) {
                // Asignar equipo_id
                datosJugador.equipo_id = equipoId;

                // Generar folio
                const folio = folioService.generarFolio(
                    datosEquipo.nombre,
                    consecutivoEquipo,
                    datosJugador.nombre_completo,
                    consecutivoJugador
                );
                datosJugador.folio = folio;

                // Crear jugador
                const jugadorId = await jugadorService.crear(datosJugador, connection);

                // ⭐ NUEVO: Obtener el nombre de la posición desde la BD
                const [posiciones] = await connection.query(
                    'SELECT nombre FROM posiciones WHERE id = ?',
                    [datosJugador.posicion_id]
                );
                const posicionNombre = posiciones[0]?.nombre || 'Sin especificar';

                // Registrar extras si existen
                if (datosJugador.pasatiempos || datosJugador.musica_favorita || datosJugador.redes_sociales) {
                    await jugadorService.registrarExtras(
                        jugadorId,
                        {
                            pasatiempos: datosJugador.pasatiempos || [],
                            musica: datosJugador.musica_favorita || [],
                            redesSociales: datosJugador.redes_sociales || []
                        },
                        connection
                    );
                }

                // Guardar para enviar correos
                jugadoresRegistrados.push({
                    id: jugadorId,
                    nombre_completo: datosJugador.nombre_completo,
                    correo_electronico: datosJugador.correo_electronico,
                    folio: folio,
                    equipo_nombre: datosEquipo.nombre,
                    posicion_nombre: posicionNombre 
                });

                consecutivoJugador++;
            }

            // PASO 6: Enviar correos a todos los jugadores
            for (const jugador of jugadoresRegistrados) {
                await emailService.enviarCorreoParticipacion(jugador);
            }

            // PASO 7: Commit si todo salió bien
            await connection.commit();

            return {
                success: true,
                equipoId: equipoId,
                totalJugadores: jugadoresRegistrados.length,
                mensaje: 'Equipo registrado exitosamente'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Agregar jugadores a equipo existente
    async agregarJugadores(equipoId, jugadores) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // PASO 1: Verificar que el equipo existe
            const equipo = await Equipo.findById(equipoId);
            if (!equipo) {
                throw new Error('Equipo no encontrado');
            }

            // PASO 2: Verificar que no exceda el máximo
            const jugadoresActuales = await Jugador.countByEquipo(equipoId);
            if (jugadoresActuales + jugadores.length > 25) {
                throw new Error('El equipo no puede tener más de 25 jugadores');
            }

            // PASO 3: Obtener consecutivos
            const consecutivoEquipo = await Equipo.getConsecutivo(equipoId);
            let consecutivoJugador = jugadoresActuales + 1;

            // PASO 4: Registrar cada jugador
            const jugadoresRegistrados = [];

            for (const datosJugador of jugadores) {
                datosJugador.equipo_id = equipoId;

                // Generar folio
                const folio = folioService.generarFolio(
                    equipo.nombre,
                    consecutivoEquipo,
                    datosJugador.nombre_completo,
                    consecutivoJugador
                );
                datosJugador.folio = folio;

                // Crear jugador
                const jugadorId = await jugadorService.crear(datosJugador, connection);

                // Registrar extras
                if (datosJugador.extras) {
                    await jugadorService.registrarExtras(
                        jugadorId,
                        datosJugador.extras,
                        connection
                    );
                }

                jugadoresRegistrados.push({
                    id: jugadorId,
                    nombre_completo: datosJugador.nombre_completo, 
                    correo_electronico: datosJugador.correo_electronico, 
                    folio: folio,
                    equipo_nombre: equipo.nombre,  
                    posicion_nombre: datosJugador.posicionNombre || 'Sin especificar' 
                });

                consecutivoJugador++;
            }

            // PASO 5: Enviar correos
            for (const jugador of jugadoresRegistrados) {
                await emailService.enviarCorreoParticipacion(jugador);
            }

            await connection.commit();

            return {
                success: true,
                totalAgregados: jugadoresRegistrados.length,
                mensaje: 'Jugadores agregados exitosamente'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Actualizar equipo completo
    async actualizarEquipo(equipoId, datosEquipo) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            await equipoService.actualizar(equipoId, datosEquipo, connection);

            await connection.commit();

            return {
                success: true,
                mensaje: 'Equipo actualizado exitosamente'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Eliminar equipo completo (cascada elimina jugadores)
    async eliminarEquipo(equipoId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Obtener equipo antes de eliminar para eliminar archivos
            const equipo = await Equipo.findById(equipoId);
            if (!equipo) {
                throw new Error('Equipo no encontrado');
            }

            // Obtener jugadores para eliminar sus fotos
            const jugadores = await Jugador.findAll({ equipoId: equipoId });

            // Eliminar equipo (cascada elimina jugadores y relaciones)
            await equipoService.eliminar(equipoId, connection);

            await connection.commit();

            // Eliminar archivos después del commit
            if (equipo.logotipo) {
                await fileService.eliminarArchivo(equipo.logotipo);
            }

            for (const jugador of jugadores) {
                if (jugador.foto) {
                    await fileService.eliminarArchivo(jugador.foto);
                }
            }

            return {
                success: true,
                mensaje: 'Equipo eliminado exitosamente'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Eliminar jugador (verificando mínimos del equipo)
    async eliminarJugador(jugadorId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Obtener jugador
            const jugador = await Jugador.findById(jugadorId);
            if (!jugador) {
                throw new Error('Jugador no encontrado');
            }

            // Verificar que no baje de 8 jugadores
            const totalJugadores = await Jugador.countByEquipo(jugador.equipo_id);
            if (totalJugadores <= 8) {
                throw new Error('No se puede eliminar. El equipo debe tener al menos 8 jugadores');
            }

            // Eliminar jugador
            await jugadorService.eliminar(jugadorId, connection);

            await connection.commit();

            // Eliminar foto después del commit
            if (jugador.foto) {
                await fileService.eliminarArchivo(jugador.foto);
            }

            return {
                success: true,
                mensaje: 'Jugador eliminado exitosamente'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new EquipoFacade();
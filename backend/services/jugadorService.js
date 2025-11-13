// services/jugadorService.js
const Jugador = require('../models/Jugador');
const Pasatiempo = require('../models/Pasatiempo');
const MusicaFavorita = require('../models/MusicaFavorita');
const RedSocial = require('../models/RedSocial');

class JugadorService {
    // Crear jugador básico
    async crear(datos, connection) {
        try {
            // Validar correo único
            const existe = await Jugador.existsByCorreo(datos.correoElectronico);
            if (existe) {
                throw new Error('Ya existe un jugador con ese correo electrónico');
            }

            // Insertar jugador
            const jugadorId = await Jugador.insert(datos, connection);

            return jugadorId;
        } catch (error) {
            throw error;
        }
    }

    // Registrar extras del jugador (pasatiempos, música, redes)
    async registrarExtras(jugadorId, extras, connection) {
        try {
            // Pasatiempos
            if (extras.pasatiempos && extras.pasatiempos.length > 0) {
                await Pasatiempo.insertMultiple(jugadorId, extras.pasatiempos, connection);
            }

            // Música
            if (extras.musica && extras.musica.length > 0) {
                await MusicaFavorita.insertMultiple(jugadorId, extras.musica, connection);
            }

            // Redes sociales
            if (extras.redesSociales && extras.redesSociales.length > 0) {
                await RedSocial.insertMultiple(jugadorId, extras.redesSociales, connection);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar jugador
    async actualizar(id, datos, connection) {
        try {
            const jugador = await Jugador.findById(id);
            if (!jugador) {
                throw new Error('Jugador no encontrado');
            }

            // Validar correo único (excluyendo el actual)
            if (datos.correoElectronico !== jugador.correoElectronico) {
                const existe = await Jugador.existsByCorreo(datos.correoElectronico, id);
                if (existe) {
                    throw new Error('Ya existe un jugador con ese correo electrónico');
                }
            }

            await Jugador.update(id, datos, connection);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar extras
    async actualizarExtras(jugadorId, extras, connection) {
        try {
            // Eliminar extras existentes
            await Pasatiempo.deleteByJugador(jugadorId, connection);
            await MusicaFavorita.deleteByJugador(jugadorId, connection);
            await RedSocial.deleteByJugador(jugadorId, connection);

            // Insertar nuevos extras
            await this.registrarExtras(jugadorId, extras, connection);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar jugador
    async eliminar(id, connection) {
        try {
            const eliminado = await Jugador.delete(id, connection);
            if (!eliminado) {
                throw new Error('Jugador no encontrado');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Obtener jugador completo con extras
    async obtenerCompleto(id) {
        try {
            const jugador = await Jugador.findById(id);
            if (!jugador) {
                throw new Error('Jugador no encontrado');
            }

            // Obtener extras
            jugador.pasatiempos = await Pasatiempo.findByJugador(id);
            jugador.musica = await MusicaFavorita.findByJugador(id);
            jugador.redesSociales = await RedSocial.findByJugador(id);

            return jugador;
        } catch (error) {
            throw error;
        }
    }

    // Listar jugadores
    async listarTodos(filtros = {}) {
        try {
            return await Jugador.findAll(filtros);
        } catch (error) {
            throw error;
        }
    }

    // Validar posiciones mínimas en un array de jugadores
    validarPosicionesMinimas(jugadores) {
        const posiciones = jugadores.map(j => j.posicion_id);

        const tienePortero = posiciones.includes(1);
        const tieneDefensa = [2, 3, 4].some(p => posiciones.includes(p));
        const tieneMedio = [5, 6, 7, 8, 9].some(p => posiciones.includes(p));
        const tieneDelantero = [10, 11].some(p => posiciones.includes(p));

        if (!tienePortero) {
            throw new Error('El equipo debe tener al menos 1 portero');
        }
        if (!tieneDefensa) {
            throw new Error('El equipo debe tener al menos 1 defensa');
        }
        if (!tieneMedio) {
            throw new Error('El equipo debe tener al menos 1 mediocampista');
        }
        if (!tieneDelantero) {
            throw new Error('El equipo debe tener al menos 1 delantero');
        }

        return true;
    }
}

module.exports = new JugadorService();
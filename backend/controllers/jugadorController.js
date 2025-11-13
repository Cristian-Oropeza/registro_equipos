// controllers/jugadorController.js
const jugadorService = require('../services/jugadorService');
const equipoFacade = require('../facades/equipoFacade');
const fileService = require('../services/fileService');

// Listar todos los jugadores
exports.listarJugadores = async (req, res) => {
    try {
        const filtros = {
            equipoId: req.query.equipo,
            nombre: req.query.nombre,
            posicionId: req.query.posicion,
            ciudadId: req.query.ciudad
        };

        const jugadores = await jugadorService.listarTodos(filtros);

        res.json({
            success: true,
            data: jugadores
        });
    } catch (error) {
        console.error('Error en listarJugadores:', error.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al listar jugadores',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener jugador por ID
exports.obtenerJugador = async (req, res) => {
    try {
        const { id } = req.params;
        const jugador = await jugadorService.obtenerCompleto(id);

        res.json({
            success: true,
            data: jugador
        });
    } catch (error) {
        console.error('Error en obtenerJugador:', error.message);
        res.status(404).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar jugador
exports.actualizarJugador = async (req, res) => {
    try {
        const { id } = req.params;
        const datosJugador = {};
        
        // Extraer datos básicos del body
        if (req.body.peso !== undefined) {
            datosJugador.peso = req.body.peso;
        }
        if (req.body.estatura !== undefined) {
            datosJugador.estatura = req.body.estatura;
        }
        if (req.body.apodo !== undefined) {
            datosJugador.apodo = req.body.apodo;
        }
        if (req.body.anos_experiencia !== undefined) {
            datosJugador.anosExperiencia = parseInt(req.body.anos_experiencia);
        }
        if (req.body.puntos_acumulados !== undefined) {
            datosJugador.puntosAcumulados = parseInt(req.body.puntos_acumulados);
        }
        if (req.body.amonestaciones !== undefined) {
            datosJugador.amonestaciones = parseInt(req.body.amonestaciones);
        }

        // Procesar foto si se envía una nueva
        if (req.file) {
            datosJugador.foto = fileService.obtenerRutaRelativa(req.file);
        }

        // Preparar extras
        const extras = {};
        
        if (req.body.pasatiempos) {
            try {
                extras.pasatiempos = JSON.parse(req.body.pasatiempos);
            } catch (e) {
                extras.pasatiempos = [];
            }
        }
        
        if (req.body.musica_favorita) {
            try {
                extras.musica = JSON.parse(req.body.musica_favorita);
            } catch (e) {
                extras.musica = [];
            }
        }
        
        if (req.body.redes_sociales) {
            try {
                extras.redesSociales = JSON.parse(req.body.redes_sociales);
            } catch (e) {
                extras.redesSociales = [];
            }
        }

        const connection = await require('../config/database').getConnection();
        
        try {
            await connection.beginTransaction();

            // Solo actualizar si hay datos básicos para actualizar
            if (Object.keys(datosJugador).length > 0) {
                await jugadorService.actualizar(id, datosJugador, connection);
            }

            // Actualizar extras si hay cambios
            if (Object.keys(extras).length > 0) {
                await jugadorService.actualizarExtras(id, extras, connection);
            }

            await connection.commit();

            res.json({
                success: true,
                mensaje: 'Jugador actualizado exitosamente'
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error en actualizarJugador:', error.message);
        res.status(400).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar jugador
exports.eliminarJugador = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await equipoFacade.eliminarJugador(id);

        res.json(resultado);
    } catch (error) {
        console.error('Error en eliminarJugador:', error.message);
        res.status(400).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
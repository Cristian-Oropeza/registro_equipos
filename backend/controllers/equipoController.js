// controllers/equipoController.js
const equipoFacade = require('../facades/equipoFacade');
const equipoService = require('../services/equipoService');
const jugadorService = require('../services/jugadorService');
const fileService = require('../services/fileService');

// Registrar equipo completo
exports.registrarEquipo = async (req, res) => {
    try {
        // Parsear datos del body
        const datosEquipo = JSON.parse(req.body.equipo);
        const jugadores = JSON.parse(req.body.jugadores);

        // Procesar logotipo si existe
        if (req.files && req.files.logotipo) {
            datosEquipo.logotipo = fileService.obtenerRutaRelativa(req.files.logotipo[0]);
        }

        // Procesar fotos de jugadores
        if (req.files) {
            jugadores.forEach((jugador, index) => {
                const fotoKey = `foto_${index}`;
                if (req.files[fotoKey]) {
                    jugador.foto = fileService.obtenerRutaRelativa(req.files[fotoKey][0]);
                }
            });
        }

        // Registrar usando el Facade
        const resultado = await equipoFacade.registrarEquipoCompleto(datosEquipo, jugadores);

        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en registrarEquipo:', error.message);
        res.status(400).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Listar equipos
exports.listarEquipos = async (req, res) => {
    try {
        const filtros = {
            nombre: req.query.nombre
        };

        const equipos = await equipoService.listarTodos(filtros);

        res.json({
            success: true,
            data: equipos
        });
    } catch (error) {
        console.error('Error en listarEquipos:', error.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al listar equipos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener equipo por ID
exports.obtenerEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const equipo = await equipoService.obtenerPorId(id);

        res.json({
            success: true,
            data: equipo
        });
    } catch (error) {
        console.error('Error en obtenerEquipo:', error.message);
        res.status(404).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar equipo
exports.actualizarEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const datosEquipo = req.body;

        // Procesar logotipo si se envía uno nuevo
        if (req.file) {
            datosEquipo.logotipo = fileService.obtenerRutaRelativa(req.file);
        }

        const resultado = await equipoFacade.actualizarEquipo(id, datosEquipo);

        res.json(resultado);
    } catch (error) {
        console.error('Error en actualizarEquipo:', error.message);
        res.status(400).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar equipo
exports.eliminarEquipo = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await equipoFacade.eliminarEquipo(id);

        res.json(resultado);
    } catch (error) {
        console.error('Error en eliminarEquipo:', error.message);
        res.status(400).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener jugadores de un equipo
exports.obtenerJugadoresEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const filtros = {
            equipoId: id,  
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
        console.error('Error en obtenerJugadoresEquipo:', error.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener jugadores',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Agregar jugadores a equipo existente
exports.agregarJugadores = async (req, res) => {
    try {
        const { id } = req.params;
        const jugadores = JSON.parse(req.body.jugadores);

        // Procesar fotos
        if (req.files) {
            jugadores.forEach((jugador, index) => {
                const fotoKey = `foto_${index}`;
                if (req.files[fotoKey]) {
                    jugador.foto = fileService.obtenerRutaRelativa(req.files[fotoKey][0]);
                }
            });
        }

        const resultado = await equipoFacade.agregarJugadores(id, jugadores);

        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en agregarJugadores:', error.message);
        res.status(400).json({
            success: false,
            mensaje: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
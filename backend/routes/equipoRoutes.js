const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { uploadEquipoCompleto, uploadLogo } = require('../middlewares/uploadMiddleware');

// POST /api/equipos/registrar - Registrar equipo completo con jugadores
router.post('/registrar', uploadEquipoCompleto, equipoController.registrarEquipo);

// GET /api/equipos - Listar todos los equipos (con filtros opcionales)
router.get('/', equipoController.listarEquipos);

// GET /api/equipos/:id - Obtener equipo por ID
router.get('/:id', equipoController.obtenerEquipo);

// PUT /api/equipos/:id - Actualizar equipo
router.put('/:id', uploadLogo, equipoController.actualizarEquipo);

// DELETE /api/equipos/:id - Eliminar equipo
router.delete('/:id', equipoController.eliminarEquipo);

// GET /api/equipos/:id/jugadores - Obtener jugadores de un equipo
router.get('/:id/jugadores', equipoController.obtenerJugadoresEquipo);

// POST /api/equipos/:id/jugadores - Agregar jugadores a equipo existente
router.post('/:id/jugadores', uploadEquipoCompleto, equipoController.agregarJugadores);

module.exports = router;
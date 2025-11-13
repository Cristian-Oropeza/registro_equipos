const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const { uploadFoto } = require('../middlewares/uploadMiddleware');

// GET /api/jugadores - Listar todos los jugadores (con filtros opcionales)
router.get('/', jugadorController.listarJugadores);

// GET /api/jugadores/:id - Obtener jugador por ID
router.get('/:id', jugadorController.obtenerJugador);

// PUT /api/jugadores/:id - Actualizar jugador
router.put('/:id', uploadFoto, jugadorController.actualizarJugador);

// DELETE /api/jugadores/:id - Eliminar jugador
router.delete('/:id', jugadorController.eliminarJugador);

module.exports = router;
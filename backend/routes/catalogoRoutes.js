const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

// GET /api/catalogos/ciudades - Obtener todas las ciudades
router.get('/ciudades', catalogoController.obtenerCiudades);

// GET /api/catalogos/posiciones - Obtener todas las posiciones
router.get('/posiciones', catalogoController.obtenerPosiciones);

module.exports = router;
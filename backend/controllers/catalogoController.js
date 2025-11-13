// controllers/catalogoController.js
const Ciudad = require('../models/Ciudad');
const Posicion = require('../models/Posicion');

// Obtener todas las ciudades
exports.obtenerCiudades = async (req, res) => {
    try {
        const ciudades = await Ciudad.findAll();
        
        res.json({
            success: true,
            data: ciudades
        });
    } catch (error) {
        console.error('Error en obtenerCiudades:', error.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener ciudades',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener todas las posiciones
exports.obtenerPosiciones = async (req, res) => {
    try {
        const posiciones = await Posicion.findAll();
        
        res.json({
            success: true,
            data: posiciones
        });
    } catch (error) {
        console.error('Error en obtenerPosiciones:', error.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener posiciones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
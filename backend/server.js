const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');

const app = express();

// Middlewares globales
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estaticos (imagenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Rutas API
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/jugadores', jugadorRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        mensaje: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: `Ruta no encontrada: ${req.method} ${req.path}`
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.message);
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('Error no manejado:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Excepcion no capturada:', err);
    process.exit(1);
});

module.exports = app;
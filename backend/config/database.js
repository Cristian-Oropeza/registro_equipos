// config/database.js - Configuracion de conexion a MySQL
const mysql = require('mysql2/promise');

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'registro_equipos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexion
pool.getConnection()
    .then(connection => {
        console.log('Conexion a MySQL exitosa');
        connection.release();
    })
    .catch(err => {
        console.error('Error al conectar a MySQL:', err.message);
        process.exit(1);
    });

module.exports = pool;
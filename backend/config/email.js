const nodemailer = require('nodemailer');

// Configuracion del transporter de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Verificar conexion al iniciar
transporter.verify(function(error, success) {
    if (error) {
        console.error('Error en configuracion de email:', error);
    } else {
        console.log('Servidor de email listo para enviar mensajes');
    }
});

module.exports = transporter;
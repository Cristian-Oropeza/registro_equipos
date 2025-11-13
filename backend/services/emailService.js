const transporter = require('../config/email');

// Plantilla HTML del correo
const getPlantillaCorreo = (jugador) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #00986C;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }
        .folio {
            font-size: 24px;
            font-weight: bold;
            color: #000080;
            text-align: center;
            padding: 20px;
            background-color: #f0f0f0;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info {
            margin: 20px 0;
        }
        .info-item {
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenido a la Liga de Futbol</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${jugador.nombre_completo}</strong>,</p>
            
            <p>Tu equipo <strong>${jugador.equipo_nombre}</strong> ha sido registrado exitosamente en nuestra liga.</p>
            
            <p>Tu folio de participacion es:</p>
            <div class="folio">${jugador.folio}</div>
            
            <div class="info">
                <h3>Datos de tu registro:</h3>
                <div class="info-item"><strong>Equipo:</strong> ${jugador.equipo_nombre}</div>
                <div class="info-item"><strong>Posicion:</strong> ${jugador.posicion_nombre}</div>
                <div class="info-item"><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString('es-MX')}</div>
            </div>
            
            <p>Guarda este correo para futuras referencias. Este folio sera necesario para identificarte en los partidos y eventos de la liga.</p>
            
            <p>Nos vemos en la cancha!</p>
            
            <div class="footer">
                <p><strong>Liga de Futbol</strong></p>
                <p>Sistema de Registro de Equipos</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// Enviar correo de participacion a un jugador
const enviarCorreoParticipacion = async (jugador) => {
    try {
        const html = getPlantillaCorreo(jugador);
        
        const mailOptions = {
            from: `"Liga de Futbol" <${process.env.GMAIL_USER}>`,
            to: jugador.correo_electronico,
            subject: `Registro exitoso - Liga de Futbol - Folio: ${jugador.folio}`,
            html: html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`Correo enviado a: ${jugador.correo_electronico}`);
        
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error(`Error al enviar correo a ${jugador.correo_electronico}:`, error.message);
        throw error;
    }
};

// Enviar correos a multiples jugadores
const enviarCorreosMultiples = async (jugadores) => {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        errores: []
    };
    
    for (const jugador of jugadores) {
        try {
            await enviarCorreoParticipacion(jugador);
            resultados.exitosos++;
        } catch (error) {
            resultados.fallidos++;
            resultados.errores.push({
                jugador: jugador.nombre_completo,
                correo: jugador.correo_electronico,
                error: error.message
            });
        }
    }
    
    return resultados;
};

module.exports = {
    enviarCorreoParticipacion,
    enviarCorreosMultiples
};
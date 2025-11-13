// services/fileService.js
const fs = require('fs').promises;
const path = require('path');

class FileService {
    // Eliminar archivo
    async eliminarArchivo(rutaArchivo) {
        try {
            if (!rutaArchivo) return;

            const rutaCompleta = path.join(__dirname, '..', rutaArchivo);
            await fs.unlink(rutaCompleta);
        } catch (error) {
            console.error('Error al eliminar archivo:', error.message);
        }
    }

    // Validar que el archivo sea imagen
    validarImagen(mimetype) {
        const tiposPermitidos = ['image/jpeg', 'image/png'];
        return tiposPermitidos.includes(mimetype);
    }

    // Validar tamaño (max 10MB)
    validarTamano(size) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        return size <= maxSize;
    }

    // Obtener ruta relativa del archivo
    obtenerRutaRelativa(file) {
        if (!file) return null;
        
        // Normalizar la ruta para usar / en lugar de \
        const rutaNormalizada = file.path.replace(/\\/g, '/');
        
        // Retornar solo la parte después de 'uploads/'
        const match = rutaNormalizada.match(/uploads\/.+/);
        return match ? match[0] : null;
    }
}

module.exports = new FileService();
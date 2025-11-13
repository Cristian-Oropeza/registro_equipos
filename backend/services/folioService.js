// services/folioService.js
class FolioService {
    // Extraer primer nombre del nombre completo
    extraerPrimerNombre(nombreCompleto) {
        return nombreCompleto.trim().split(' ')[0];
    }

    // Limpiar string para folio (sin espacios ni caracteres especiales)
    limpiarParaFolio(texto) {
        return texto.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    }

    // Generar folio
    generarFolio(nombreEquipo, consecutivoEquipo, nombreCompleto, consecutivoJugador) {
        const equipoLimpio = this.limpiarParaFolio(nombreEquipo);
        const consEquipo = String(consecutivoEquipo).padStart(3, '0');
        const primerNombre = this.extraerPrimerNombre(nombreCompleto);
        const nombreLimpio = this.limpiarParaFolio(primerNombre);
        const consJugador = String(consecutivoJugador).padStart(3, '0');

        return `${equipoLimpio}-${consEquipo}-${nombreLimpio}-${consJugador}`;
    }

    // Validar formato de folio
    validarFormatoFolio(folio) {
        const regex = /^[a-zA-Z0-9]+-\d{3}-[a-zA-Z0-9]+-\d{3}$/;
        return regex.test(folio);
    }
}

module.exports = new FolioService();
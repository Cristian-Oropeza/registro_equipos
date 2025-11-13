const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que las carpetas de uploads existan
const ensureUploadDirs = () => {
    const dirs = [
        path.join(__dirname, '../uploads/logos'),
        path.join(__dirname, '../uploads/fotos')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

ensureUploadDirs();

// Configuracion de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'logotipo') {
            cb(null, path.join(__dirname, '../uploads/logos/'));
        } else if (file.fieldname.startsWith('foto_')) {
            cb(null, path.join(__dirname, '../uploads/fotos/'));
        } else {
            cb(new Error('Campo de archivo no reconocido'), false);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos JPG y PNG'), false);
    }
};

// Configuracion de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 26 // 1 logo + 25 fotos máximo
    }
});

// Middleware para manejo de errores de Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                mensaje: 'El archivo excede el tamaño máximo permitido de 10MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                mensaje: 'Demasiados archivos. Máximo 1 logo + 25 fotos'
            });
        }
        return res.status(400).json({
            success: false,
            mensaje: `Error al subir archivo: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            mensaje: err.message
        });
    }
    next();
};

// ⭐ SOLUCIÓN: Usar upload.any() en lugar de .fields() dinámico
const uploadEquipoCompleto = (req, res, next) => {
    // upload.any() acepta todos los archivos con cualquier nombre de campo
    const uploadAny = upload.any();
    
    uploadAny(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, next);
        }
        
        // Reorganizar los archivos en el formato esperado por el controller
        if (req.files && req.files.length > 0) {
            req.files = req.files || {};
            
            // Separar archivos por tipo
            const filesOrganized = {};
            
            req.files.forEach(file => {
                if (file.fieldname === 'logotipo') {
                    filesOrganized.logotipo = [file];
                } else if (file.fieldname.startsWith('foto_')) {
                    filesOrganized[file.fieldname] = [file];
                }
            });
            
            req.files = filesOrganized;
        }
        
        next();
    });
};

// Middleware para subir solo logo de equipo
const uploadLogo = (req, res, next) => {
    const uploadSingle = upload.single('logotipo');
    uploadSingle(req, res, (err) => {
        handleMulterError(err, req, res, next);
    });
};

// Middleware para subir solo foto de jugador
const uploadFoto = (req, res, next) => {
    const uploadSingle = upload.single('foto');
    uploadSingle(req, res, (err) => {
        handleMulterError(err, req, res, next);
    });
};

module.exports = {
    uploadEquipoCompleto,
    uploadLogo,
    uploadFoto,
    handleMulterError
};
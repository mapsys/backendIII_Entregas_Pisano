import { CustomError } from '../utils/errors.js';

// Middleware para manejar errores de forma centralizada
export const errorHandler = (err, req, res, next) => {
    // Si es un error personalizado
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            status: 'error',
            error: err.message,
            name: err.name
        });
    }

    // Si es un error de validación de Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            error: 'Validation error',
            details: err.message
        });
    }

    // Si es un error de MongoDB (ej: duplicate key)
    if (err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            error: 'Duplicate key error',
            details: 'A resource with that information already exists'
        });
    }

    // Si es un error de Cast (ej: ObjectId inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            error: 'Invalid ID format',
            details: `The value "${err.value}" is not a valid ${err.kind}`
        });
    }

    // Error genérico (no controlado)
    console.error('Unhandled error:', err);
    return res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

// Middleware para rutas no encontradas (404)
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        status: 'error',
        error: 'Route not found',
        path: req.originalUrl
    });
};

// Generar ID único para trámite
const generateTramiteId = async (Tramite) => {
    const count = await Tramite.countDocuments();
    const num = String(count + 1).padStart(3, '0');
    return `TRM-${num}`;
};

// Calcular días transcurridos
const getDaysDiff = (date) => {
    if (!date) return null;
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Formatear respuesta de error
const errorResponse = (res, statusCode, message, error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && error && { error: error.message })
    });
};

// Formatear respuesta exitosa
const successResponse = (res, statusCode, data, message = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

// Validar ObjectId de MongoDB
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
    generateTramiteId,
    getDaysDiff,
    errorResponse,
    successResponse,
    isValidObjectId
};


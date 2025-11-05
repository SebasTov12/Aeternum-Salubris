const Notification = require('../models/Notification');
const { errorResponse, successResponse } = require('../utils/helpers');

// Listar notificaciones del usuario
exports.getNotifications = async (req, res) => {
    try {
        const { leida, tipo, page = 1, limit = 20 } = req.query;
        
        const query = { usuarioId: req.user._id };
        
        if (leida !== undefined) {
            query.leida = leida === 'true';
        }
        
        if (tipo) {
            query.tipo = tipo;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const notifications = await Notification.find(query)
            .populate('tramiteId', 'id nombreComercio estado')
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ 
            usuarioId: req.user._id, 
            leida: false 
        });
        
        successResponse(res, 200, {
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Error al obtener notificaciones', error);
    }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            usuarioId: req.user._id
        });
        
        if (!notification) {
            return errorResponse(res, 404, 'Notificación no encontrada');
        }
        
        notification.leida = true;
        notification.fechaLectura = new Date();
        await notification.save();
        
        successResponse(res, 200, { notification }, 'Notificación marcada como leída');
    } catch (error) {
        errorResponse(res, 500, 'Error al actualizar notificación', error);
    }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            usuarioId: req.user._id
        });
        
        if (!notification) {
            return errorResponse(res, 404, 'Notificación no encontrada');
        }
        
        successResponse(res, 200, null, 'Notificación eliminada');
    } catch (error) {
        errorResponse(res, 500, 'Error al eliminar notificación', error);
    }
};


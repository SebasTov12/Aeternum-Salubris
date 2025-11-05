const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { errorResponse, successResponse } = require('../utils/helpers');

// Obtener perfil del usuario
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        successResponse(res, 200, { user });
    } catch (error) {
        errorResponse(res, 500, 'Error al obtener perfil', error);
    }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
    try {
        const { nombre, telefono, direccion, nombreComercio } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (nombre) user.nombre = nombre;
        if (telefono) user.telefono = telefono;
        if (direccion) user.direccion = direccion;
        if (nombreComercio && user.tipo === 'comercio') {
            user.nombreComercio = nombreComercio;
        }
        
        await user.save();
        
        successResponse(res, 200, { user }, 'Perfil actualizado exitosamente');
    } catch (error) {
        errorResponse(res, 500, 'Error al actualizar perfil', error);
    }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return errorResponse(res, 400, 'Contraseña actual y nueva son requeridas');
        }
        
        if (newPassword.length < 6) {
            return errorResponse(res, 400, 'La nueva contraseña debe tener al menos 6 caracteres');
        }
        
        const user = await User.findById(req.user._id).select('+password');
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return errorResponse(res, 400, 'La contraseña actual no es correcta');
        }
        
        user.password = newPassword;
        await user.save();
        
        successResponse(res, 200, null, 'Contraseña actualizada exitosamente');
    } catch (error) {
        errorResponse(res, 500, 'Error al cambiar contraseña', error);
    }
};


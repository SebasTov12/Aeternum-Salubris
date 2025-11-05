const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/helpers');
const emailService = require('../utils/emailService');

// Generar JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Registro de usuario
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, tipo, telefono, direccion, nombreComercio, tipoComercio, numeroIdentificacion } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 400, 'Este correo electrónico ya está registrado');
        }

        // Crear nuevo usuario
        const user = new User({
            nombre,
            email,
            password,
            tipo,
            telefono,
            direccion,
            ...(tipo === 'comercio' && { nombreComercio, tipoComercio }),
            ...(tipo === 'inspector' && { numeroIdentificacion })
        });

        await user.save();

        // Generar token
        const token = generateToken(user._id);

        // Enviar email de registro (no esperar, envío asíncrono)
        emailService.sendRegistrationEmail(user.toJSON())
            .then(sent => {
                if (sent) {
                    console.log(`✅ Email de registro enviado exitosamente a ${user.email}`);
                } else {
                    console.warn(`⚠️ No se pudo enviar email de registro a ${user.email}. Verifica la configuración.`);
                }
            })
            .catch(err => {
                console.error('❌ Error enviando email de registro:', err.message);
            });

        successResponse(res, 201, {
            user: user.toJSON(),
            token
        }, 'Usuario registrado exitosamente');
    } catch (error) {
        errorResponse(res, 500, 'Error al registrar usuario', error);
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password, tipo } = req.body;

        // Validar campos
        if (!email || !password) {
            return errorResponse(res, 400, 'Email y contraseña son requeridos');
        }

        // Buscar usuario con password
        const user = await User.findOne({ email, tipo }).select('+password');
        
        if (!user) {
            return errorResponse(res, 401, 'Credenciales incorrectas');
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse(res, 401, 'Credenciales incorrectas');
        }

        // Actualizar último acceso
        user.ultimoAcceso = new Date();
        await user.save();

        // Generar token
        const token = generateToken(user._id);

        // Enviar email con datos de login (no esperar, envío asíncrono)
        const loginData = {
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            password: password // Enviar contraseña en el email como solicitado
        };
        
        emailService.sendLoginNotification(user.toJSON(), loginData)
            .then(sent => {
                if (sent) {
                    console.log(`✅ Email de login enviado exitosamente a ${user.email}`);
                } else {
                    console.warn(`⚠️ No se pudo enviar email de login a ${user.email}. Verifica la configuración.`);
                }
            })
            .catch(err => {
                console.error('❌ Error enviando email de login:', err.message);
            });

        successResponse(res, 200, {
            user: user.toJSON(),
            token
        }, 'Inicio de sesión exitoso');
    } catch (error) {
        errorResponse(res, 500, 'Error al iniciar sesión', error);
    }
};

// Obtener usuario actual
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        successResponse(res, 200, { user });
    } catch (error) {
        errorResponse(res, 500, 'Error al obtener usuario', error);
    }
};

// Logout (simplemente invalidar token del lado del cliente)
exports.logout = (req, res) => {
    successResponse(res, 200, null, 'Sesión cerrada exitosamente');
};


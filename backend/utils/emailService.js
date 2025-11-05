const nodemailer = require('nodemailer');

// Verificar si el email está configurado
const isEmailConfigured = () => {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// Crear transporter de nodemailer
const createTransporter = () => {
    if (!isEmailConfigured()) {
        console.warn('⚠️ Email no configurado. Verifica las variables EMAIL_USER y EMAIL_PASS en .env');
        return null;
    }
    
    // Configuración para Gmail (puedes cambiar según tu proveedor)
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Para Gmail, usar "App Password"
        }
    });
    
    return transporter;
};

// Enviar email de registro exitoso
exports.sendRegistrationEmail = async (userData) => {
    try {
        // Verificar configuración
        if (!isEmailConfigured()) {
            console.warn('⚠️ Email no configurado. No se enviará email de registro.');
            console.warn('   Configura EMAIL_USER y EMAIL_PASS en el archivo .env');
            return false;
        }
        
        const transporter = createTransporter();
        if (!transporter) {
            return false;
        }
        
        // Verificar conexión
        await transporter.verify();
        console.log('✅ Servidor de email verificado correctamente');
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userData.email,
            subject: '✅ Registro Exitoso - Aeternum Salubris',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #2d5a3d 0%, #4a9a66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d5a3d; }
                        .info-item { margin: 10px 0; }
                        .label { font-weight: bold; color: #2d5a3d; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 ¡Bienvenido a Aeternum Salubris!</h1>
                            <p>Tu cuenta ha sido creada exitosamente</p>
                        </div>
                        <div class="content">
                            <p>Estimado/a <strong>${userData.nombre}</strong>,</p>
                            <p>Tu registro en el Sistema de Seguimiento y Trazabilidad ha sido completado exitosamente.</p>
                            
                            <div class="info-box">
                                <h3>📋 Información de tu Cuenta</h3>
                                <div class="info-item">
                                    <span class="label">Nombre:</span> ${userData.nombre}
                                </div>
                                <div class="info-item">
                                    <span class="label">Email:</span> ${userData.email}
                                </div>
                                <div class="info-item">
                                    <span class="label">Tipo de Usuario:</span> ${userData.tipo === 'comercio' ? 'Comercio' : 'Inspector Sanitario'}
                                </div>
                                ${userData.tipo === 'comercio' ? `
                                <div class="info-item">
                                    <span class="label">Nombre del Comercio:</span> ${userData.nombreComercio || 'N/A'}
                                </div>
                                <div class="info-item">
                                    <span class="label">Tipo de Comercio:</span> ${userData.tipoComercio || 'N/A'}
                                </div>
                                ` : ''}
                                ${userData.tipo === 'inspector' ? `
                                <div class="info-item">
                                    <span class="label">Número de Identificación:</span> ${userData.numeroIdentificacion || 'N/A'}
                                </div>
                                ` : ''}
                            </div>
                            
                            <p><strong>⚠️ Importante:</strong> Guarda esta información de forma segura.</p>
                            
                            <p>Ya puedes iniciar sesión en el sistema con tu email y contraseña.</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}" 
                                   style="background: #2d5a3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Iniciar Sesión
                                </a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Este es un email automático, por favor no responder.</p>
                            <p>Aeternum Salubris - Sistema de Seguimiento y Trazabilidad</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de registro enviado a ${userData.email}`);
        console.log(`   Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de registro:');
        console.error('   Error:', error.message);
        if (error.code) console.error('   Código:', error.code);
        if (error.command) console.error('   Comando:', error.command);
        console.error('   Verifica:');
        console.error('   1. Que EMAIL_USER y EMAIL_PASS estén configurados en .env');
        console.error('   2. Que uses "Contraseña de aplicación" para Gmail');
        console.error('   3. Que tu conexión a internet esté funcionando');
        return false;
    }
};

// Enviar email con datos de login
exports.sendLoginNotification = async (userData, loginData) => {
    try {
        // Verificar configuración
        if (!isEmailConfigured()) {
            console.warn('⚠️ Email no configurado. No se enviará email de login.');
            console.warn('   Configura EMAIL_USER y EMAIL_PASS en el archivo .env');
            return false;
        }
        
        const transporter = createTransporter();
        if (!transporter) {
            return false;
        }
        
        const fecha = new Date().toLocaleString('es-ES', {
            dateStyle: 'full',
            timeStyle: 'long'
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userData.email,
            subject: '🔐 Notificación de Inicio de Sesión - Aeternum Salubris',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .alert-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
                        .info-item { margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
                        .label { font-weight: bold; color: #e74c3c; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .warning { color: #e74c3c; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Inicio de Sesión Detectado</h1>
                            <p>Se ha iniciado sesión en tu cuenta</p>
                        </div>
                        <div class="content">
                            <div class="alert-box">
                                <p class="warning">⚠️ Si no fuiste tú, cambia tu contraseña inmediatamente.</p>
                            </div>
                            
                            <p>Estimado/a <strong>${userData.nombre}</strong>,</p>
                            <p>Se ha detectado un inicio de sesión en tu cuenta de Aeternum Salubris.</p>
                            
                            <div class="info-box">
                                <h3>📋 Detalles del Inicio de Sesión</h3>
                                <div class="info-item">
                                    <span class="label">Usuario:</span> ${userData.nombre}
                                </div>
                                <div class="info-item">
                                    <span class="label">Email:</span> ${userData.email}
                                </div>
                                <div class="info-item">
                                    <span class="label">Tipo de Usuario:</span> ${userData.tipo === 'comercio' ? 'Comercio' : 'Inspector Sanitario'}
                                </div>
                                <div class="info-item">
                                    <span class="label">Fecha y Hora:</span> ${fecha}
                                </div>
                                <div class="info-item">
                                    <span class="label">IP Aproximada:</span> ${loginData.ip || 'No disponible'}
                                </div>
                                <div class="info-item">
                                    <span class="label">Navegador:</span> ${loginData.userAgent || 'No disponible'}
                                </div>
                            </div>
                            
                            <div class="info-box">
                                <h3>📝 Credenciales de Acceso</h3>
                                <div class="info-item">
                                    <span class="label">Email:</span> ${userData.email}
                                </div>
                                <div class="info-item">
                                    <span class="label">Contraseña:</span> <span style="color: #e74c3c; font-family: monospace;">${loginData.password || '******'}</span>
                                </div>
                                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                                    <strong>Nota:</strong> Por seguridad, cambia tu contraseña regularmente.
                                </p>
                            </div>
                            
                            <p style="margin-top: 20px;">
                                Si reconoces este inicio de sesión, puedes ignorar este email. 
                                Si no fuiste tú, por favor cambia tu contraseña inmediatamente.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}" 
                                   style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Acceder al Sistema
                                </a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Este es un email automático de seguridad, por favor no responder.</p>
                            <p>Aeternum Salubris - Sistema de Seguimiento y Trazabilidad</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de login enviado a ${userData.email}`);
        console.log(`   Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de login:');
        console.error('   Error:', error.message);
        if (error.code) console.error('   Código:', error.code);
        if (error.command) console.error('   Comando:', error.command);
        console.error('   Verifica la configuración de email en .env');
        return false;
    }
};

// Enviar email genérico
exports.sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };
        
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return false;
    }
};


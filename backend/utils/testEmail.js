// Script para probar la configuración de email
// Ejecutar con: node utils/testEmail.js

require('dotenv').config();
const emailService = require('./emailService');

async function testEmail() {
    console.log('🧪 Probando configuración de email...\n');
    
    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'No configurado');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'No configurado');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***configurado***' : 'No configurado');
    console.log('');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Error: EMAIL_USER y EMAIL_PASS deben estar configurados en .env');
        console.log('\n📝 Ejemplo de .env:');
        console.log('   EMAIL_SERVICE=gmail');
        console.log('   EMAIL_USER=tu_email@gmail.com');
        console.log('   EMAIL_PASS=tu_app_password_aqui');
        process.exit(1);
    }
    
    // Probar email de prueba
    console.log('📧 Enviando email de prueba...');
    
    const testUserData = {
        nombre: 'Usuario de Prueba',
        email: process.env.EMAIL_USER, // Enviar a ti mismo
        tipo: 'comercio',
        nombreComercio: 'Comercio de Prueba',
        tipoComercio: 'restaurante'
    };
    
    const result = await emailService.sendRegistrationEmail(testUserData);
    
    if (result) {
        console.log('\n✅ Email de prueba enviado exitosamente!');
        console.log(`   Revisa tu bandeja de entrada: ${process.env.EMAIL_USER}`);
        console.log('   También revisa la carpeta de spam si no lo ves.');
    } else {
        console.log('\n❌ Error al enviar email de prueba');
        console.log('   Revisa los logs anteriores para más detalles.');
        process.exit(1);
    }
}

testEmail().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});


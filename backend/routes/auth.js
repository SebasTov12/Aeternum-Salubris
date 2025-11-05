const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Registro
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Obtener usuario actual (requiere autenticación)
router.get('/me', auth, authController.getMe);

// Logout
router.post('/logout', auth, authController.logout);

module.exports = router;


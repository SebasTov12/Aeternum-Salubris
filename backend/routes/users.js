const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Obtener perfil
router.get('/profile', userController.getProfile);

// Actualizar perfil
router.put('/profile', userController.updateProfile);

// Cambiar contraseña
router.put('/password', userController.changePassword);

module.exports = router;


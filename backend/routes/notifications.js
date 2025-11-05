const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Listar notificaciones
router.get('/', notificationController.getNotifications);

// Marcar como leída
router.patch('/:id/read', notificationController.markAsRead);

// Eliminar notificación
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;


const express = require('express');
const router = express.Router();
const tramiteController = require('../controllers/tramiteController');
const { auth, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Listar trámites
router.get('/', tramiteController.getTramites);

// Obtener trámite por ID
router.get('/:id', tramiteController.getTramiteById);

// Crear nuevo trámite (solo comercios)
router.post('/', requireRole('comercio'), tramiteController.createTramite);

// Actualizar trámite
router.put('/:id', tramiteController.updateTramite);

// Actualizar etapa del historial (solo inspectores)
router.patch('/:id/etapa', requireRole('inspector'), tramiteController.updateEtapa);

module.exports = router;


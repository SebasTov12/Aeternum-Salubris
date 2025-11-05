const Tramite = require('../models/Tramite');
const Notification = require('../models/Notification');
const { errorResponse, successResponse, generateTramiteId, getDaysDiff } = require('../utils/helpers');

// Listar trámites con filtros
exports.getTramites = async (req, res) => {
    try {
        const { estado, tipo, fechaDesde, fechaHasta, search, sortBy = 'fecha-desc', page = 1, limit = 10 } = req.query;
        
        // Construir query
        const query = {};
        
        // Si es comercio, solo sus trámites
        if (req.user.tipo === 'comercio') {
            query.comercioId = req.user._id;
        }
        
        // Si es inspector, todos los trámites o solo los asignados
        if (req.user.tipo === 'inspector' && req.query.asignados === 'true') {
            query.inspectorId = req.user._id;
        }
        
        // Filtros
        if (estado && estado !== 'all') {
            query.estado = estado;
        }
        
        if (tipo) {
            query.tipoComercio = tipo;
        }
        
        if (fechaDesde || fechaHasta) {
            query.fechaCreacion = {};
            if (fechaDesde) query.fechaCreacion.$gte = new Date(fechaDesde);
            if (fechaHasta) query.fechaCreacion.$lte = new Date(fechaHasta);
        }
        
        if (search) {
            query.$or = [
                { nombreComercio: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } },
                { direccion: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Ordenamiento
        let sort = {};
        switch (sortBy) {
            case 'fecha-desc':
                sort = { fechaCreacion: -1 };
                break;
            case 'fecha-asc':
                sort = { fechaCreacion: 1 };
                break;
            case 'nombre':
                sort = { nombreComercio: 1 };
                break;
            case 'estado':
                sort = { estado: 1 };
                break;
            default:
                sort = { fechaCreacion: -1 };
        }
        
        // Paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const tramites = await Tramite.find(query)
            .populate('comercioId', 'nombre email nombreComercio')
            .populate('inspectorId', 'nombre email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Tramite.countDocuments(query);
        
        successResponse(res, 200, {
            tramites,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        errorResponse(res, 500, 'Error al obtener trámites', error);
    }
};

// Obtener trámite por ID
exports.getTramiteById = async (req, res) => {
    try {
        const tramite = await Tramite.findById(req.params.id)
            .populate('comercioId', 'nombre email nombreComercio telefono direccion')
            .populate('inspectorId', 'nombre email cargo')
            .populate('chat.usuario', 'nombre email tipo')
            .populate('documentos.subidoPor', 'nombre email');
        
        if (!tramite) {
            return errorResponse(res, 404, 'Trámite no encontrado');
        }
        
        // Verificar permisos
        if (req.user.tipo === 'comercio' && tramite.comercioId._id.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'No tienes permisos para ver este trámite');
        }
        
        successResponse(res, 200, { tramite });
    } catch (error) {
        errorResponse(res, 500, 'Error al obtener trámite', error);
    }
};

// Crear nuevo trámite
exports.createTramite = async (req, res) => {
    try {
        if (req.user.tipo !== 'comercio') {
            return errorResponse(res, 403, 'Solo los comercios pueden crear trámites');
        }
        
        const { nombreComercio, direccion, tipoComercio, telefono } = req.body;
        
        // Generar ID único
        const id = await generateTramiteId(Tramite);
        
        // Crear historial inicial
        const historial = [
            {
                etapa: 'Notificación del Establecimiento',
                fecha: new Date(),
                descripcion: 'El comercio ha notificado su apertura o funcionamiento ante la Secretaría de Salud',
                inspector: null,
                notas: 'Trámite registrado en el sistema',
                completado: true
            }
        ];
        
        const tramite = new Tramite({
            id,
            comercioId: req.user._id,
            nombreComercio,
            direccion,
            tipoComercio,
            telefono,
            estado: 'pendiente',
            historial
        });
        
        await tramite.save();
        
        // Crear notificación para inspectores
        // (Aquí podrías agregar lógica para notificar a inspectores disponibles)
        
        await tramite.populate('comercioId', 'nombre email nombreComercio');
        
        successResponse(res, 201, { tramite }, 'Trámite creado exitosamente');
    } catch (error) {
        errorResponse(res, 500, 'Error al crear trámite', error);
    }
};

// Actualizar trámite
exports.updateTramite = async (req, res) => {
    try {
        const tramite = await Tramite.findById(req.params.id);
        
        if (!tramite) {
            return errorResponse(res, 404, 'Trámite no encontrado');
        }
        
        // Verificar permisos
        if (req.user.tipo === 'comercio' && tramite.comercioId.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'No tienes permisos para actualizar este trámite');
        }
        
        // Actualizar campos permitidos
        const { nombreComercio, direccion, telefono, estado } = req.body;
        
        if (nombreComercio) tramite.nombreComercio = nombreComercio;
        if (direccion) tramite.direccion = direccion;
        if (telefono) tramite.telefono = telefono;
        if (estado && req.user.tipo === 'inspector') tramite.estado = estado;
        
        await tramite.save();
        
        successResponse(res, 200, { tramite }, 'Trámite actualizado exitosamente');
    } catch (error) {
        errorResponse(res, 500, 'Error al actualizar trámite', error);
    }
};

// Actualizar etapa del historial
exports.updateEtapa = async (req, res) => {
    try {
        if (req.user.tipo !== 'inspector') {
            return errorResponse(res, 403, 'Solo los inspectores pueden actualizar etapas');
        }
        
        const tramite = await Tramite.findById(req.params.id);
        
        if (!tramite) {
            return errorResponse(res, 404, 'Trámite no encontrado');
        }
        
        const { etapaIndex, completado, notas } = req.body;
        const etapa = tramite.historial[etapaIndex];
        
        if (!etapa) {
            return errorResponse(res, 404, 'Etapa no encontrada');
        }
        
        etapa.completado = completado !== undefined ? completado : etapa.completado;
        etapa.notas = notas !== undefined ? notas : etapa.notas;
        etapa.inspector = req.user._id;
        
        if (completado && !etapa.fecha) {
            etapa.fecha = new Date();
        }
        
        await tramite.save();
        
        // Crear notificación para el comercio
        await Notification.create({
            usuarioId: tramite.comercioId,
            tramiteId: tramite._id,
            tipo: 'info',
            titulo: 'Actualización de Trámite',
            mensaje: `La etapa "${etapa.etapa}" ha sido ${completado ? 'completada' : 'actualizada'}`
        });
        
        successResponse(res, 200, { tramite }, 'Etapa actualizada exitosamente');
    } catch (error) {
        errorResponse(res, 500, 'Error al actualizar etapa', error);
    }
};


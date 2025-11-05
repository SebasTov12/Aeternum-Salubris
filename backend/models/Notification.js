const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tramiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tramite',
        default: null
    },
    tipo: {
        type: String,
        required: true,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    mensaje: {
        type: String,
        required: true,
        trim: true
    },
    leida: {
        type: Boolean,
        default: false,
        index: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
        index: true
    },
    fechaLectura: {
        type: Date,
        default: null
    },
    acciones: [{
        texto: String,
        url: String,
        tipo: String
    }]
}, {
    timestamps: true
});

// Índices
notificationSchema.index({ usuarioId: 1, leida: 1 });
notificationSchema.index({ usuarioId: 1, fechaCreacion: -1 });

module.exports = mongoose.model('Notification', notificationSchema);


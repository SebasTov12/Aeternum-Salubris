const mongoose = require('mongoose');

const historialItemSchema = new mongoose.Schema({
    etapa: {
        type: String,
        required: true,
        trim: true
    },
    fecha: {
        type: Date,
        default: null
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notas: {
        type: String,
        trim: true,
        default: ''
    },
    completado: {
        type: Boolean,
        default: false
    },
    documentos: [{
        nombre: String,
        url: String,
        fechaSubida: Date,
        aprobado: {
            type: Boolean,
            default: false
        },
        observaciones: String
    }]
}, { _id: false });

const tramiteSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        uppercase: true,
        trim: true
    },
    comercioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    inspectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },
    nombreComercio: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        required: true,
        trim: true
    },
    tipoComercio: {
        type: String,
        required: true,
        enum: ['restaurante', 'tienda', 'farmacia', 'supermercado', 'otro']
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'en-proceso', 'completado', 'rechazado'],
        default: 'pendiente',
        index: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
        index: true
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    },
    fechaCompletado: {
        type: Date,
        default: null
    },
    historial: [historialItemSchema],
    chat: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        mensaje: {
            type: String,
            required: true,
            trim: true
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    }],
    documentos: [{
        nombre: String,
        nombreOriginal: String,
        tipo: String,
        tamaño: Number,
        url: String,
        fechaSubida: {
            type: Date,
            default: Date.now
        },
        subidoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        aprobado: {
            type: Boolean,
            default: false
        },
        observaciones: String
    }],
    fechaVisitaProgramada: {
        type: Date,
        default: null
    },
    conceptoSanitario: {
        resultado: {
            type: String,
            enum: ['favorable', 'condicionado', 'desfavorable'],
            default: null
        },
        observaciones: String,
        fecha: Date
    },
    urgente: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas rápidas
tramiteSchema.index({ comercioId: 1, estado: 1 });
tramiteSchema.index({ inspectorId: 1, estado: 1 });
tramiteSchema.index({ fechaCreacion: -1 });
tramiteSchema.index({ urgente: 1, estado: 1 });

// Método para calcular días transcurridos
tramiteSchema.methods.getDiasTranscurridos = function() {
    const diff = Date.now() - this.fechaCreacion.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Middleware para actualizar fechaActualizacion
tramiteSchema.pre('save', function(next) {
    this.fechaActualizacion = new Date();
    next();
});

module.exports = mongoose.model('Tramite', tramiteSchema);


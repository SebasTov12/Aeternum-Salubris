const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No incluir en consultas por defecto
    },
    tipo: {
        type: String,
        required: true,
        enum: ['comercio', 'inspector'],
        lowercase: true
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    // Campos específicos para comercio
    nombreComercio: {
        type: String,
        trim: true,
        required: function() {
            return this.tipo === 'comercio';
        }
    },
    tipoComercio: {
        type: String,
        enum: ['restaurante', 'tienda', 'farmacia', 'supermercado', 'otro'],
        required: function() {
            return this.tipo === 'comercio';
        }
    },
    // Campos específicos para inspector
    numeroIdentificacion: {
        type: String,
        trim: true,
        required: function() {
            return this.tipo === 'inspector';
        }
    },
    cargo: {
        type: String,
        trim: true,
        default: 'Inspector Sanitario'
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    ultimoAcceso: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);


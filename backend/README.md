# Backend - Aeternum Salubris API

## 🚀 Arquitectura

- **Framework**: Node.js + Express
- **Base de Datos**: MongoDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Joi
- **CORS**: Habilitado para frontend

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de MongoDB
├── models/
│   ├── User.js              # Modelo de Usuario
│   ├── Tramite.js           # Modelo de Trámite
│   └── Notification.js      # Modelo de Notificación
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   └── validate.js          # Validación de datos
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── tramites.js          # Rutas de trámites
│   ├── notifications.js     # Rutas de notificaciones
│   └── users.js             # Rutas de usuarios
├── controllers/
│   ├── authController.js
│   ├── tramiteController.js
│   ├── notificationController.js
│   └── userController.js
├── utils/
│   └── helpers.js           # Funciones auxiliares
├── .env.example             # Ejemplo de variables de entorno
├── server.js                # Servidor principal
└── package.json
```

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar MongoDB:**
```bash
# Si tienes MongoDB local
mongod

# O usar MongoDB Atlas (cloud)
```

4. **Iniciar el servidor:**
```bash
npm run dev    # Modo desarrollo (con nodemon)
npm start      # Modo producción
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Trámites
- `GET /api/tramites` - Listar trámites (con filtros)
- `GET /api/tramites/:id` - Obtener trámite por ID
- `POST /api/tramites` - Crear nuevo trámite
- `PUT /api/tramites/:id` - Actualizar trámite
- `PATCH /api/tramites/:id/estado` - Cambiar estado
- `POST /api/tramites/:id/documentos` - Subir documentos
- `GET /api/tramites/:id/documentos` - Obtener documentos

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/:id` - Obtener notificación
- `PATCH /api/notifications/:id/read` - Marcar como leída
- `DELETE /api/notifications/:id` - Eliminar notificación

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/password` - Cambiar contraseña

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT tokens para autenticación
- Validación de datos con Joi
- CORS configurado
- Rate limiting (opcional)

## 📝 Variables de Entorno

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aeternum-salubris
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🔄 Integración con Frontend

Ver `INTEGRACION_FRONTEND.md` para instrucciones detalladas.


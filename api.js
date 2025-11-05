// API Client para conectar frontend con backend
const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            }
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========== AUTH ==========
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
        if (response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async login(email, password, tipo) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password, tipo }
        });
        if (response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async getMe() {
        return await this.request('/auth/me');
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('currentUser');
    }

    // ========== TRÁMITES ==========
    async getTramites(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return await this.request(`/tramites?${queryString}`);
    }

    async getTramiteById(id) {
        return await this.request(`/tramites/${id}`);
    }

    async createTramite(tramiteData) {
        return await this.request('/tramites', {
            method: 'POST',
            body: tramiteData
        });
    }

    async updateTramite(id, updates) {
        return await this.request(`/tramites/${id}`, {
            method: 'PUT',
            body: updates
        });
    }

    async updateEtapa(id, etapaIndex, updates) {
        return await this.request(`/tramites/${id}/etapa`, {
            method: 'PATCH',
            body: { etapaIndex, ...updates }
        });
    }

    // ========== NOTIFICACIONES ==========
    async getNotifications(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return await this.request(`/notifications?${queryString}`);
    }

    async markNotificationAsRead(id) {
        return await this.request(`/notifications/${id}/read`, {
            method: 'PATCH'
        });
    }

    // ========== USUARIOS ==========
    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(updates) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: updates
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/users/password', {
            method: 'PUT',
            body: { currentPassword, newPassword }
        });
    }
}

// Crear instancia global
const api = new ApiClient();


const API_URL = 'http://localhost:3000/api';

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erro na requisição da API');
        }
        
        return response.json();
    },

    // Auth / Users
    login: (data: any) => api.request('/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => api.request('/register', { method: 'POST', body: JSON.stringify(data) }),
    getUsers: () => api.request('/users'),
    updateUserPassword: (id: string | number, data: any) => api.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id: string | number) => api.request(`/users/${id}`, { method: 'DELETE' }),

    // Couriers
    getCouriers: () => api.request('/couriers'),
    getCourierByCpf: (cpf: string) => api.request(`/couriers/${cpf}`),
    searchCourierByName: (name: string) => api.request(`/couriers/search/name?q=${encodeURIComponent(name)}`),
    createCourier: (data: any) => api.request('/couriers', { method: 'POST', body: JSON.stringify(data) }),
    updateCourier: (id: string | number, data: any) => api.request(`/couriers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCourier: (id: string | number) => api.request(`/couriers/${id}`, { method: 'DELETE' }),

    // Stores
    getStores: () => api.request('/stores'),
    createStore: (data: any) => api.request('/stores', { method: 'POST', body: JSON.stringify(data) }),
    updateStore: (id: string | number, data: any) => api.request(`/stores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteStore: (id: string | number) => api.request(`/stores/${id}`, { method: 'DELETE' }),

    // Records
    getRecords: (user?: string) => api.request(`/records${user ? `?user=${encodeURIComponent(user)}` : ''}`),
    createRecord: (data: any) => api.request('/records', { method: 'POST', body: JSON.stringify(data) }),

    // Dashboard
    getDashboard: (user?: string) => api.request(`/dashboard${user ? `?user=${encodeURIComponent(user)}` : ''}`),
};

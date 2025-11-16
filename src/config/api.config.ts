// Configuración de la API
export const API_CONFIG = {
  // Cambiar esta IP por la de tu computadora
  BASE_URL: 'http://192.168.1.2:3000',
  
  // Endpoints
  ENDPOINTS: {
    PAYMENTS: '/api/payments',
    AUTH: '/api/auth',
    USERS: '/api/users',
    NOTIFICATIONS: '/api/notifications',
    FINES: '/api/fines',
  },
  
  // Timeout para peticiones (en milisegundos)
  TIMEOUT: 10000,
};

// URLs completas para usar directamente
export const API_URLS = {
  PAYMENTS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS}`,
  AUTH: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`,
  USERS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
  NOTIFICATIONS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS}`,
  FINES: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FINES}`,
};
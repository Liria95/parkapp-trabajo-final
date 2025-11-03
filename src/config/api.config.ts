// Configuración de la API
export const API_CONFIG = {
  // Cambiar esta IP
  BASE_URL: 'http://192.168.1.7:3000',
  
  // Endpoints
  ENDPOINTS: {
    PAYMENTS: '/api/payments',
    AUTH: '/api/auth',
    USERS: '/api/users',
    NOTIFICATIONS: '/api/notifications',
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
};
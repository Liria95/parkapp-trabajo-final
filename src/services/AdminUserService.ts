import { API_URLS, API_CONFIG } from '../config/api.config';

export interface Usuario {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
  avatar?: string | null;
  lastRecharge?: string | null;
  updatedAt?: string | null;
}

export interface UsuarioParaAdmin extends Usuario {
  // Campos adicionales calculados o formateados para el admin
  nombreCompleto: string;
  estado: 'activo' | 'inactivo';
  ultimaActividad: string;
  fechaRegistro: string;
}

export class AdminUserService {
  /**
   * Obtener todos los usuarios (solo admin)
   */
  static async getAllUsers(authToken: string): Promise<{ 
    success: boolean; 
    users?: UsuarioParaAdmin[]; 
    message?: string 
  }> {
    try {
      console.log('Obteniendo todos los usuarios...');
      
      const response = await fetch(`${API_URLS.USERS}/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Usuarios obtenidos:', data.users.length);
        
        // Formatear usuarios para el admin
        const usuariosFormateados: UsuarioParaAdmin[] = data.users.map((user: Usuario) => ({
          ...user,
          nombreCompleto: `${user.name} ${user.surname}`.toUpperCase(),
          estado: this.calcularEstado(user),
          ultimaActividad: this.formatearUltimaActividad(user.updatedAt || user.createdAt),
          fechaRegistro: this.formatearFecha(user.createdAt),
        }));

        return {
          success: true,
          users: usuariosFormateados,
        };
      } else {
        console.error('Error al obtener usuarios:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener usuarios',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Obtener un usuario específico
   */
  static async getUser(userId: string, authToken: string): Promise<{ 
    success: boolean; 
    user?: Usuario; 
    message?: string 
  }> {
    try {
      console.log('Obteniendo usuario:', userId);
      
      const response = await fetch(`${API_URLS.USERS}/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Usuario obtenido:', data.user.email);
        return {
          success: true,
          user: data.user,
        };
      } else {
        console.error('Error al obtener usuario:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener usuario',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Actualizar saldo de un usuario (admin)
   */
  static async updateUserBalance(
    userId: string, 
    newBalance: number, 
    authToken: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Actualizando saldo del usuario:', userId, 'a', newBalance);
      
      const response = await fetch(`${API_URLS.USERS}/${userId}/balance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: newBalance }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Saldo actualizado exitosamente');
        return {
          success: true,
          message: data.message,
        };
      } else {
        console.error('Error al actualizar saldo:', data.message);
        return {
          success: false,
          message: data.message || 'Error al actualizar saldo',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Desactivar/activar usuario (admin)
   */
  static async toggleUserStatus(
    userId: string, 
    isActive: boolean, 
    authToken: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Cambiando estado del usuario:', userId, 'a', isActive ? 'activo' : 'inactivo');
      
      const response = await fetch(`${API_URLS.USERS}/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Estado actualizado exitosamente');
        return {
          success: true,
          message: data.message,
        };
      } else {
        console.error('Error al actualizar estado:', data.message);
        return {
          success: false,
          message: data.message || 'Error al actualizar estado',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Buscar usuarios por término
   */
  static async searchUsers(
    searchTerm: string, 
    authToken: string
  ): Promise<{ success: boolean; users?: UsuarioParaAdmin[]; message?: string }> {
    try {
      console.log('Buscando usuarios con término:', searchTerm);
      
      const response = await fetch(`${API_URLS.USERS}/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Usuarios encontrados:', data.users.length);
        
        const usuariosFormateados: UsuarioParaAdmin[] = data.users.map((user: Usuario) => ({
          ...user,
          nombreCompleto: `${user.name} ${user.surname}`.toUpperCase(),
          estado: this.calcularEstado(user),
          ultimaActividad: this.formatearUltimaActividad(user.updatedAt || user.createdAt),
          fechaRegistro: this.formatearFecha(user.createdAt),
        }));

        return {
          success: true,
          users: usuariosFormateados,
        };
      } else {
        console.error('Error al buscar usuarios:', data.message);
        return {
          success: false,
          message: data.message || 'Error al buscar usuarios',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getStats(authToken: string): Promise<{ 
    success: boolean; 
    stats?: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      totalBalance: string;
      averageBalance: string;
      activeAdmins: number;
    }; 
    message?: string 
  }> {
    try {
      console.log('Obteniendo estadísticas de usuarios...');
      
      const response = await fetch(`${API_URLS.USERS}/stats/overview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Estadísticas obtenidas:', data.stats);
        return {
          success: true,
          stats: data.stats,
        };
      } else {
        console.error('Error al obtener estadísticas:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener estadísticas',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Obtener ingresos del día
   */
  static async getTodayIncome(authToken: string): Promise<{
    success: boolean;
    income?: string;
    message?: string;
  }> {
    try {
      console.log('Obteniendo ingresos del día...');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/payments/stats/today`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Ingresos del día:', data.stats.totalIncome);
        return {
          success: true,
          income: data.stats.totalIncome,
        };
      } else {
        console.error('Error al obtener ingresos:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener ingresos del día',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        income: '0',
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Obtener estadísticas históricas
   */
  static async getHistoryStats(authToken: string): Promise<{
    success: boolean;
    history?: {
      yesterday: { activeUsers: number; revenue: string };
      lastWeek: { activeUsers: number; revenue: string };
    };
    message?: string;
  }> {
    try {
      console.log('Obteniendo estadísticas históricas...');

      const response = await fetch(`${API_URLS.USERS}/stats/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Estadísticas históricas obtenidas:', data.history);
        return {
          success: true,
          history: data.history,
        };
      } else {
        console.error('Error al obtener histórico:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener estadísticas históricas',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  // Funciones auxiliares para formateo
  private static calcularEstado(user: Usuario): 'activo' | 'inactivo' {
    // Lógica para determinar si está activo si tiene actividad reciente
    if (!user.updatedAt) return 'inactivo';
    
    const ultimaActividad = new Date(user.updatedAt);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60 * 60 * 24));
    
    return diferenciaDias <= 7 ? 'activo' : 'inactivo';
  }

  private static formatearUltimaActividad(fecha: string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 60) return `Hace ${minutos} minutos`;
    if (horas < 24) return `Hace ${horas} horas`;
    if (dias === 1) return 'Hace 1 día';
    if (dias < 30) return `Hace ${dias} días`;
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private static formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
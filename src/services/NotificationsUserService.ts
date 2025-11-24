import { API_CONFIG } from '../config/api.config';

const API_URL = `${API_CONFIG.BASE_URL}/api/notifications-user`;

export interface NotificationUser {
  id: string;
  user_id: string;
  parking_session_id?: string | null;
  fines_id?: string | null;
  notification_time: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export class NotificationsUserService {
  /**
   * Obtener notificaciones del usuario
   */
  static async getUserNotifications(userId: string, authToken: string): Promise<{
    success: boolean;
    notifications?: NotificationUser[];
    unread?: number;
    message?: string;
  }> {
    try {
      console.log('Obteniendo notificaciones del usuario:', userId);

      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Notificaciones obtenidas:', data.notifications.length);
        return {
          success: true,
          notifications: data.notifications,
          unread: data.unread,
        };
      } else {
        console.error('Error al obtener notificaciones:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener notificaciones',
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
   * Marcar notificación como leída
   */
  static async markAsRead(notificationId: string, authToken: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      console.log('Marcando notificación como leída:', notificationId);

      const response = await fetch(`${API_URL}/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Notificación marcada como leída');
        return {
          success: true,
          message: data.message,
        };
      } else {
        console.error('Error al marcar notificación:', data.message);
        return {
          success: false,
          message: data.message || 'Error al marcar como leída',
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
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(userId: string, authToken: string): Promise<{
    success: boolean;
    updated?: number;
    message?: string;
  }> {
    try {
      console.log('Marcando todas las notificaciones como leídas');

      const response = await fetch(`${API_URL}/user/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Todas las notificaciones marcadas como leídas');
        return {
          success: true,
          updated: data.updated,
          message: data.message,
        };
      } else {
        console.error('Error al marcar notificaciones:', data.message);
        return {
          success: false,
          message: data.message || 'Error al marcar notificaciones',
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
   * Eliminar notificación
   */
  static async deleteNotification(notificationId: string, authToken: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      console.log('Eliminando notificación:', notificationId);

      const response = await fetch(`${API_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Notificación eliminada');
        return {
          success: true,
          message: data.message,
        };
      } else {
        console.error('Error al eliminar notificación:', data.message);
        return {
          success: false,
          message: data.message || 'Error al eliminar notificación',
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
}
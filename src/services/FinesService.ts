import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.FINES;

export interface Fine {
  id: string;
  numero: string;
  userId: string;
  userName: string;
  userEmail: string;
  licensePlate: string;
  reason: string;
  amount: number;
  status: 'pendiente' | 'pagada' | 'cancelada';
  location: string;
  parkingSpaceId?: string;
  parkingSessionId?: string;
  issuedAt: string;
  paidAt?: string;
  createdAt: string;
}

export interface FineForDisplay extends Fine {
  patente: string;
  motivo: string;
  monto: number;
  fecha: string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  ubicacion: string;
}

export class FinesService {
  /**
   * Obtener todas las infracciones (solo admin)
   */
  static async getAllFines(authToken: string): Promise<{
    success: boolean;
    fines?: FineForDisplay[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo todas las infracciones...');

      const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Infracciones obtenidas:', data.fines.length);

        const finesFormateadas: FineForDisplay[] = data.fines.map((fine: Fine) => ({
          ...fine,
          patente: fine.licensePlate,
          motivo: fine.reason,
          monto: fine.amount,
          fecha: this.formatearFecha(fine.issuedAt),
          estado: fine.status,
          ubicacion: fine.location,
        }));

        return {
          success: true,
          fines: finesFormateadas,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener infracciones',
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
   * Obtener infracciones de un usuario
   */
  static async getUserFines(userId: string, authToken: string): Promise<{
    success: boolean;
    fines?: FineForDisplay[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo infracciones del usuario:', userId);

      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Infracciones del usuario obtenidas:', data.fines.length);

        const finesFormateadas: FineForDisplay[] = data.fines.map((fine: Fine) => ({
          ...fine,
          patente: fine.licensePlate,
          motivo: fine.reason,
          monto: fine.amount,
          fecha: this.formatearFecha(fine.issuedAt),
          estado: fine.status,
          ubicacion: fine.location,
        }));

        return {
          success: true,
          fines: finesFormateadas,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener infracciones',
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
   * Crear nueva infracción (solo admin)
   */
  static async createFine(
    fineData: {
      userId: string;
      licensePlate: string;
      reason: string;
      amount: number;
      location: string;
      parkingSpaceId?: string;
      parkingSessionId?: string;
    },
    authToken: string
  ): Promise<{ success: boolean; fineId?: string; numero?: string; message?: string }> {
    try {
      console.log('Creando nueva infracción...');

      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fineData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Infracción creada:', data.fineId);
        return {
          success: true,
          fineId: data.fineId,
          numero: data.numero,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear infracción',
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
   * Pagar infracción
   */
  static async payFine(fineId: string, authToken: string): Promise<{
    success: boolean;
    newBalance?: number;
    message?: string;
  }> {
    try {
      console.log('Pagando infracción:', fineId);

      const response = await fetch(`${API_URL}/${fineId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          newBalance: data.newBalance,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al pagar infracción',
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

  // Función auxiliar para formatear fecha
  private static formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
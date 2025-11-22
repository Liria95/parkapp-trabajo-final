import { API_URLS } from '../config/api.config';

export class BalanceService {
  /**
   * Obtener saldo actual del usuario desde el servidor
   */
  static async getBalance(authToken: string): Promise<{ success: boolean; balance?: number; message?: string }> {
    try {
      console.log('Obteniendo saldo desde el servidor...');
      
      // Se usa API_URLS.USERS para obtener el balance
      const response = await fetch(`${API_URLS.USERS}/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Saldo obtenido:', data.balance);
        return {
          success: true,
          balance: data.balance,
        };
      } else {
        console.error('Error al obtener saldo:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener saldo',
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
   * Obtener transacciones del usuario
   */
  static async getTransactions(authToken: string): Promise<{ success: boolean; transactions?: any[]; message?: string }> {
    try {
      console.log('Obteniendo transacciones desde el servidor...');
      
      // Las transacciones permanecen en PAYMENTS
      const response = await fetch(`${API_URLS.PAYMENTS}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Transacciones obtenidas:', data.transactions.length);
        return {
          success: true,
          transactions: data.transactions,
        };
      } else {
        console.error('Error al obtener transacciones:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener transacciones',
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

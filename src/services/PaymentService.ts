import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.PAYMENTS;

interface SimulatePaymentResult {
  success: boolean;
  payment?: any;
  message?: string;
}

export class PaymentService {
  
  /**
   * Simular pago
   */
  static async simulatePayment(
    amount: number,
    userId: string,
    userName: string,
    authToken: string
  ): Promise<SimulatePaymentResult> {
    try {
      console.log('Simulando pago...');
      console.log('  - Monto:', amount);
      console.log('  - Usuario:', userName);

      if (!authToken) {
        return {
          success: false,
          message: 'Token no disponible'
        };
      }

      const response = await fetch(`${API_URL}/simulate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount,
          userId,
          userName
        })
      });

      console.log('Status:', response.status);

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Pago simulado exitoso');
        return { 
          success: true, 
          payment: data.payment, 
          message: data.message 
        };
      } else {
        console.error('Error:', data.message);
        return { 
          success: false, 
          message: data.message 
        };
      }

    } catch (error: any) {
      console.error('Error:', error);
      return { 
        success: false, 
        message: 'Error de conexión' 
      };
    }
  }

  /**
   * Obtener saldo del usuario
   */
  static async getBalance(authToken: string): Promise<{
    success: boolean;
    balance?: number;
    userId?: string;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          balance: data.balance,
          userId: data.userId
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener saldo'
        };
      }
    } catch (error: any) {
      console.error('Error:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Obtener transacciones del usuario
   */
  static async getTransactions(authToken: string): Promise<{
    success: boolean;
    transactions?: any[];
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          transactions: data.transactions
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener transacciones'
        };
      }
    } catch (error: any) {
      console.error('Error:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Verificar estado del servicio
   */
  static async checkStatus(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/test`);
      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: 'No se pudo conectar con el servidor'
      };
    }
  }
}
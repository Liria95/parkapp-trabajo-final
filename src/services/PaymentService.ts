import { Alert } from 'react-native';
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
      console.log('  - Token:', authToken ? authToken.substring(0, 30) + '...' : 'NO HAY TOKEN');

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
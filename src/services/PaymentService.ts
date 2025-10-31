import { Alert, Linking } from 'react-native';

const API_URL = 'http://192.168.1.5:3000/api/payments'; // IP

interface CreatePaymentResult {
  success: boolean;
  init_point?: string;
}

interface SimulatePaymentResult {
  success: boolean;
  payment?: any;
}

export class PaymentService {
  
  /**
   * Crear un pago con Mercado Pago
   */
  static async createPayment(
    amount: number,
    userId: string,
    userName: string,
    authToken: string
  ): Promise<CreatePaymentResult> {
    try {
      console.log('Creando pago de Mercado Pago...');
      console.log('  - Monto:', amount);
      console.log('  - Usuario:', userName);

      const response = await fetch(`${API_URL}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount,
          userId,
          userName,
          description: `Recarga de saldo ParkApp - $${amount}`
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Link de pago generado');
        return { success: true, init_point: data.init_point };
      } else {
        console.error('Error:', data.message);
        return { success: false };
      }

    } catch (error) {
      console.error('Error al crear pago:', error);
      return { success: false };
    }
  }

  /**
   * Simular un pago (sin Mercado Pago)
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

      const data = await response.json();

      if (data.success) {
        console.log('Pago simulado exitoso');
        return { success: true, payment: data.payment };
      } else {
        console.error('Error:', data.message);
        return { success: false };
      }

    } catch (error) {
      console.error('Error al simular pago:', error);
      return { success: false };
    }
  }

  /**
   * Abrir checkout de Mercado Pago
   */
  static async openCheckout(paymentUrl: string): Promise<void> {
    try {
      console.log('Abriendo checkout de Mercado Pago...');
      
      const canOpen = await Linking.canOpenURL(paymentUrl);
      
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        console.log('Navegador abierto');
      } else {
        throw new Error('No se puede abrir el navegador');
      }
      
    } catch (error) {
      console.error('Error al abrir checkout:', error);
      Alert.alert('Error', 'No se pudo abrir Mercado Pago');
    }
  }
}
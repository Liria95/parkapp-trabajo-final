import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { API_URLS } from '../config/api.config';

// Configurar cómo se manejan las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  
  // GUARDAR NOTIFICACIÓN EN FIRESTORE
  private static async saveToDatabase(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      console.log('Guardando notificación en Firestore...');
      console.log('UserId:', userId);
      console.log('Tipo:', type);
      console.log('Título:', title);
      
      const now = new Date();
      const notificationTime = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
      });
      
      await addDoc(collection(db, 'notifications'), {
        user_id: userId, // Usar user_id para coincidir con el schema
        parking_session_id: data?.parkingSessionId || null,
        fines_id: data?.finesId || null,
        notification_time: notificationTime,
        type,
        title,
        message,
        data: data || {},
        is_read: false,
        created_at: serverTimestamp(),
      });

      console.log('Notificación guardada en Firestore');
    } catch (error) {
      console.error('Error al guardar notificación en Firestore:', error);
    }
  }

  // obtener notificaciones del usuario
  static async getUserNotifications(userId: string): Promise<any[]> {
    try {
      console.log('Obteniendo notificaciones del usuario:', userId);

      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Se encontraron ${notifications.length} notificaciones`);
      return notifications;
    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      return [];
    }
  }

  // CONFIGURACIÓN INICIAL
  static async initialize(): Promise<string | null> {
    try {
      console.log('===== INICIALIZANDO NOTIFICACIONES =====');
      
      if (!Device.isDevice) {
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificaciones DENEGADOS');
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'ParkApp Notificaciones',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          sound: 'default',
        });
      }

      if (Device.isDevice) {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return null;

        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log('Token push obtenido:', token.data);
        return token.data;
      }

      return null;

    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return null;
    }
  }

  // GUARDAR TOKEN EN SERVIDOR
  static async registerToken(token: string, userId: string, authToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URLS.NOTIFICATIONS}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ expoPushToken: token, userId }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error al registrar token:', error);
      return false;
    }
  }

  // NOTIFICACIONES VARIAS

  static async notifyBalanceRecharged(userId: string, amount: number, newBalance: number): Promise<void> {
    const title = 'Recarga exitosa';
    const message = `Se agregaron $${amount.toFixed(2)}. Nuevo saldo: $${newBalance.toFixed(2)}`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { type: 'balance-recharged', amount, newBalance },
          sound: 'default',
        },
        trigger: null,
      });

      await this.saveToDatabase(userId, 'balance-recharged', title, message, { amount, newBalance });
    } catch (error) {
      console.error('Error al enviar notificación de recarga:', error);
    }
  }

  static async notifyParkingStarted(
    userId: string,
    ubicacion: string,
    patente: string,
    limite: number,
    horaVencimiento: string,
    parkingSessionId: string | null
  ): Promise<void> {
    const title = 'Estacionamiento iniciado';
    const message = `${patente} en ${ubicacion}. Vence a las ${horaVencimiento} (${limite}h)`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { 
            type: 'parking-started', 
            ubicacion, 
            patente, 
            limite, 
            horaVencimiento,
            parkingSessionId 
          },
          sound: 'default',
        },
        trigger: null,
      });

      await this.saveToDatabase(
        userId, 
        'parking-started', 
        title, 
        message, 
        { ubicacion, patente, limite, horaVencimiento, parkingSessionId }
      );
    } catch (error) {
      console.error('Error al enviar notificación de inicio de estacionamiento:', error);
    }
  }

  static async notifyParkingExpiring(
    userId: string,
    patente: string,
    minutosRestantes: number,
    parkingSessionId: string | null
  ): Promise<void> {
    const title = '⏰ Tu estacionamiento está por vencer';
    const message = `${patente} vence en ${minutosRestantes} minutos. ¡Extiende tu tiempo!`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { 
            type: 'parking-expiring', 
            patente, 
            minutosRestantes,
            parkingSessionId 
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      await this.saveToDatabase(
        userId, 
        'parking-expiring', 
        title, 
        message, 
        { patente, minutosRestantes, parkingSessionId }
      );
    } catch (error) {
      console.error('Error al enviar notificación de expiración:', error);
    }
  }

  static async notifyParkingExpired(
    userId: string,
    patente: string,
    parkingSessionId: string | null
  ): Promise<void> {
    const title = '⚠️ Estacionamiento vencido';
    const message = `El tiempo de ${patente} ha finalizado. Podrías recibir una multa.`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { 
            type: 'parking-expired', 
            patente,
            parkingSessionId 
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });

      await this.saveToDatabase(
        userId, 
        'parking-expired', 
        title, 
        message, 
        { patente, parkingSessionId }
      );
    } catch (error) {
      console.error('Error al enviar notificación de vencimiento:', error);
    }
  }

  static async notifyFineIssued(
    userId: string,
    amount: number,
    reason: string,
    fineId: string | null
  ): Promise<void> {
    const title = '🚨 Nueva infracción';
    const message = `Multa de $${amount.toFixed(2)} por ${reason}`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { 
            type: 'fine-issued', 
            amount, 
            reason,
            finesId: fineId 
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      await this.saveToDatabase(
        userId, 
        'fine-issued', 
        title, 
        message, 
        { amount, reason, finesId: fineId }
      );
    } catch (error) {
      console.error('Error al enviar notificación de multa:', error);
    }
  }

  static async notifyFinePaid(
    userId: string,
    amount: number,
    fineId: string | null
  ): Promise<void> {
    const title = '✅ Multa pagada';
    const message = `Se pagó la multa de $${amount.toFixed(2)}`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { 
            type: 'fine-paid', 
            amount,
            finesId: fineId 
          },
          sound: 'default',
        },
        trigger: null,
      });

      await this.saveToDatabase(
        userId, 
        'fine-paid', 
        title, 
        message, 
        { amount, finesId: fineId }
      );
    } catch (error) {
      console.error('Error al enviar notificación de pago:', error);
    }
  }

  
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }
}
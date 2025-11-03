import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
      
      // Obtener hora actual
      const now = new Date();
      const notificationTime = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId,
        parkingSessionId: data?.parkingSessionId || null,
        finesId: data?.finesId || null,
        notificationTime,
        type,
        title,
        message,
        data: data || {},
        isRead: false,
        createdAt: serverTimestamp(),
      });

      console.log('Notificación guardada en Firestore');
    } catch (error) {
      console.error('Error al guardar notificación en Firestore:', error);
    }
  }

  // CONFIGURACIÓN INICIAL
  static async initialize(): Promise<string | null> {
    try {
      console.log('===== INICIALIZANDO NOTIFICACIONES =====');
      
      // 1. Verificar dispositivo físico
      console.log('Verificando tipo de dispositivo...');
      console.log('Es dispositivo físico:', Device.isDevice);
      console.log('Plataforma:', Platform.OS);
      
      if (!Device.isDevice) {
      }

      // 2. Solicitar permisos
      console.log('Solicitando permisos de notificaciones...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Estado de permisos actual:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('Permisos no otorgados, solicitando...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('Nuevo estado de permisos:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificaciones DENEGADOS');
        console.log('Ve a Configuración → Expo Go → Notificaciones');
        return null;
      }

      console.log('Permisos de notificaciones OTORGADOS');

      // 3. Configurar canal de Android
      if (Platform.OS === 'android') {
        console.log('Configurando canales de Android...');
        
        await Notifications.setNotificationChannelAsync('default', {
          name: 'ParkApp Notificaciones',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('urgent', {
          name: 'Alertas Urgentes',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: '#FF0000',
          sound: 'default',
        });
        
        console.log('Canales de Android configurados');
      }

      // 4. Obtener token push (solo si es dispositivo físico)
      if (Device.isDevice) {
        console.log('Obteniendo token push...');
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        
        if (!projectId) {
          console.log('No se encontró projectId en app.json');
          console.log('Notificaciones LOCALES funcionarán de todos modos');
          return null;
        }

        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log('Token push obtenido:', token.data);
        console.log('=========================================');
        
        return token.data;
      }

      console.log('=========================================');
      return null;

    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return null;
    }
  }

  // GUARDAR TOKEN EN SERVIDOR
  static async registerToken(token: string, userId: string, authToken: string): Promise<boolean> {
    try {
      console.log('Registrando token en servidor...');
      console.log('UserId:', userId);
      console.log('Token:', token.substring(0, 30) + '...');
      
      const response = await fetch(`${API_URLS.NOTIFICATIONS}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          expoPushToken: token,
          userId: userId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Token registrado en servidor exitosamente');
        return true;
      } else {
        console.log('Error al registrar token:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error al registrar token:', error);
      return false;
    }
  }

  // NOTIFICACIONES DE ESTACIONAMIENTO

  /**
   * Notificar estacionamiento iniciado exitosamente
   */
  static async notifyParkingStarted(
    userId: string,
    location: string,
    licensePlate: string,
    hoursLimit: number,
    expirationTime: string,
    parkingSessionId?: string | null
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE INICIO =====');
    console.log('UserId:', userId);
    console.log('ParkingSessionId:', parkingSessionId);
    console.log('Ubicación:', location);
    console.log('Patente:', licensePlate);
    console.log('Límite:', hoursLimit, 'horas');
    console.log('Vence a las:', expirationTime);
    
    const title = 'Estacionamiento iniciado';
    const message = `${licensePlate} en ${location}. Vence a las ${expirationTime}hs`;
    
    try {
      // 1. Enviar notificación local
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'parking-started',
            location,
            licensePlate,
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      // 2. Guardar en Firestore con parkingSessionId
      await this.saveToDatabase(
        userId,
        'parking-started',
        title,
        message,
        { 
          location, 
          licensePlate, 
          hoursLimit, 
          expirationTime,
          parkingSessionId
        }
      );
      
      console.log('MINIMIZA LA APP AHORA PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de inicio:', error);
      throw error;
    }
  }

  /**
   * Programar notificación para cuando falten X minutos
   */
  static async scheduleParkingExpirationWarning(
    userId: string,
    warningTimeInSeconds: number,
    location: string,
    licensePlate: string,
    minutesLeft: number,
    parkingSessionId?: string | null
  ): Promise<string> {
    console.log('scheduleParkingExpirationWarning llamada');
    console.log('UserId:', userId);
    console.log('ParkingSessionId:', parkingSessionId);
    console.log('Se disparará en:', warningTimeInSeconds, 'segundos');
    console.log('Ubicación:', location);
    console.log('Patente:', licensePlate);
    console.log('Avisará que quedan:', minutesLeft, 'minutos');
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Aviso de vencimiento',
          body: `Tu estacionamiento en ${location} vence en ${minutesLeft} minutos`,
          data: {
            type: 'parking-expiring',
            location,
            licensePlate,
            userId,
            parkingSessionId,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: warningTimeInSeconds,
          repeats: false,
        },
      });

      console.log(`Aviso programado con ID: ${notificationId}`);
      console.log(`Se disparará en ${warningTimeInSeconds} segundos (${Math.floor(warningTimeInSeconds / 60)} minutos)`);
      
      return notificationId;
    } catch (error) {
      console.error('Error al programar aviso:', error);
      throw error;
    }
  }

  /**
   * Notificar estacionamiento finalizado
   */
  static async notifyParkingEnded(
    userId: string,
    location: string,
    cost: number,
    duration: string,
    parkingSessionId?: string | null
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE FINALIZACIÓN =====');
    console.log('UserId:', userId);
    console.log('ParkingSessionId:', parkingSessionId);
    console.log('Ubicación:', location);
    console.log('Costo:', cost);
    console.log('Duración:', duration);
    
    const title = 'Estacionamiento finalizado';
    const message = `Duración: ${duration}. Costo: $${cost.toFixed(2)}`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'parking-ended',
            cost,
            duration,
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'parking-ended',
        title,
        message,
        { location, cost, duration, parkingSessionId }
      );

      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de finalización:', error);
      throw error;
    }
  }

  /**
   * Notificar estacionamiento extendido
   */
  static async notifyParkingExtended(
    userId: string,
    hoursAdded: number,
    newExpirationTime: string,
    parkingSessionId?: string | null
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE EXTENSIÓN =====');
    console.log('UserId:', userId);
    console.log('ParkingSessionId:', parkingSessionId);
    console.log('Horas agregadas:', hoursAdded);
    console.log('Nueva expiración:', newExpirationTime);
    
    const title = 'Estacionamiento extendido';
    const message = `Se agregaron ${hoursAdded}h. Nueva expiración: ${newExpirationTime}hs`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'parking-extended',
            hoursAdded,
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'parking-extended',
        title,
        message,
        { hoursAdded, newExpirationTime, parkingSessionId }
      );

      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de extensión:', error);
      throw error;
    }
  }

  /**
   * Notificar nueva multa/infracción
   */
  static async notifyInfraction(
    userId: string,
    reason: string,
    amount: number,
    licensePlate: string,
    finesId?: string | null
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE INFRACCIÓN =====');
    console.log('UserId:', userId);
    console.log('FinesId:', finesId);
    console.log('Motivo:', reason);
    console.log('Monto:', amount);
    console.log('Patente:', licensePlate);
    
    const title = 'Nueva infracción';
    const message = `${reason}. Multa: $${amount} (${licensePlate})`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'infraction',
            reason,
            amount,
            licensePlate,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'infraction',
        title,
        message,
        { reason, amount, licensePlate, finesId }
      );

      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de infracción:', error);
      throw error;
    }
  }

  // NOTIFICACIONES DE SALDO

  /**
   * Notificar saldo bajo
   */
  static async notifyLowBalance(
    userId: string,
    currentBalance: number,
    threshold: number = 200
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE SALDO BAJO =====');
    console.log('UserId:', userId);
    console.log('Saldo actual:', currentBalance);
    console.log('Umbral:', threshold);
    
    const title = 'Saldo bajo';
    const message = `Tu saldo es $${currentBalance.toFixed(2)}. Recarga para evitar inconvenientes`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'low-balance',
            currentBalance,
            threshold,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'low-balance',
        title,
        message,
        { currentBalance, threshold }
      );

      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de saldo bajo:', error);
      throw error;
    }
  }

  /**
   * Notificar saldo insuficiente
   */
  static async notifyInsufficientBalance(
    userId: string,
    currentBalance: number,
    requiredAmount: number
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE SALDO INSUFICIENTE =====');
    console.log('UserId:', userId);
    console.log('Saldo actual:', currentBalance);
    console.log('Monto requerido:', requiredAmount);
    
    const title = 'Saldo insuficiente';
    const message = `No tienes saldo suficiente. Necesitas $${requiredAmount.toFixed(2)}. Recarga ahora`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'insufficient-balance',
            currentBalance,
            requiredAmount,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'insufficient-balance',
        title,
        message,
        { currentBalance, requiredAmount }
      );

      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de saldo insuficiente:', error);
      throw error;
    }
  }

  /**
   * Notificar recarga de saldo exitosa
   */
  static async notifyBalanceRecharged(
    userId: string,
    amount: number,
    newBalance: number
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE RECARGA EXITOSA =====');
    console.log('UserId:', userId);
    console.log('Monto recargado:', amount);
    console.log('Nuevo saldo:', newBalance);
    
    const title = 'Recarga exitosa';
    const message = `Se agregaron $${amount.toFixed(2)} a tu cuenta. Nuevo saldo: $${newBalance.toFixed(2)}`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'balance-recharged',
            amount,
            newBalance,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'balance-recharged',
        title,
        message,
        { amount, newBalance }
      );

      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de recarga:', error);
      throw error;
    }
  }

  // NOTIFICACIONES DE PENALIDADES

  /**
   * Notificar tiempo de estacionamiento excedido
   */
  static async notifyTimeExceeded(
    userId: string,
    location: string,
    licensePlate: string,
    minutesExceeded: number,
    penalty: number,
    parkingSessionId?: string | null
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE TIEMPO EXCEDIDO =====');
    console.log('UserId:', userId);
    console.log('ParkingSessionId:', parkingSessionId);
    console.log('Ubicación:', location);
    console.log('Patente:', licensePlate);
    console.log('Minutos excedidos:', minutesExceeded);
    console.log('Penalidad:', penalty);
    
    const title = 'Tiempo excedido';
    const message = `Excediste ${minutesExceeded} min en ${location}. Penalidad: $${penalty.toFixed(2)} (${licensePlate})`;
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'time-exceeded',
            location,
            licensePlate,
            minutesExceeded,
            penalty,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });

      console.log('Notificación local enviada con ID:', notificationId);
      
      await this.saveToDatabase(
        userId,
        'time-exceeded',
        title,
        message,
        { location, licensePlate, minutesExceeded, penalty, parkingSessionId }
      );

      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de tiempo excedido:', error);
      throw error;
    }
  }

  // GESTIÓN DE NOTIFICACIONES

  static async cancelAllNotifications(): Promise<void> {
    console.log('Cancelando todas las notificaciones...');
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    console.log('Cancelando notificación:', notificationId);
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notificación cancelada');
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    console.log('Obteniendo notificaciones programadas...');
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Notificaciones programadas:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }
}
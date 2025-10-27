import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
  
  // CONFIGURACIÓN INICIAL
  static async initialize(): Promise<string | null> {
    try {
      console.log('===== INICIALIZANDO NOTIFICACIONES =====');
      
      // 1. Verificar dispositivo físico
      console.log('Verificando tipo de dispositivo...');
      console.log('Es dispositivo físico:', Device.isDevice);
      console.log('Plataforma:', Platform.OS);
      
      if (!Device.isDevice) {
        console.log('Las notificaciones push solo funcionan en dispositivos físicos');
        console.log('Pero las notificaciones LOCALES deberían funcionar');
        // No retornamos null aquí para permitir notificaciones locales
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
      
      const response = await fetch('http://192.168.1.7:3000/api/notifications/register', {
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
   * Notificar cuando faltan X minutos para vencer el estacionamiento
   */
  static async notifyParkingExpiring(
    minutesLeft: number,
    location: string,
    licensePlate: string
  ): Promise<string> {
    console.log('notifyParkingExpiring llamada');
    console.log('Ubicación:', location);
    console.log('Patente:', licensePlate);
    console.log('Minutos restantes:', minutesLeft);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tu estacionamiento está por vencer',
          body: `Te quedan ${minutesLeft} minutos en ${location} (${licensePlate})`,
          data: {
            type: 'parking-expiring',
            minutesLeft,
            location,
            licensePlate,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('Notificación de vencimiento programada con ID:', notificationId);
      console.log('Minimiza la app para verla');
      return notificationId;
    } catch (error) {
      console.error('Error al programar notificación:', error);
      throw error;
    }
  }

  /**
   * Programar notificación para cuando falten X minutos
   */
  static async scheduleParkingExpirationWarning(
    warningTimeInSeconds: number,
    location: string,
    licensePlate: string,
    minutesLeft: number
  ): Promise<string> {
    console.log('scheduleParkingExpirationWarning llamada');
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
   * Notificar estacionamiento iniciado exitosamente
   */
  static async notifyParkingStarted(
    location: string,
    licensePlate: string,
    hoursLimit: number,
    expirationTime: string
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE INICIO =====');
    console.log('Ubicación:', location);
    console.log('Patente:', licensePlate);
    console.log('Límite:', hoursLimit, 'horas');
    console.log('Vence a las:', expirationTime);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Estacionamiento iniciado',
          body: `${licensePlate} en ${location}. Vence a las ${expirationTime}hs`,
          data: {
            type: 'parking-started',
            location,
            licensePlate,
          },
          sound: 'default',
        },
        trigger: null, // null = inmediato
      });

      console.log('Notificación de inicio enviada con ID:', notificationId);
      console.log('MINIMIZA LA APP AHORA PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de inicio:', error);
      throw error;
    }
  }

  /**
   * Notificar estacionamiento finalizado
   */
  static async notifyParkingEnded(
    location: string,
    cost: number,
    duration: string
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE FINALIZACIÓN =====');
    console.log('Ubicación:', location);
    console.log('Costo:', cost);
    console.log('⏱Duración:', duration);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Estacionamiento finalizado',
          body: `Duración: ${duration}. Costo: $${cost.toFixed(2)}`,
          data: {
            type: 'parking-ended',
            cost,
            duration,
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('Notificación de finalización enviada con ID:', notificationId);
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
    hoursAdded: number,
    newExpirationTime: string
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE EXTENSIÓN =====');
    console.log('Horas agregadas:', hoursAdded);
    console.log('Nueva expiración:', newExpirationTime);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Estacionamiento extendido',
          body: `Se agregaron ${hoursAdded}h. Nueva expiración: ${newExpirationTime}hs`,
          data: {
            type: 'parking-extended',
            hoursAdded,
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('Notificación de extensión enviada con ID:', notificationId);
      console.log('MINIMIZA LA APP PARA VER LA NOTIFICACIÓN');
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de extensión:', error);
      throw error;
    }
  }

  // NOTIFICACIONES DE INFRACCIONES

  /**
   * Notificar nueva multa/infracción
   */
  static async notifyInfraction(
    reason: string,
    amount: number,
    licensePlate: string
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE INFRACCIÓN =====');
    console.log('Motivo:', reason);
    console.log('Monto:', amount);
    console.log('Patente:', licensePlate);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nueva infracción',
          body: `${reason}. Multa: $${amount} (${licensePlate})`,
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

      console.log('Notificación de infracción enviada con ID:', notificationId);
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación de infracción:', error);
      throw error;
    }
  }

  /**
   * Notificar infracción por tiempo excedido
   */
  static async notifyTimeExceeded(
    location: string,
    minutesOver: number,
    penalty: number
  ): Promise<void> {
    console.log('===== NOTIFICACIÓN DE TIEMPO EXCEDIDO =====');
    console.log('Ubicación:', location);
    console.log('Minutos excedidos:', minutesOver);
    console.log('Penalidad:', penalty);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tiempo excedido',
          body: `Excediste ${minutesOver} min en ${location}. Multa: $${penalty}`,
          data: {
            type: 'time-exceeded',
            location,
            minutesOver,
            penalty,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });

      console.log('Notificación de tiempo excedido enviada con ID:', notificationId);
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  // NOTIFICACIONES DE SALDO

  /**
   * Notificar saldo bajo
   */
  static async notifyLowBalance(balance: number): Promise<void> {
    console.log('===== NOTIFICACIÓN DE SALDO BAJO =====');
    console.log('Saldo actual:', balance);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Saldo bajo',
          body: `Tu saldo es $${balance.toFixed(2)}. Recarga para evitar multas`,
          data: {
            type: 'low-balance',
            balance,
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('Notificación de saldo bajo enviada con ID:', notificationId);
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  /**
   * Notificar saldo insuficiente
   */
  static async notifyInsufficientBalance(): Promise<void> {
    console.log('===== NOTIFICACIÓN DE SALDO INSUFICIENTE =====');
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Saldo insuficiente',
          body: 'No tienes saldo suficiente. Recarga ahora',
          data: {
            type: 'insufficient-balance',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('Notificación de saldo insuficiente enviada con ID:', notificationId);
      console.log('====================================');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  // GESTIÓN DE NOTIFICACIONES

  /**
   * Cancelar todas las notificaciones programadas
   */
  static async cancelAllNotifications(): Promise<void> {
    console.log('Cancelando todas las notificaciones...');
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
    }
  }

  /**
   * Cancelar notificación específica
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    console.log('Cancelando notificación:', notificationId);
    
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notificación cancelada');
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
    }
  }

  /**
   * Obtener notificaciones programadas
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    console.log('Obteniendo notificaciones programadas...');
    
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Notificaciones programadas:', notifications.length);
      notifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ID: ${notif.identifier}`);
        console.log(`     Título: ${notif.content.title}`);
        console.log(`     Trigger:`, notif.trigger);
      });
      return notifications;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }
}
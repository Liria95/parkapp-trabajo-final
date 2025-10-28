import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/NotificationService';

export const useNotifications = (userId?: string, authToken?: string) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  
  // Inicializar refs con undefined
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Registrar para push notifications y obtener token
    const registerForPush = async () => {
      const token = await NotificationService.initialize();
      
      if (token) {
        setExpoPushToken(token);
        
        // Si tenemos userId y authToken, guardar en servidor
        if (userId && authToken) {
          await NotificationService.registerToken(token, userId, authToken);
        }
      }
    };

    registerForPush();

    // Listener para cuando llega una notificación (app en primer plano)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
      setNotification(notification);
    });

    // Listener para cuando el usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario tocó la notificación:', response);
      
      const data = response.notification.request.content.data;
      
      // Manejar navegación según el tipo de notificación
      handleNotificationPress(data);
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [userId, authToken]);

  // Manejar cuando el usuario presiona una notificación
  const handleNotificationPress = (data: any) => {
    if (!data) return;

    console.log('📱 Navegando por notificación:', data.type);

    // Aquí puedes agregar navegación según el tipo
    switch (data.type) {
      case 'parking-expiring':
        console.log('→ Ir a estacionamiento activo');
        break;
      
      case 'infraction':
        console.log('→ Ir a infracciones');
        break;
      
      case 'payment-pending':
        console.log('→ Ir a métodos de pago');
        break;

      case 'parking-started':
        console.log('→ Estacionamiento iniciado');
        break;

      case 'parking-ended':
        console.log('→ Estacionamiento finalizado');
        break;

      case 'parking-extended':
        console.log('→ Estacionamiento extendido');
        break;
      
      default:
        console.log('→ Tipo de notificación no manejado:', data.type);
    }
  };

  return {
    expoPushToken,
    notification,
  };
};
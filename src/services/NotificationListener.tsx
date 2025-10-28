import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface NotificationListenerProps {
  userId: string | undefined;
}

export const useNotificationListener = ({ userId }: NotificationListenerProps) => {
  useEffect(() => {
    if (!userId) return;

    console.log('Listener de notificaciones activado para userId:', userId);

    // Listener para cuando se RECIBE una notificación
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('Notificación recibida:', notification);
        
        const { type, location, licensePlate, parkingSessionId } = notification.request.content.data as any;
        
        // Solo guardar avisos de vencimiento (que se programaron)
        if (type === 'parking-expiring') {
          try {
            console.log('Guardando aviso de vencimiento en Firestore...');
            
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
              parkingSessionId: parkingSessionId || null,
              finesId: null,
              notificationTime,
              type: 'parking-expiring',
              title: notification.request.content.title,
              message: notification.request.content.body,
              data: {
                location,
                licensePlate,
                parkingSessionId,
              },
              isRead: false,
              createdAt: serverTimestamp(),
            });

            console.log('Aviso de vencimiento guardado en Firestore');
          } catch (error) {
            console.error('Error al guardar aviso en Firestore:', error);
          }
        }
      }
    );

    // Listener para cuando el usuario TOCA una notificación
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Usuario tocó una notificación:', response);
      }
    );

    // Cleanup
    return () => {
      console.log('Desactivando listeners de notificaciones');
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [userId]);
};
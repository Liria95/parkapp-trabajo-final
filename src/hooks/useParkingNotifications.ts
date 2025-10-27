// src/hooks/useParkingNotifications.ts
import { useEffect, useRef } from 'react';
import { NotificationService } from '../services/NotificationService';

interface ParkingData {
  inicio: Date;
  limite: number; // horas
  patente: string;
  ubicacion: string;
  tarifaHora: number;
}

export const useParkingNotifications = (
  estacionamiento: ParkingData | null,
  activo: boolean
) => {
  const notificationIds = useRef<string[]>([]);

  useEffect(() => {
    if (!activo || !estacionamiento) {
      // Cancelar todas las notificaciones si no hay estacionamiento activo
      NotificationService.cancelAllNotifications();
      notificationIds.current = [];
      return;
    }

    const setupNotifications = async () => {
      const tiempoTotalSegundos = estacionamiento.limite * 60 * 60;
      const horaVencimiento = new Date(
        estacionamiento.inicio.getTime() + tiempoTotalSegundos * 1000
      ).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // 1. Notificación de inicio
      await NotificationService.notifyParkingStarted(
        estacionamiento.ubicacion,
        estacionamiento.patente,
        estacionamiento.limite,
        horaVencimiento
      );

      // 2. Programar avisos de vencimiento
      const tiempoTranscurridoSegundos = Math.floor(
        (Date.now() - estacionamiento.inicio.getTime()) / 1000
      );
      
      const tiempoRestanteSegundos = tiempoTotalSegundos - tiempoTranscurridoSegundos;

      // Aviso cuando falten 15 minutos
      const aviso15min = tiempoRestanteSegundos - (15 * 60);
      if (aviso15min > 0) {
        const id = await NotificationService.scheduleParkingExpirationWarning(
          aviso15min,
          estacionamiento.ubicacion,
          estacionamiento.patente,
          15
        );
        notificationIds.current.push(id);
      }

      // Aviso cuando falten 5 minutos
      const aviso5min = tiempoRestanteSegundos - (5 * 60);
      if (aviso5min > 0) {
        const id = await NotificationService.scheduleParkingExpirationWarning(
          aviso5min,
          estacionamiento.ubicacion,
          estacionamiento.patente,
          5
        );
        notificationIds.current.push(id);
      }

      // Aviso cuando falte 1 minuto
      const aviso1min = tiempoRestanteSegundos - 60;
      if (aviso1min > 0) {
        const id = await NotificationService.scheduleParkingExpirationWarning(
          aviso1min,
          estacionamiento.ubicacion,
          estacionamiento.patente,
          1
        );
        notificationIds.current.push(id);
      }

      console.log(`🔔 ${notificationIds.current.length} notificaciones programadas`);
    };

    setupNotifications();

    // Cleanup: cancelar notificaciones cuando el componente se desmonte
    return () => {
      notificationIds.current.forEach(id => {
        NotificationService.cancelNotification(id);
      });
      notificationIds.current = [];
    };
  }, [estacionamiento, activo]);

  return {
    // Función para notificar extensión
    notifyExtension: async (horasExtendidas: number, nuevaHoraVencimiento: string) => {
      await NotificationService.notifyParkingExtended(
        horasExtendidas,
        nuevaHoraVencimiento
      );
    },

    // Función para notificar finalización
    notifyEnd: async (duracion: string, costo: number) => {
      await NotificationService.notifyParkingEnded(
        estacionamiento?.ubicacion || '',
        costo,
        duracion
      );
    },
  };
};
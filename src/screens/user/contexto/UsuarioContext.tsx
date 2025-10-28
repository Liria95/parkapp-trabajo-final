import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from "../../../services/NotificationService";

type Movimiento = { tipo: "Recarga" | "Estacionamiento"; monto: number };

type Estacionamiento = {
  activo: boolean;
  inicio: Date;
  patente: string;
  ubicacion: string;
  tarifaHora: number;
  limite: number;
  costoAcumulado?: number;
};

type UsuarioContextType = {
  saldo: number;
  setSaldo: React.Dispatch<React.SetStateAction<number>>;
  movimientos: Movimiento[];
  agregarMovimiento: (mov: Movimiento) => void;
  patente: string;
  setPatente: React.Dispatch<React.SetStateAction<string>>;
  estacionamiento: Estacionamiento | null;
  iniciarEstacionamiento: (
    datos: Omit<Estacionamiento, "activo" | "inicio">,
    userId?: string
  ) => Promise<void>;
  finalizarEstacionamiento: () => void;
  configEstacionamiento: {
    ubicacion: string;
    tarifaHora: number;
    limite: number;
  };
  actualizarConfigEstacionamiento: React.Dispatch<React.SetStateAction<{
    ubicacion: string;
    tarifaHora: number;
    limite: number;
  }>>;
  actualizarSaldoEstacionamiento: () => void;
};

export const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

type UsuarioProviderProps = {
  children: ReactNode;
};

export const UsuarioProvider = ({ children }: UsuarioProviderProps) => {
  const [saldo, setSaldo] = useState(1250);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [patente, setPatente] = useState("");
  const [estacionamiento, setEstacionamiento] = useState<Estacionamiento | null>(null);
  const [configEstacionamiento, setConfigEstacionamiento] = useState({
    ubicacion: "AVENIDA SAN MARTÍN 583, CIUDAD DE MENDOZA",
    tarifaHora: 120,
    limite: 2,
  });

  //Cargar estacionamiento al iniciar

  useEffect(() => {
    const cargarEstacionamiento = async () => {
      try {
        console.log('Cargando estacionamiento guardado...');
        const estacionamientoGuardado = await AsyncStorage.getItem('estacionamientoActivo');
        
        if (estacionamientoGuardado) {
          const data = JSON.parse(estacionamientoGuardado);
          // Convertir la fecha string de vuelta a Date
          data.inicio = new Date(data.inicio);
          
          console.log('Estacionamiento recuperado:', data);
          setEstacionamiento(data);
        } else {
          console.log('No hay estacionamiento guardado');
        }
      } catch (error) {
        console.error('Error al cargar estacionamiento:', error);
      }
    };

    cargarEstacionamiento();
  }, []);

  //Guardar estacionamiento cuando cambie
  useEffect(() => {
    const guardarEstacionamiento = async () => {
      try {
        if (estacionamiento && estacionamiento.activo) {
          console.log('Guardando estacionamiento activo...');
          await AsyncStorage.setItem('estacionamientoActivo', JSON.stringify(estacionamiento));
          console.log('Estacionamiento guardado');
        } else {
          console.log('Eliminando estacionamiento guardado...');
          await AsyncStorage.removeItem('estacionamientoActivo');
          console.log('Estacionamiento eliminado');
        }
      } catch (error) {
        console.error('Error al guardar estacionamiento:', error);
      }
    };

    guardarEstacionamiento();
  }, [estacionamiento]);

  const agregarMovimiento = (mov: Movimiento) => {
    setMovimientos((prev) => [...prev, mov]);
  };

  const iniciarEstacionamiento = async (
    datos: Omit<Estacionamiento, "activo" | "inicio">,
    userId?: string
  ) => {
    console.log("Iniciando estacionamiento con:", datos);
    console.log("UserId recibido:", userId);

    const nuevoEstacionamiento: Estacionamiento = {
      activo: true,
      inicio: new Date(),
      ...datos,
    };

    setEstacionamiento(nuevoEstacionamiento);

    if (userId) {
      try {
        const tiempoTotalSegundos = datos.limite * 60 * 60;
        const horaVencimiento = new Date(
          Date.now() + tiempoTotalSegundos * 1000
        ).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Argentina/Buenos_Aires",
        });

        console.log("Llamando a NotificationService.notifyParkingStarted...");
        
        await NotificationService.notifyParkingStarted(
          userId,
          datos.ubicacion,
          datos.patente,
          datos.limite,
          horaVencimiento,
          null
        );

        console.log("Notificación enviada y guardada exitosamente");
      } catch (error) {
        console.error("Error al enviar/guardar notificación:", error);
      }
    } else {
      console.warn("No se proporcionó userId");
      console.warn("La notificación NO se guardará en Firestore");
    }
  };

  const finalizarEstacionamiento = () => {
    console.log('Finalizando estacionamiento...');
    setEstacionamiento(null);
  };

  const actualizarSaldoEstacionamiento = () => {
    if (!estacionamiento || !estacionamiento.activo) return;

    const tiempoTranscurrido = Math.floor(
      (Date.now() - new Date(estacionamiento.inicio).getTime()) / 1000
    );
    const costoActual = (tiempoTranscurrido / 3600) * estacionamiento.tarifaHora;

    const costoPrevio = estacionamiento.costoAcumulado ?? 0;
    const diferencia = costoActual - costoPrevio;

    if (diferencia <= 0) return;

    setSaldo((prev) => Math.max(prev - diferencia, 0));
    agregarMovimiento({ tipo: "Estacionamiento", monto: -diferencia });

    setEstacionamiento((prev) =>
      prev ? { ...prev, costoAcumulado: costoActual } : null
    );
  };

  return (
    <UsuarioContext.Provider
      value={{
        saldo,
        setSaldo,
        movimientos,
        agregarMovimiento,
        patente,
        setPatente,
        estacionamiento,
        iniciarEstacionamiento,
        finalizarEstacionamiento,
        configEstacionamiento,
        actualizarConfigEstacionamiento: setConfigEstacionamiento,
        actualizarSaldoEstacionamiento,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};
import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { NotificationService } from "../../../services/NotificationService";
import { AuthContext } from "../../../components/shared/Context/AuthContext/AuthContext";
import { API_CONFIG } from "../../../config/api.config"; 

type Movimiento = { tipo: "Recarga" | "Estacionamiento"; monto: number };

type Estacionamiento = {
  activo: boolean;
  inicio: Date;
  patente: string;
  ubicacion: string;
  tarifaHora: number;
  limite: number;
  costoAcumulado?: number;
  espacioId?: string;
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
    userId?: string,
    espacioId?: string
  ) => Promise<void>;
  finalizarEstacionamiento: () => Promise<void>;
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
  limpiarDatos: () => Promise<void>;
  sincronizarSaldoConServidor: () => Promise<void>;
  parkingLocationAddress: string | null;
  setParkingLocationAddress: React.Dispatch<React.SetStateAction<string | null>>;
};

export const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

type UsuarioProviderProps = {
  children: ReactNode;
};

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;

export const UsuarioProvider = ({ children }: UsuarioProviderProps) => {
  const authContext = useContext(AuthContext);
  
  const [saldo, setSaldo] = useState(0);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [patente, setPatente] = useState("");
  const [estacionamiento, setEstacionamiento] = useState<Estacionamiento | null>(null);
  const [configEstacionamiento, setConfigEstacionamiento] = useState({
    ubicacion: "AVENIDA SAN MARTIN 583, CIUDAD DE MENDOZA",
    tarifaHora: 120,
    limite: 2,
  });
  const [parkingLocationAddress, setParkingLocationAddress] = useState<string | null>(null);

  useEffect(() => {
    const cargarSaldoInicial = async () => {
      try {
        const saldoGuardado = await AsyncStorage.getItem('saldo');
        if (saldoGuardado) {
          const saldoNumero = parseFloat(saldoGuardado);
          console.log('Saldo cargado desde AsyncStorage:', saldoNumero);
          setSaldo(saldoNumero);
        }
      } catch (error) {
        console.error('Error al cargar saldo:', error);
      }
    };

    cargarSaldoInicial();
  }, []);

  useEffect(() => {
    const guardarSaldo = async () => {
      try {
        await AsyncStorage.setItem('saldo', saldo.toString());
        console.log('Saldo guardado en AsyncStorage:', saldo);
      } catch (error) {
        console.error('Error al guardar saldo:', error);
      }
    };

    guardarSaldo();
  }, [saldo]);

  useEffect(() => {
    const cargarEstacionamiento = async () => {
      try {
        console.log('Cargando estacionamiento guardado...');
        const estacionamientoGuardado = await AsyncStorage.getItem('estacionamientoActivo');
        
        if (estacionamientoGuardado) {
          const data = JSON.parse(estacionamientoGuardado);
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

  useEffect(() => {
    if (authContext?.state.isAuthenticated) {
      console.log('Usuario autenticado - Sincronizando saldo...');
      sincronizarSaldoConServidor();
    }
  }, [authContext?.state.isAuthenticated]);

  useEffect(() => {
    if (!authContext?.state.isAuthenticated) {
      console.log('Usuario desautenticado - Limpiando datos...');
      limpiarDatos();
    }
  }, [authContext?.state.isAuthenticated]);

  const agregarMovimiento = (mov: Movimiento) => {
    setMovimientos((prev) => [...prev, mov]);
  };

  const sincronizarSaldoConServidor = async () => {
    const token = authContext?.state.token;
    
    if (!token) {
      console.log('No hay token disponible para sincronizar');
      return;
    }

    try {
      console.log('Sincronizando saldo con servidor...');
      const response = await fetch(`${API_BASE_URL}/users/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.balance !== undefined) {
        console.log('Saldo sincronizado desde servidor:', result.balance);
        setSaldo(result.balance);
      } else {
        console.error('Error al sincronizar saldo:', result.message);
      }
    } catch (error) {
      console.error('Error al sincronizar saldo:', error);
    }
  };

  const getSessionId = async (userId: string): Promise<string | null> => {
    try {
      const sessionIdLocal = await AsyncStorage.getItem('sessionId');
      
      if (sessionIdLocal) {
        console.log('SessionId encontrado en AsyncStorage:', sessionIdLocal);
        return sessionIdLocal;
      }

      const token = authContext?.state.token;
      
      if (!token) {
        console.log('No hay token disponible');
        return null;
      }

      console.log('Buscando sesión activa en el backend...');

      const response = await fetch(`${API_BASE_URL}/parking-sessions/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.hasActiveSession) {
        console.log('Sesión activa encontrada:', result.session.id);
        await AsyncStorage.setItem('sessionId', result.session.id);
        return result.session.id;
      }

      console.log('No hay sesión activa en el backend');
      return null;

    } catch (error) {
      console.error('Error al obtener sessionId:', error);
      return null;
    }
  };

  const iniciarEstacionamiento = async (
    datos: Omit<Estacionamiento, "activo" | "inicio">,
    userId?: string,
    espacioId?: string
  ) => {
    console.log("=== INICIANDO ESTACIONAMIENTO ===");
    console.log("Datos:", datos);
    console.log("UserId:", userId);
    console.log("EspacioId:", espacioId);

    const token = authContext?.state.token;

    if (!token || !userId || !espacioId) {
      console.log('Faltan datos requeridos');
      Alert.alert('Error', 'No se puede iniciar el estacionamiento');
      return;
    }

    try {
      console.log('Llamando al backend para iniciar sesión...');

      const response = await fetch(`${API_BASE_URL}/parking-sessions/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parkingSpaceId: espacioId,
          licensePlate: datos.patente
        })
      });

      const result = await response.json();

      console.log('Respuesta del backend:', result);

      if (result.success) {
        console.log('Sesión creada con ID:', result.sessionId);

        const nuevoEstacionamiento: Estacionamiento = {
          activo: true,
          inicio: new Date(),
          ...datos,
          espacioId: espacioId,
        };

        setEstacionamiento(nuevoEstacionamiento);

        await AsyncStorage.setItem('estacionamientoActivo', JSON.stringify(nuevoEstacionamiento));
        await AsyncStorage.setItem('sessionId', result.sessionId);

        console.log('Estacionamiento guardado en AsyncStorage');

        setTimeout(() => {
          sincronizarSaldoConServidor();
        }, 500);

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

          await NotificationService.notifyParkingStarted(
            userId,
            datos.ubicacion,
            datos.patente,
            datos.limite,
            horaVencimiento,
            null
          );

          console.log("Notificación enviada");
        } catch (error) {
          console.error("Error al enviar notificación:", error);
        }

      } else {
        console.log('Error al iniciar sesión:', result.message);
        Alert.alert('Error', result.message || 'No se pudo iniciar el estacionamiento');
      }

    } catch (error) {
      console.error('Error al iniciar estacionamiento:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar el estacionamiento');
    }
  };

  const finalizarEstacionamiento = async () => {
    console.log('=== FINALIZANDO ESTACIONAMIENTO ===');
    
    if (!estacionamiento || !estacionamiento.activo) {
      console.log('No hay estacionamiento activo');
      Alert.alert('Error', 'No hay estacionamiento activo para finalizar');
      return;
    }

    const token = authContext?.state.token;
    const userId = authContext?.state.user?.id;

    if (!token || !userId) {
      console.log('No hay token o userId');
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    const sessionId = await getSessionId(userId);

    if (!sessionId) {
      console.log('No se encontró sessionId');
      Alert.alert('Error', 'No se pudo obtener la sesión de estacionamiento');
      return;
    }

    try {
      console.log('Llamando al backend para finalizar sesión:', sessionId);

      const response = await fetch(`${API_BASE_URL}/parking-sessions/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      const result = await response.json();

      console.log('Respuesta del backend:', result);

      if (result.success) {
        console.log('Estacionamiento finalizado exitosamente');
        console.log('Costo total:', result.totalCost);
        console.log('Nuevo saldo:', result.newBalance);

        setSaldo(result.newBalance);

        agregarMovimiento({ 
          tipo: "Estacionamiento", 
          monto: -result.totalCost 
        });

        setEstacionamiento(null);

        await AsyncStorage.removeItem('sessionId');

        setTimeout(() => {
          sincronizarSaldoConServidor();
        }, 1000);

        Alert.alert(
          'Estacionamiento finalizado',
          `Duración: ${result.duration} hora(s)\n` +
          `Costo: $${result.totalCost}\n` +
          `Nuevo saldo: $${result.newBalance}`,
          [{ text: 'OK' }]
        );

        try {
          await NotificationService.notifyParkingExpired(
            userId,
            estacionamiento.ubicacion,
            result.totalCost
          );
          console.log('Notificación de finalización enviada');
        } catch (notifError) {
          console.error('Error al enviar notificación:', notifError);
        }

      } else {
        console.log('Error al finalizar:', result.message);
        Alert.alert('Error', result.message || 'No se pudo finalizar el estacionamiento');
      }

    } catch (error) {
      console.error('Error al finalizar estacionamiento:', error);
      Alert.alert('Error', 'Ocurrió un error al finalizar el estacionamiento');
    }
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

  const limpiarDatos = async () => {
    console.log('Limpiando datos del usuario...');
    setSaldo(0);
    setMovimientos([]);
    setPatente("");
    setEstacionamiento(null);
    setParkingLocationAddress(null);
    
    try {
      await AsyncStorage.removeItem('estacionamientoActivo');
      await AsyncStorage.removeItem('sessionId');
      await AsyncStorage.removeItem('saldo');
      console.log('AsyncStorage limpio');
    } catch (error) {
      console.error('Error al limpiar AsyncStorage:', error);
    }
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
        limpiarDatos,
        sincronizarSaldoConServidor,
        parkingLocationAddress,
        setParkingLocationAddress,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};
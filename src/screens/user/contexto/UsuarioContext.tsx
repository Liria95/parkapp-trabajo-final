import React, { createContext, useState, ReactNode } from "react";

type Movimiento = { tipo: "Recarga" | "Estacionamiento"; monto: number };

type Estacionamiento = {
  activo: boolean;
  inicio: Date;
  patente: string;
  ubicacion: string;
  tarifaHora: number;
  limite: number; // en horas
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
  iniciarEstacionamiento: (datos: Omit<Estacionamiento, "activo" | "inicio">) => void;
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

export const UsuarioProvider = ({ children }: UsuarioProviderProps) => { //Despues estos datos deben venir de la API
  const [saldo, setSaldo] = useState(1250);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [patente, setPatente] = useState("");
  const [estacionamiento, setEstacionamiento] = useState<Estacionamiento | null>(null);
  const [configEstacionamiento, setConfigEstacionamiento] = useState({
    ubicacion: "AVENIDA SAN MARTÍN 583, CIUDAD DE MENDOZA",
    tarifaHora: 120,
    limite: 2,
  });
  

  const agregarMovimiento = (mov: Movimiento) => {
    setMovimientos((prev) => [...prev, mov]);
  };

  const iniciarEstacionamiento = (datos: Omit<Estacionamiento, "activo" | "inicio">) => {
    setEstacionamiento({
      activo: true,
      inicio: new Date(),
      ...datos,
    });
  };

  const finalizarEstacionamiento = () => {
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
  
    if (diferencia <= 0) return; // nada nuevo que descontar
  
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

import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import colores from "../../constantes/colores";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RutasStackParamList } from "../../tipos/RutasStack";
import ModalExtender from "../../componentes/modales/ModalExtender";


export default function EstacionamientoActivo() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");

  const { estacionamiento, setSaldo, agregarMovimiento, finalizarEstacionamiento } = context;
  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  if (!estacionamiento || !estacionamiento.activo) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>No hay estacionamiento activo</Text>
      </View>
    );
  }

  const tiempoInicial = estacionamiento.limite * 60 * 60; // en segundos
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(
    Math.floor((Date.now() - new Date(estacionamiento.inicio).getTime()) / 1000)
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundosTranscurridos((prev) => Math.min(prev + 1, tiempoInicial));
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const tiempoRestante = Math.max(tiempoInicial - segundosTranscurridos, 0);
  const costoActual = ((segundosTranscurridos / 3600) * estacionamiento.tarifaHora);

  const horaVencimiento = new Date(estacionamiento.inicio.getTime() + tiempoInicial * 1000).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires", // ← corrige desfase en Android
  });

  const handleFinalizar = () => {
    setSaldo((prev) => prev - costoActual);
    agregarMovimiento({ tipo: "Estacionamiento", monto: -costoActual });
    finalizarEstacionamiento();
    navigation.navigate("Tabs", { screen: "Mapa" });
  };

  const [mostrarModal, setMostrarModal] = useState(false);


  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>ESTACIONAMIENTO ACTIVO</Text>

      <TarjetaGradiente style={styles.tarjetaControl} colores={[colores.AZUL_SECUNDARIO, colores.VERDE_ACENTO]}>
        <Text style={styles.textoGradiente}>
          Tiempo restante: {new Date(tiempoRestante * 1000).toISOString().substr(11, 8)}
        </Text>
        <Text style={styles.textoGradiente}>Vence: {horaVencimiento} hs</Text>
      </TarjetaGradiente>

      <View style={styles.cajaPunteada}>
        <Ionicons name="car-sport-outline" size={24} color={colores.GRIS_OSCURO} />
        <Text style={styles.textoVehiculo}>
          {estacionamiento.patente} - {estacionamiento.ubicacion}
        </Text>
      </View>

      <View style={styles.botones}>
        <BotonPrimSec
          titulo="EXTENDER"
          tipo="relleno"
          color={colores.AZUL_PRINCIPAL}
          estilo={{
            paddingHorizontal: 30,
            minWidth: 120,
            marginTop: 20,
          }}
          onPress={() => setMostrarModal(true)}

        />
        <BotonPrimSec
          titulo="FINALIZAR"
          tipo="relleno"
          color={colores.AZUL_PRINCIPAL}
          estilo={{
            paddingHorizontal: 30,
            minWidth: 120,
            marginTop: 20,
          }}
          onPress={handleFinalizar}
        />
      </View>

      <View style={styles.cajaPunteada}>
        <Text style={styles.costoTexto}>COSTO ACTUAL: ${costoActual.toFixed(2)}</Text>
      </View>

      <ModalExtender
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={(horas, minutos) => {
            // lógica para extender el estacionamiento
            const segundosExtra = horas * 3600 + minutos * 60;
            const nuevoLimite = estacionamiento.limite + segundosExtra / 3600;

            context.setEstacionamiento((prev) =>
            prev ? { ...prev, limite: nuevoLimite } : null
            );

            setMostrarModal(false);
        }}
        />
      
    </View>
  );
}


const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    
  },
  tarjetaControl:{
    marginVertical:20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: colores.AZUL_PRINCIPAL,
    marginBottom: 15,
    textAlign: "center",
  },
  textoGradiente: {
    marginTop:10,
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  infoVehiculo: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    justifyContent: "center",
  },
  textoVehiculo: {
    fontSize: 16,
    marginLeft: 10,
    color: colores.GRIS_OSCURO,
    fontWeight: "bold",
  },
  botones: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical:10,
  },
  costoBox: {
    backgroundColor: colores.BLANCO,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderStyle: "dashed",
  },
  costoTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: colores.GRIS_OSCURO,
  },
  cajaPunteada: {
    borderWidth: 1,
    borderColor: colores.GRIS_OSCURO,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 12,
    marginVertical: 20,
    alignItems: "center",
  }
});

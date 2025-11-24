import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { theme } from "../../../../config/theme";
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
  
  // Calcular segundos transcurridos desde el inicio
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(
    Math.floor((Date.now() - new Date(estacionamiento.inicio).getTime()) / 1000)
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const inicio = new Date(estacionamiento.inicio).getTime();
      const transcurrido = Math.floor((ahora - inicio) / 1000);
      setSegundosTranscurridos(transcurrido);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [estacionamiento.inicio]);
  
  // Costo actual basado en el tiempo TRANSCURRIDO (proporcional)
  const costoActual = (segundosTranscurridos / 3600) * estacionamiento.tarifaHora;

  // Formatear tiempo transcurrido (HH:MM:SS)
  const formatearTiempo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleFinalizar = () => {
    const costoCalculadoLocal = (segundosTranscurridos / 3600) * estacionamiento.tarifaHora;
    
    console.log('=== DATOS ANTES DE FINALIZAR ===');
    console.log('Tiempo transcurrido (segundos):', segundosTranscurridos);
    console.log('Tiempo transcurrido (formato):', formatearTiempo(segundosTranscurridos));
    console.log('Tarifa por hora:', estacionamiento.tarifaHora);
    console.log('Costo calculado localmente:', costoCalculadoLocal.toFixed(2));
    console.log('================================');
    
    // NO descontamos aquí, el backend lo hace
    // Solo llamamos a finalizarEstacionamiento que actualiza todo desde el servidor
    finalizarEstacionamiento();
    
    // La navegación se hace después de que el backend responda
    navigation.navigate("Tabs");
  };

  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>ESTACIONAMIENTO ACTIVO</Text>

      {/* Tiempo transcurrido (contador hacia adelante) */}
      <TarjetaGradiente 
        style={styles.tarjetaControl} 
        colores={[theme.colors.primary, theme.colors.secondary]}
      >
        <Text style={styles.labelGradiente}>TIEMPO TRANSCURRIDO</Text>
        <Text style={styles.textoGrandeGradiente}>
          {formatearTiempo(segundosTranscurridos)}
        </Text>
      </TarjetaGradiente>

      {/* Información del vehículo */}
      <View style={styles.cajaPunteada}>
        <Ionicons name="car-sport-outline" size={24} color={theme.colors.dark} />
        <Text style={styles.textoVehiculo}>
          {estacionamiento.patente}
        </Text>
        <Text style={styles.textoUbicacion}>
          {estacionamiento.ubicacion}
        </Text>
      </View>

      {/* Costo actual */}
      <View style={styles.cajaPunteada}>
        <Text style={styles.labelCosto}>COSTO ACTUAL</Text>
        <Text style={styles.costoTexto}>${costoActual.toFixed(2)}</Text>
        <Text style={styles.tarifaTexto}>
          Tarifa: ${estacionamiento.tarifaHora}/hora
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.botones}>
        <BotonPrimSec
          titulo="EXTENDER"
          tipo="relleno"
          color={theme.colors.primary}
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
          color={theme.colors.danger}
          estilo={{
            paddingHorizontal: 30,
            minWidth: 120,
            marginTop: 20,
          }}
          onPress={handleFinalizar}
        />
      </View>

      <ModalExtender
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={(horas, minutos) => {
          setMostrarModal(false);
          console.log(`Extender estacionamiento: ${horas}h ${minutos}m`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  tarjetaControl: {
    marginVertical: 15,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  labelGradiente: {
    fontSize: 12,
    color: theme.colors.white,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 5,
  },
  textoGrandeGradiente: {
    fontSize: 42,
    color: theme.colors.white,
    fontWeight: "bold",
    textAlign: "center",
    fontVariant: ['tabular-nums'],
  },
  textoVehiculo: {
    fontSize: 20,
    marginTop: 8,
    color: theme.colors.dark,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  textoUbicacion: {
    fontSize: 14,
    marginTop: 5,
    color: theme.colors.gray,
  },
  botones: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
  labelCosto: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 5,
  },
  costoTexto: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  tarifaTexto: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 5,
  },
  cajaPunteada: {
    borderWidth: 2,
    borderColor: theme.colors.gray,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
  },
});
import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TextInput, Modal } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import InfoEstacionamiento from "../../componentes/InfoEstacionamiento";
import { theme } from "../../../../config/theme";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { RutasStackParamList } from "../../tipos/RutasStack";

export default function RegistrarVehiculo() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");

  const {
    saldo,
    patente,
    setPatente,
    iniciarEstacionamiento,
    configEstacionamiento,
  } = context;

  const { ubicacion, tarifaHora, limite } = configEstacionamiento;

  const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  const validarPatente = (texto: string) => {
    const regex = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
    return regex.test(texto);
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Necesitamos acceso a la cámara</Text>
        <BotonPrimSec
          titulo="Permitir cámara"
          tipo="relleno"
          color={theme.colors.primary}
          onPress={requestPermission}
        />
      </View>
    );
  }

  const handleIniciar = () => {
    if (!validarPatente(patente)) {
      alert("Patente inválida");
      return;
    }

    if (saldo < tarifaHora) {
      setMostrarModalRecarga(true);
      return;
    }

    iniciarEstacionamiento({
      patente,
      ubicacion,
      tarifaHora,
      limite,
    });

    navigation.navigate("EstacionamientoActivo");
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>REGISTRAR VEHÍCULO</Text>

      <View style={styles.contenedorCards}>
        <View style={styles.tarjetaCamara}>
          <CameraView style={styles.camera} facing="back" />
          <Text style={styles.textoCamara}>(Simulación de cámara - OCR pendiente)</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Patente detectada:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: ABC123"
            value={patente}
            onChangeText={setPatente}
          />
        </View>

        <InfoEstacionamiento
          ubicacion={ubicacion}
          tarifa={`$${tarifaHora} POR HORA`}
          limite={`${limite} HORAS`}
        />

        <BotonPrimSec
          titulo="Iniciar estacionamiento"
          tipo="relleno"
          redondeado="alto"
          color={theme.colors.primary}
          onPress={handleIniciar}
        />
      </View>

      <Modal visible={mostrarModalRecarga} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>No tienes saldo suficiente</Text>
            <Text style={styles.modalTexto}>Recarga para poder estacionar tu vehículo</Text>
            <BotonPrimSec
              titulo="Ir a recargar"
              tipo="relleno"
              color={theme.colors.primary}
              onPress={() => {
                setMostrarModalRecarga(false);
                navigation.navigate("MiSaldo" as never);
              }}
            />
            <BotonPrimSec
              titulo="Cancelar"
              tipo="relleno"
              color={theme.colors.dark}
              onPress={() => setMostrarModalRecarga(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
    marginBottom: 15,
  },
  contenedorCards: {
    flex: 1,
    width: "100%",
    marginTop: 20,
    justifyContent: "flex-start",
  },
  tarjetaCamara: {
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 25,
  },
  camera: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  textoCamara: {
    position: "absolute",
    bottom: 10,
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: theme.colors.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.dark,
    borderRadius: 10,
    borderStyle: "dashed",
    padding: 10,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.danger,
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
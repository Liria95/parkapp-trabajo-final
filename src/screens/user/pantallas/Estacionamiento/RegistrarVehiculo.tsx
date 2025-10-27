import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Modal, Alert } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

  // Valores por defecto si están vacíos
  const ubicacion = configEstacionamiento?.ubicacion || "AVENIDA SAN MARTIN 583, CIUDAD DE MENDOZA";
  const tarifaHora = configEstacionamiento?.tarifaHora || 100;
  const limite = configEstacionamiento?.limite || 2;

  const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  // Debug para ver qué está llegando
  useEffect(() => {
    console.log('===== REGISTRAR VEHÍCULO =====');
    console.log('Config Estacionamiento:', configEstacionamiento);
    console.log('Ubicación:', ubicacion);
    console.log('Tarifa:', tarifaHora);
    console.log('Límite:', limite);
    console.log('Saldo:', saldo);
    console.log('Patente:', patente);
    console.log('================================');
  }, [configEstacionamiento, ubicacion, tarifaHora, limite, saldo, patente]);

  const validarPatente = (texto: string) => {
    const regex = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
    return regex.test(texto.toUpperCase());
  };

  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.textoPermiso}>Necesitamos acceso a la cámara</Text>
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

    // Validaciones
    if (!patente || patente.trim() === "") {
      Alert.alert("Error", "Por favor ingresa una patente");
      return;
    }

    if (!validarPatente(patente)) {
      Alert.alert("Patente inválida", "Formato: ABC123 o AB123CD");
      return;
    }

    if (saldo < tarifaHora) {
      setMostrarModalRecarga(true);
      return;
    }

    // Iniciar estacionamiento
    console.log('Iniciando estacionamiento con:', {
      patente,
      ubicacion,
      tarifaHora,
      limite,
    });

    iniciarEstacionamiento({
      patente: patente.toUpperCase(),
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
        {/* Cámara */}
        <View style={styles.tarjetaCamara}>
          <CameraView style={styles.camera} facing="back" />
          <Text style={styles.textoCamara}>(Simulación de cámara - OCR pendiente)</Text>
        </View>

        {/* Input de patente */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Patente detectada:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: ABC123"
            value={patente}
            onChangeText={(text) => setPatente(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={7}
          />
        </View>

        {/* Info del estacionamiento */}
        <InfoEstacionamiento
          ubicacion={ubicacion}
          tarifa={`$${tarifaHora} POR HORA`}
          limite={`${limite} HORAS`}
        />

        {/* Botón iniciar */}
        <BotonPrimSec
          titulo="Iniciar estacionamiento"
          tipo="relleno"
          redondeado="alto"
          color={theme.colors.primary}
          onPress={handleIniciar}
        />
      </View>

      {/* Modal de recarga */}
      <Modal visible={mostrarModalRecarga} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>💰 Saldo insuficiente</Text>
            <Text style={styles.modalTexto}>
              Tu saldo actual: ${saldo.toFixed(2)}{'\n'}
              Necesitas: ${tarifaHora} por hora{'\n\n'}
              Recarga para poder estacionar tu vehículo
            </Text>
            <BotonPrimSec
              titulo="Ir a recargar"
              tipo="relleno"
              color={theme.colors.primary}
              onPress={() => {
                setMostrarModalRecarga(false);
                navigation.navigate("Tabs");
              }}
            />
            <BotonPrimSec
              titulo="Cancelar"
              tipo="relleno"
              color={theme.colors.gray}
              onPress={() => setMostrarModalRecarga(false)}
              estilo={{ marginTop: 10 }}
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
    overflow: 'hidden',
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  textoCamara: {
    position: "absolute",
    bottom: 10,
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    borderWidth: 2,
    borderColor: theme.colors.gray,
    borderRadius: 10,
    borderStyle: "dashed",
    padding: 12,
    fontSize: 18,
    fontWeight: "bold",
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
    lineHeight: 20,
    color: theme.colors.dark,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  textoPermiso: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: theme.colors.dark,
  },
});
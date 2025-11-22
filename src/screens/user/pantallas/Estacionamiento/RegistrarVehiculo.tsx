import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Modal, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BotonPrimSec from "../../componentes/Boton";
import InfoEstacionamiento from "../../componentes/InfoEstacionamiento";
import { theme } from "../../../../config/theme";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { AuthContext } from "../../../../components/shared/Context/AuthContext/AuthContext";
import { RutasStackParamList } from "../../tipos/RutasStack";
import { ParkingSpacesService } from "../../../../services/ParkingSpacesService";
import type { EspacioDisponible } from "../../../../services/ParkingSpacesService";

export default function RegistrarVehiculo() {
  const usuarioContext = useContext(UsuarioContext);
  const authContext = useContext(AuthContext);
  
  if (!usuarioContext) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");
  if (!authContext) throw new Error("AuthContext debe estar dentro del AuthProvider");

  const {
    saldo,
    patente,
    setPatente,
    iniciarEstacionamiento,
    configEstacionamiento,
  } = usuarioContext;

  const { state } = authContext;

  const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);
  const [mostrarModalEspacios, setMostrarModalEspacios] = useState(false);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState<EspacioDisponible[]>([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<EspacioDisponible | null>(null);
  const [loadingEspacios, setLoadingEspacios] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  const ubicacion = espacioSeleccionado?.ubicacion || configEstacionamiento?.ubicacion || "Selecciona un espacio";
  const tarifaHora = espacioSeleccionado?.tarifaPorHora || configEstacionamiento?.tarifaHora || 100;
  const limite = configEstacionamiento?.limite || 2;

  useEffect(() => {
    console.log('===== REGISTRAR VEHICULO =====');
    console.log('User ID:', state.user?.id);
    console.log('Espacio seleccionado:', espacioSeleccionado?.numero);
    console.log('Ubicacion:', ubicacion);
    console.log('Tarifa:', tarifaHora);
    console.log('Saldo:', saldo);
    console.log('================================');
  }, [state, espacioSeleccionado, ubicacion, tarifaHora, saldo]);

  // Cargar espacios al montar el componente
  useEffect(() => {
    obtenerUbicacionYCargarEspacios();
  }, []);

  const obtenerUbicacionYCargarEspacios = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Permiso de ubicacion denegado - Cargando espacios sin filtro GPS');
        cargarEspaciosDisponibles();
        return;
      }

      console.log('Obteniendo ubicacion del usuario...');
      const location = await Location.getCurrentPositionAsync({});
      console.log('Ubicacion obtenida:', location.coords);
      
      setUbicacionUsuario({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Cargar espacios con la ubicación
      cargarEspaciosDisponibles({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
    } catch (error) {
      console.error('Error al obtener ubicacion:', error);
      // Si falla GPS, cargar espacios sin filtro
      cargarEspaciosDisponibles();
    }
  };

  const cargarEspaciosDisponibles = async (location?: { latitude: number; longitude: number }) => {
    try {
      setLoadingEspacios(true);
      const token = state.token;

      if (!token) {
        console.log('No hay token disponible');
        Alert.alert('Error', 'No hay sesion activa');
        return;
      }

      console.log('========================================');
      console.log('CARGANDO ESPACIOS DISPONIBLES');
      console.log('Token presente:', !!token);
      console.log('Ubicacion:', location || 'Sin ubicacion');
      console.log('========================================');
      
      // Llamar al servicio con ubicación si está disponible
      const response = await ParkingSpacesService.getAvailableSpacesForUser(
        token,
        location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 1000 // CAMBIADO A 1000km
        } : undefined
      );

      console.log('========================================');
      console.log('RESPUESTA DEL SERVICIO:');
      console.log('Success:', response.success);
      console.log('Total espacios:', response.total);
      console.log('Espacios array length:', response.espacios?.length);
      console.log('Primer espacio:', response.espacios?.[0]);
      console.log('========================================');

      if (response.success && response.espacios) {
        console.log('✅ Espacios cargados correctamente:', response.espacios.length);
        setEspaciosDisponibles(response.espacios);
      } else {
        console.log('❌ Error al cargar espacios:', response.message);
        Alert.alert('Error', response.message || 'No se pudieron cargar espacios');
        setEspaciosDisponibles([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar espacios:', error);
      Alert.alert('Error', 'Error al cargar espacios');
      setEspaciosDisponibles([]);
    } finally {
      setLoadingEspacios(false);
    }
  };

  const validarPatente = (texto: string) => {
    const regex = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
    return regex.test(texto.toUpperCase());
  };

  const handleSeleccionarEspacio = (espacio: EspacioDisponible) => {
    console.log('✅ Espacio seleccionado:', espacio.numero, espacio.ubicacion);
    setEspacioSeleccionado(espacio);
    setMostrarModalEspacios(false);
  };

  const handleAbrirModal = () => {
    console.log('========================================');
    console.log('ABRIENDO MODAL DE ESPACIOS');
    console.log('Espacios disponibles:', espaciosDisponibles.length);
    console.log('Primer espacio:', espaciosDisponibles[0]);
    console.log('Loading:', loadingEspacios);
    console.log('========================================');
    setMostrarModalEspacios(true);
  };

  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.textoPermiso}>Necesitamos acceso a la camara</Text>
        <BotonPrimSec
          titulo="Permitir camara"
          tipo="relleno"
          color={theme.colors.primary}
          onPress={requestPermission}
        />
      </View>
    );
  }

  const handleIniciar = async () => {
    if (!patente || patente.trim() === "") {
      Alert.alert("Error", "Por favor ingresa una patente");
      return;
    }

    if (!validarPatente(patente)) {
      Alert.alert("Patente invalida", "Formato: ABC123 o AB123CD");
      return;
    }

    if (!espacioSeleccionado) {
      Alert.alert("Error", "Por favor selecciona un espacio de estacionamiento");
      return;
    }

    if (saldo < tarifaHora) {
      setMostrarModalRecarga(true);
      return;
    }

    const userId = state.user?.id;

    if (!userId) {
      Alert.alert("Error", "No se pudo obtener el ID del usuario");
      console.error("User ID no disponible");
      return;
    }

    await iniciarEstacionamiento(
      {
        patente: patente.toUpperCase(),
        ubicacion: espacioSeleccionado.ubicacion,
        tarifaHora: espacioSeleccionado.tarifaPorHora,
        limite,
      },
      userId,
      espacioSeleccionado.id
    );

    navigation.navigate("EstacionamientoActivo");
  };

  // DEBUG: Renderizar contenido del modal
  const renderModalContent = () => {
    console.log('========================================');
    console.log('RENDERIZANDO CONTENIDO DEL MODAL');
    console.log('Loading:', loadingEspacios);
    console.log('Espacios length:', espaciosDisponibles.length);
    console.log('========================================');

    if (loadingEspacios) {
      console.log('→ Mostrando LOADING');
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando espacios...</Text>
        </View>
      );
    }

    if (espaciosDisponibles.length === 0) {
      console.log('→ Mostrando EMPTY');
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={64} color={theme.colors.gray} />
          <Text style={styles.emptyText}>No hay espacios disponibles cerca</Text>
          <TouchableOpacity 
            style={styles.recargarButton}
            onPress={() => cargarEspaciosDisponibles(ubicacionUsuario || undefined)}
          >
            <Text style={styles.recargarText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    console.log('→ Mostrando LISTA de', espaciosDisponibles.length, 'espacios');
    return (
      <ScrollView 
        style={styles.listaEspacios}
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={true}
      >
        {espaciosDisponibles.map((espacio, index) => {
          console.log(`  Renderizando espacio ${index}:`, espacio.numero);
          return (
            <TouchableOpacity
              key={espacio.id}
              style={[
                styles.espacioItem,
                espacioSeleccionado?.id === espacio.id && styles.espacioSeleccionado
              ]}
              onPress={() => handleSeleccionarEspacio(espacio)}
            >
              <View style={styles.espacioInfo}>
                <Text style={styles.espacioNumero}>{espacio.numero}</Text>
                <Text style={styles.espacioUbicacion} numberOfLines={1}>
                  {espacio.ubicacion}
                </Text>
                <View style={styles.espacioFooter}>
                  <Text style={styles.espacioTarifa}>${espacio.tarifaPorHora}/hora</Text>
                  {espacio.distancia !== undefined && (
                    <Text style={styles.espacioDistancia}>
                      {espacio.distancia < 1 
                        ? `${(espacio.distancia * 1000).toFixed(0)}m` 
                        : `${espacio.distancia.toFixed(1)}km`}
                    </Text>
                  )}
                </View>
              </View>
              {espacioSeleccionado?.id === espacio.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>REGISTRAR VEHICULO</Text>

      <ScrollView style={styles.contenedorCards} showsVerticalScrollIndicator={false}>
        <View style={styles.tarjetaCamara}>
          <CameraView style={styles.camera} facing="back" />
          <Text style={styles.textoCamara}>(Simulacion de camara - OCR pendiente)</Text>
        </View>

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

        <TouchableOpacity 
          style={styles.selectorEspacio}
          onPress={handleAbrirModal}
        >
          <View style={styles.selectorContenido}>
            <View style={{flex: 1}}>
              <Text style={styles.selectorLabel}>Espacio seleccionado:</Text>
              <Text style={styles.selectorValor} numberOfLines={2}>
                {espacioSeleccionado ? `${espacioSeleccionado.numero} - ${espacioSeleccionado.ubicacion}` : 'Toca aqui para seleccionar'}
              </Text>
              <Text style={{fontSize: 10, color: theme.colors.gray, marginTop: 4}}>
                ({espaciosDisponibles.length} espacios disponibles)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>

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
      </ScrollView>

      {/* Modal de seleccion de espacios */}
      <Modal 
        visible={mostrarModalEspacios} 
        transparent 
        animationType="slide"
        onRequestClose={() => setMostrarModalEspacios(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalEspacios}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTituloEspacios}>
                  Espacios Disponibles ({espaciosDisponibles.length})
                </Text>
                {ubicacionUsuario && (
                  <Text style={styles.subtituloModal}>
                    Ordenados por cercania
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => {
                console.log('Cerrando modal');
                setMostrarModalEspacios(false);
              }}>
                <Ionicons name="close" size={28} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>

            {renderModalContent()}
          </View>
        </View>
      </Modal>

      {/* Modal de saldo insuficiente */}
      <Modal visible={mostrarModalRecarga} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Saldo insuficiente</Text>
            <Text style={styles.modalTexto}>
              Tu saldo actual: ${saldo.toFixed(2)}{'\n'}
              Necesitas: ${tarifaHora} por hora{'\n\n'}
              Recarga para poder estacionar tu vehiculo
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
  },
  tarjetaCamara: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 25,
    overflow: 'hidden',
    backgroundColor: '#000',
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
  selectorEspacio: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: theme.colors.white,
  },
  selectorContenido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 5,
  },
  selectorValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.dark,
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
  modalEspacios: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    width: "90%",
    height: "70%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTituloEspacios: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  subtituloModal: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 4,
  },
  listaEspacios: {
    flex: 1,
  },
  espacioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  espacioSeleccionado: {
    borderColor: theme.colors.success,
    backgroundColor: '#E8F5E9',
  },
  espacioInfo: {
    flex: 1,
    paddingRight: 10,
  },
  espacioNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: 4,
  },
  espacioUbicacion: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 6,
  },
  espacioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  espacioTarifa: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  espacioDistancia: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  recargarButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  recargarText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
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
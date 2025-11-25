import { useContext, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import { theme } from "../../../../config/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { AuthContext } from "../../../../components/shared/Context/AuthContext/AuthContext";
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { ParkingSpacesService } from '../../../../services/ParkingSpacesService';

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface ParkingSpace {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
  latitude: number;
  longitude: number;
  status: string;
  distancia?: number;
}

export default function Mapa() {
  const context = useContext(UsuarioContext);
  const authContext = useContext(AuthContext);

  if (!context) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");

  const {
    saldo,
    estacionamiento,
    actualizarSaldoEstacionamiento,
    setParkingLocationAddress,
  } = context;

  const mapRef = useRef<MapView>(null);

  // Campo Grande, Misiones, Argentina - ubicacion por defecto
  const [region, setRegion] = useState<LocationType>({
    latitude: -27.4331,
    longitude: -55.5384,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [currentAddress, setCurrentAddress] = useState("Obteniendo direccion...");
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Traduce coordenadas a direccion
  const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const addressArray = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (addressArray.length > 0) {
        const addr = addressArray[0];
        const formattedAddress = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}, ${addr.country || ''}`.trim();
        setCurrentAddress(formattedAddress);

        if (setParkingLocationAddress) {
          setParkingLocationAddress(formattedAddress);
        }
      } else {
        setCurrentAddress("Direccion no encontrada.");
      }
    } catch (error) {
      console.error("Error al obtener la direccion:", error);
      setCurrentAddress("Error de servicio de Geocodificacion.");
    }
  };

  // Obtener ubicacion del usuario
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permiso de ubicacion denegado. Usando ubicacion por defecto.');
        Alert.alert(
          'Ubicacion',
          'Para ver espacios cercanos, permite el acceso a la ubicacion.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setUserLocation(newRegion);
      setRegion(newRegion);

      // Centrar mapa en ubicacion del usuario
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      fetchAddressFromCoords(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Error al obtener la ubicacion:", error);
      Alert.alert('Error', 'No se pudo obtener tu ubicacion');
    }
  };

  // Cargar espacios de estacionamiento
  const cargarEspacios = async (isRefresh: boolean = false) => {
    const token = authContext?.state.token;

    if (!token) {
      console.log('No hay token disponible');
      setLoading(false);
      return;
    }

    try {
      if (!isRefresh) {
        setLoading(true);
      }

      console.log('Cargando espacios de estacionamiento...');

      // Obtener espacios con filtro de ubicacion si esta disponible
      const locationFilter = userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: 5000, // 5km de radio
      } : undefined;

      const result = await ParkingSpacesService.getAvailableSpaces(
        token,
        locationFilter
      );

      if (result.success && result.espacios) {
        console.log(`${result.espacios.length} espacios cargados`);
        setParkingSpaces(result.espacios as ParkingSpace[]);
      } else {
        console.log('Error al cargar espacios:', result.message);
      }
    } catch (error) {
      console.error('Error al cargar espacios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar ubicacion y espacios al iniciar
  useEffect(() => {
    const init = async () => {
      await fetchLocation();
      await cargarEspacios();
    };
    init();
  }, []);

  // Obtener color del marcador segun estado
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.success; // Verde
      case 'occupied':
        return theme.colors.danger; // Rojo
      case 'maintenance':
        return theme.colors.warning; // Amarillo
      case 'reserved':
        return theme.colors.primary; // Azul
      default:
        return theme.colors.gray;
    }
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'LIBRE';
      case 'occupied':
        return 'OCUPADO';
      case 'maintenance':
        return 'MANTENIMIENTO';
      case 'reserved':
        return 'RESERVADO';
      default:
        return 'DESCONOCIDO';
    }
  };

  // Calcular saldo restante
  let saldoRestante = saldo;
  if (estacionamiento?.activo) {
    const tiempoTranscurrido = Math.floor(
      (Date.now() - new Date(estacionamiento.inicio).getTime()) / 1000
    );
    const costoActual = (tiempoTranscurrido / 3600) * estacionamiento.tarifaHora;
    saldoRestante = Math.max(saldo - costoActual, 0);
  }

  // Manejar seleccion de espacio
  const handleSpaceSelect = (space: ParkingSpace) => {
    Alert.alert(
      `Espacio ${space.numero}`,
      `Ubicacion: ${space.ubicacion}\nEstado: ${getStatusText(space.status)}\nTarifa: $${space.tarifaPorHora}/hora${space.distancia ? `\nDistancia: ${(space.distancia).toFixed(0)}m` : ''}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        space.status === 'available' ? {
          text: 'Estacionar aqui',
          onPress: () => console.log('Iniciar estacionamiento:', space.id)
        } : undefined
      ].filter(Boolean) as any
    );
  };

  // Centrar mapa en mi ubicacion
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
    }
  };

  // Refrescar espacios
  const handleRefresh = () => {
    setRefreshing(true);
    cargarEspacios(true);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>MAPA DE ESTACIONAMIENTO</Text>

      <View style={styles.contenedorCards}>
        <TarjetaGradiente colores={[theme.colors.secondary, theme.colors.success]}>
          <View style={styles.cardSaldo}>
            <Text style={styles.textoSaldo}>SALDO DISPONIBLE:</Text>
            <Text style={styles.saldoActual}>${saldoRestante.toFixed(2)}</Text>

            {estacionamiento?.activo && (
              <TouchableOpacity
                style={styles.botonActualizar}
                onPress={actualizarSaldoEstacionamiento}
              >
                <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.textoActualizar}>Actualizar saldo</Text>
              </TouchableOpacity>
            )}
          </View>
        </TarjetaGradiente>

        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.success]}
          style={styles.contCardMapa}
        >
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.white} />
              <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={styles.mapa}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                toolbarEnabled={false}
              >
                {userLocation && (
                  <Marker
                    coordinate={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                    }}
                    title="Estas Aqui"
                    description="Tu ubicacion actual"
                  >
                    <View style={styles.userMarker}>
                      <Ionicons name="person" size={20} color={theme.colors.white} />
                    </View>
                  </Marker>
                )}

                {parkingSpaces.map((space) => (
                  <Marker
                    key={space.id}
                    coordinate={{
                      latitude: space.latitude,
                      longitude: space.longitude,
                    }}
                    onPress={() => handleSpaceSelect(space)}
                  >
                    <View
                      style={[
                        styles.parkingMarker,
                        { backgroundColor: getMarkerColor(space.status) },
                      ]}
                    >
                      <Text style={styles.markerText}>{space.numero}</Text>
                    </View>
                    <Callout>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>{space.numero}</Text>
                        <Text style={styles.calloutText}>{getStatusText(space.status)}</Text>
                        <Text style={styles.calloutText}>${space.tarifaPorHora}/h</Text>
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>

              <View style={styles.floatingButtons}>
                <TouchableOpacity
                  style={styles.floatingButton}
                  onPress={centerOnUser}
                >
                  <Ionicons name="locate" size={24} color={theme.colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.floatingButton}
                  onPress={handleRefresh}
                  disabled={refreshing}
                >
                  <Ionicons
                    name="refresh"
                    size={24}
                    color={theme.colors.white}
                    style={refreshing ? { opacity: 0.5 } : {}}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.textoTarjetaTitulo}>
              {parkingSpaces.length} espacios disponibles
            </Text>
            <Text style={styles.textoMapaSimulado}>{currentAddress}</Text>
          </View>
        </LinearGradient>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.legendText}>Libre</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.danger }]} />
            <Text style={styles.legendText}>Ocupado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
            <Text style={styles.legendText}>Mantenimiento</Text>
          </View>
        </View>

        <BotonPrimSec
          titulo="Actualizar espacios"
          tipo="borde"
          redondeado="bajo"
          color={theme.colors.dark}
          onPress={handleRefresh}
        />
      </View>
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
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 15,
  },
  contenedorCards: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: 20,
    justifyContent: "space-between",
  },
  contCardMapa: {
    height: "55%",
    alignItems: "center",
    borderRadius: 15,
    overflow: 'hidden',
  },
  mapa: {
    width: "100%",
    height: "75%",
  },
  loadingContainer: {
    width: "100%",
    height: "75%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.white,
    marginTop: 10,
  },
  infoContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  textoTarjetaTitulo: {
    fontSize: 17,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  textoMapaSimulado: {
    fontSize: 13,
    color: theme.colors.white,
    paddingHorizontal: 15,
    paddingTop: 5,
    textAlign: 'center',
  },
  cardSaldo: {
    padding: 15,
    margin: 10,
    alignItems: "center",
  },
  textoSaldo: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.white,
  },
  saldoActual: {
    marginTop: 10,
    fontWeight: "900",
    fontSize: 30,
    color: theme.colors.white,
  },
  botonActualizar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textoActualizar: {
    marginLeft: 5,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  parkingMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  callout: {
    padding: 10,
    minWidth: 120,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  floatingButtons: {
    position: 'absolute',
    right: 10,
    top: 10,
    gap: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.dark,
  },
});
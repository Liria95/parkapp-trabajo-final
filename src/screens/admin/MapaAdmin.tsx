import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';
import { API_CONFIG } from '../../config/api.config';



interface Espacio {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
  latitude: number;
  longitude: number;
  status: 'available' | 'occupied' | 'maintenance';
}

interface MapaAdminProps {
  onSpaceSelect?: (espacio: Espacio) => void;
  showUserLocation?: boolean;
}

export default function MapaAdmin({ 
  onSpaceSelect, 
  showUserLocation = false 
}: MapaAdminProps) {
  const authContext = useContext(AuthContext);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    inicializarMapa();
  }, []);

  const inicializarMapa = async () => {
    setLoading(true);
    setLoadingLocation(true);
    
    // SIEMPRE obtener ubicación del dispositivo primero
    const ubicacionObtenida = await obtenerUbicacion();
    
    if (ubicacionObtenida) {
      // Luego cargar espacios
      await cargarEspacios();
    }
    
    setLoading(false);
  };

  const obtenerUbicacion = async (): Promise<boolean> => {
    try {
      console.log('🔍 Solicitando permisos de ubicación...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('❌ Permiso de ubicación denegado');
        Alert.alert(
          'Permiso requerido',
          'Se necesita acceso a la ubicación para mostrar el mapa correctamente'
        );
        setLoadingLocation(false);
        setLoading(false);
        return false;
      }

      console.log('📍 Obteniendo ubicación del dispositivo...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('✅ Ubicación obtenida:', userCoords);
      
      setUserLocation(userCoords);
      
      // SIEMPRE centrar mapa en ubicación del dispositivo
      const newRegion = {
        ...userCoords,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      
      setRegion(newRegion);
      setLoadingLocation(false);
      
      console.log('✅ Región del mapa establecida:', newRegion);
      return true;
      
    } catch (error) {
      console.error('❌ Error al obtener ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación del dispositivo');
      setLoadingLocation(false);
      setLoading(false);
      return false;
    }
  };

  const cargarEspacios = async () => {
    const token = authContext?.state.token;
    
    if (!token) {
      console.log('❌ No hay token disponible');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Cargando espacios para mapa admin...');

      const backendUrl = API_CONFIG.BASE_URL;; 
      const url = `${backendUrl}/api/parking-spaces/available`;

      console.log('📡 URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Data recibida:', JSON.stringify(data, null, 2));

      if (data.success && data.espacios && data.espacios.length > 0) {
        console.log('✅ Espacios cargados:', data.espacios.length);
        console.log('📍 Primer espacio:', data.espacios[0]);
        setEspacios(data.espacios);
        
        // NO centrar en espacios, mantener la ubicación del dispositivo
        console.log('Espacios listos, mapa mantiene ubicación del dispositivo');
      } else {
        console.log('⚠️ No se encontraron espacios en la respuesta');
        console.log('Data completa:', data);
        setEspacios([]);
      }
    } catch (error: any) {
      console.error('❌ ERROR al cargar espacios:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      Alert.alert(
        'Error al cargar espacios',
        `${error.message}\n\nVerifica:\n1. La IP del backend\n2. Que el servidor esté corriendo\n3. Tu conexión a la red`,
        [
          { text: 'Reintentar', onPress: () => cargarEspacios() },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cargarEspacios();
    if (showUserLocation) {
      obtenerUbicacion();
    }
  };

  const handleMarkerPress = (espacio: Espacio) => {
    if (onSpaceSelect) {
      onSpaceSelect(espacio);
    } else {
      Alert.alert(
        `Espacio ${espacio.numero}`,
        `Ubicación: ${espacio.ubicacion}\n` +
        `Tarifa: $${espacio.tarifaPorHora}/hora\n` +
        `Estado: ${
          espacio.status === 'available' 
            ? 'Disponible' 
            : espacio.status === 'occupied' 
            ? 'Ocupado' 
            : 'Mantenimiento'
        }`
      );
    }
  };

  const centrarEnUbicacion = async () => {
    if (userLocation) {
      setRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } else {
      // Si no hay ubicación guardada, obtenerla de nuevo
      await obtenerUbicacion();
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50'; // Verde
      case 'occupied':
        return '#F44336'; // Rojo
      case 'maintenance':
        return '#FFC107'; // Amarillo
      default:
        return '#9E9E9E'; // Gris
    }
  };

  if (loading || loadingLocation || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {loadingLocation ? 'Obteniendo tu ubicación...' : 'Cargando espacios...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {espacios.map((espacio) => (
          <Marker
            key={espacio.id}
            coordinate={{
              latitude: espacio.latitude,
              longitude: espacio.longitude,
            }}
            onPress={() => handleMarkerPress(espacio)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: getMarkerColor(espacio.status) }]}>
                <Text style={styles.markerText}>{espacio.numero}</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Botón para refrescar */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>

      {/* Botón para centrar en ubicación */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={centrarEnUbicacion}
      >
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Libre</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Ocupado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Mantenimiento</Text>
        </View>
      </View>

      {/* Contador de espacios */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {espacios.length} espacios totales
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.gray,
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  locationButton: {
    position: 'absolute',
    bottom: 150,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  legend: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.dark,
    fontWeight: '500',
  },
  counter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
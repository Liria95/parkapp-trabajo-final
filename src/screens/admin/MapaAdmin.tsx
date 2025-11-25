import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';

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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: -27.4326,
    longitude: -55.5375,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    obtenerUbicacion();
    cargarEspacios();
  }, []);

  const obtenerUbicacion = async () => {
    if (!showUserLocation) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);
      setRegion({
        ...userCoords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  };

  const cargarEspacios = async () => {
    const token = authContext?.state.token;
    
    if (!token) {
      console.log('No hay token disponible');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Cargando espacios para mapa admin...');

      // Obtener todos los espacios sin filtro de ubicación
      const backendUrl = 'http://192.168.1.6:3000'; // Ajusta tu URL
      const url = `${backendUrl}/api/parking-spaces/available`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.espacios) {
        console.log('Espacios cargados:', data.espacios.length);
        setEspacios(data.espacios);
      } else {
        console.log('No se encontraron espacios');
        setEspacios([]);
      }
    } catch (error) {
      console.error('Error al cargar espacios:', error);
      Alert.alert('Error', 'No se pudieron cargar los espacios');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cargarEspacios();
  };

  const handleMarkerPress = (espacio: Espacio) => {
    if (onSpaceSelect) {
      onSpaceSelect(espacio);
    } else {
      Alert.alert(
        `Espacio ${espacio.numero}`,
        `Ubicación: ${espacio.ubicacion}\n` +
        `Tarifa: $${espacio.tarifaPorHora}/hora\n` +
        `Estado: ${espacio.status === 'available' ? 'Disponible' : 'Ocupado'}`
      );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
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
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
      >
        {espacios.map((espacio) => (
          <Marker
            key={espacio.id}
            coordinate={{
              latitude: espacio.latitude,
              longitude: espacio.longitude,
            }}
            onPress={() => handleMarkerPress(espacio)}
            pinColor={getMarkerColor(espacio.status)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: getMarkerColor(espacio.status) }]}>
                <Ionicons
                  name={espacio.status === 'available' ? 'checkmark' : 'close'}
                  size={16}
                  color="white"
                />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Disponible</Text>
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
});
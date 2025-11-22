import React, { useState, useContext, useEffect } from 'react';
import { Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';

// Componentes reutilizables
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../forms/SearchBar';
import FilterButtons from '../../forms/FilterButtons';
import ResponsiveGrid from '../../components/grids/ResponsiveGrid';
import StatsGrid from '../../components/dashboard/StatsGrid';
import EspacioCard from '../../components/cards/EspacioCard';
import AppModal from '../../components/common/AppModal';
import { Container } from '../../components/shared/StyledComponents';

// Servicios
import { ParkingSpacesService } from '../../services/ParkingSpacesService';
import { AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';

// Theme
import { theme } from '../../config/theme';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

const ModalSection = styled.View`
  margin-bottom: ${getDynamicSpacing(20)}px;
`;

const ModalSectionTitle = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  margin-bottom: ${getDynamicSpacing(10)}px;
`;

const ModalText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  color: ${theme.colors.gray};
  margin-bottom: ${getDynamicSpacing(5)}px;
  line-height: ${getResponsiveSize(20)}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${getDynamicSpacing(40)}px;
`;

const LoadingText = styled.Text`
  margin-top: ${getDynamicSpacing(10)}px;
  color: ${theme.colors.gray};
  font-size: ${getResponsiveSize(14)}px;
`;

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Espacios: undefined;
  GestionUsuarios: undefined;
  Infracciones: undefined;
  RegistroManual: undefined;
};

type EspaciosScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Espacios'>;

interface Espacio {
  id: string;
  numero: string;
  ubicacion: string;
  estado: 'libre' | 'ocupado' | 'mantenimiento' | 'reservado';
  tarifaPorHora: number;
  vehiculoActual?: {
    patente: string;
    horaInicio: string;
    tiempoRestante: string;
  };
  sensor: {
    estado: 'activo' | 'inactivo' | 'error';
    ultimaActualizacion: string;
  };
}

const EspaciosScreen: React.FC = () => {
  const navigation = useNavigation<EspaciosScreenNavigationProp>();
  const authContext = useContext(AuthContext);
  
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Espacio | null>(null);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ✅ Auto-refresh cada 5 segundos
  useEffect(() => {
    console.log('🔄 Iniciando auto-refresh cada 5 segundos...');
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refrescando espacios...');
      cargarEspacios(true); // true = es auto-refresh
    }, 5000); // 5 segundos

    return () => {
      console.log('🛑 Deteniendo auto-refresh');
      clearInterval(interval);
    };
  }, []);

  // ✅ Cargar al entrar a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      console.log('👁️ Pantalla enfocada - Cargando espacios');
      cargarEspacios();
    }, [])
  );

  // Función para mapear estados del backend al frontend
  const mapearEstado = (estado: string): 'libre' | 'ocupado' | 'mantenimiento' | 'reservado' => {
    switch (estado) {
      case 'available':
        return 'libre';
      case 'occupied':
        return 'ocupado';
      case 'maintenance':
      case 'mantenimiento':
        return 'mantenimiento';
      case 'reserved':
      case 'reservado':
        return 'reservado';
      default:
        return 'libre';
    }
  };

  // ✅ Función de carga mejorada
  const cargarEspacios = async (isAutoRefresh: boolean = false) => {
    const token = authContext?.state.token;

    if (!token) {
      if (!isAutoRefresh) {
        Alert.alert('Error', 'No hay token de autenticación');
      }
      setLoading(false);
      return;
    }

    try {
      // Solo mostrar loading en la primera carga (no en auto-refresh)
      if (!isAutoRefresh && espacios.length === 0 && !refreshing) {
        setLoading(true);
      }
      
      if (!isAutoRefresh) {
        console.log('📍 Cargando espacios de estacionamiento...');
      }

      const result = await ParkingSpacesService.getAllSpaces(token);

      if (result.success && result.spaces) {
        if (!isAutoRefresh) {
          console.log('✅ Espacios cargados:', result.spaces.length);
        }

        // Transformar datos del backend al formato del frontend
        const espaciosFormateados = result.spaces.map(space => ({
          id: space.id,
          numero: space.spaceCode,
          ubicacion: space.streetAddress,
          estado: mapearEstado(space.status),
          tarifaPorHora: space.feePerHour,
          sensor: {
            estado: 'activo' as const,
            ultimaActualizacion: 'Ahora'
          }
        }));

        setEspacios(espaciosFormateados);
        setLastUpdate(new Date());
      } else {
        if (!isAutoRefresh) {
          console.log('❌ Error al cargar espacios:', result.message);
          Alert.alert('Error', result.message || 'No se pudieron cargar los espacios');
        }
      }
    } catch (error) {
      if (!isAutoRefresh) {
        console.error('❌ Error al cargar espacios:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar los espacios');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Función para formatear tiempo transcurrido
  const getTimeSinceUpdate = (): string => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 10) return 'Ahora';
    if (diffSeconds < 60) return `Hace ${diffSeconds}s`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    return `Hace ${diffMinutes}m`;
  };

  // Estadísticas calculadas
  const stats = {
    total: espacios.length,
    libre: espacios.filter(e => e.estado === 'libre').length,
    ocupado: espacios.filter(e => e.estado === 'ocupado').length,
    mantenimiento: espacios.filter(e => e.estado === 'mantenimiento').length,
  };

  // Configuración de estadísticas
  const statsConfig = [
    {
      id: 'libre',
      number: stats.libre,
      label: 'Libres',
      backgroundColor: theme.colors.success,
    },
    {
      id: 'ocupado',
      number: stats.ocupado,
      label: 'Ocupados',
      backgroundColor: theme.colors.danger,
    },
    {
      id: 'mantenimiento',
      number: stats.mantenimiento,
      label: 'Mantenimiento',
      backgroundColor: theme.colors.warning,
    },
    {
      id: 'total',
      number: stats.total,
      label: 'Total',
      backgroundColor: theme.colors.primary,
    },
  ];

  // Configuración de filtros
  const filtros = [
    { id: 'todos', label: 'Todos' },
    { id: 'libre', label: 'Libre' },
    { id: 'ocupado', label: 'Ocupado' },
    { id: 'mantenimiento', label: 'Mantenimiento' },
    { id: 'reservado', label: 'Reservado' },
  ];

  // Filtrar espacios
  const espaciosFiltrados = espacios.filter(espacio => {
    const matchEstado = filtroEstado === 'todos' || espacio.estado === filtroEstado;
    const matchBusqueda = searchQuery === '' || 
      espacio.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      espacio.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (espacio.vehiculoActual?.patente || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchEstado && matchBusqueda;
  });

  const handleVerDetalle = (espacio: Espacio) => {
    setEspacioSeleccionado(espacio);
    setShowModal(true);
  };

  const handleGestionarEspacio = (espacio: Espacio) => {
    let opciones = ['Cancelar'];
    
    if (espacio.estado === 'ocupado') {
      opciones = ['Cancelar', 'Finalizar Estacionamiento', 'Crear Infracción', 'Ver Detalles'];
    } else if (espacio.estado === 'libre') {
      opciones = ['Cancelar', 'Registro Manual', 'Poner en Mantenimiento', 'Reservar', 'Ver Detalles'];
    } else if (espacio.estado === 'mantenimiento') {
      opciones = ['Cancelar', 'Activar Espacio', 'Ver Detalles'];
    }

    Alert.alert(
      `Espacio ${espacio.numero}`,
      `Ubicación: ${espacio.ubicacion}\nEstado: ${espacio.estado.toUpperCase()}`,
      opciones.map(opcion => ({
        text: opcion,
        style: opcion === 'Cancelar' ? 'cancel' : 'default',
        onPress: () => {
          if (opcion !== 'Cancelar') {
            if (opcion === 'Ver Detalles') {
              handleVerDetalle(espacio);
            } else if (opcion === 'Registro Manual') {
              navigation.navigate('RegistroManual');
            } else {
              Alert.alert('Acción', `${opcion} para espacio ${espacio.numero}`);
            }
          }
        }
      }))
    );
  };

  // ✅ Pantalla de carga inicial
  if (loading) {
    return (
      <Container>
        <AppHeader
          title="Gestión de Espacios"
          subtitle="Monitoreo en tiempo real"
          onBackPress={() => navigation.goBack()}
        />
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <LoadingText>Cargando espacios...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <AppHeader
        title="Gestión de Espacios"
        subtitle={`Actualizado ${getTimeSinceUpdate()}`}
        onBackPress={() => navigation.goBack()}
        onRightPress={() => {
          console.log('🔄 Refresh manual');
          setRefreshing(true);
          cargarEspacios();
        }}
        rightIconName="refresh"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              console.log('🔄 Pull to refresh');
              setRefreshing(true);
              cargarEspacios();
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            title="Actualizando..."
            titleColor={theme.colors.gray}
          />
        }
      >
        <StatsGrid stats={statsConfig} />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por número, ubicación o patente"
        />

        <FilterButtons
          filters={filtros}
          activeFilter={filtroEstado}
          onFilterPress={setFiltroEstado}
        />

        <ResponsiveGrid>
          {espaciosFiltrados.map(espacio => (
            <EspacioCard
              key={espacio.id}
              espacio={espacio}
              onPress={handleGestionarEspacio}
            />
          ))}
        </ResponsiveGrid>
      </ScrollView>

      <AppModal
        visible={showModal}
        title={`Detalle - ${espacioSeleccionado?.numero}`}
        onClose={() => setShowModal(false)}
      >
        {espacioSeleccionado && (
          <>
            <ModalSection>
              <ModalSectionTitle>Información General</ModalSectionTitle>
              <ModalText>Ubicación: {espacioSeleccionado.ubicacion}</ModalText>
              <ModalText>Estado: {espacioSeleccionado.estado.toUpperCase()}</ModalText>
              <ModalText>Tarifa: ${espacioSeleccionado.tarifaPorHora}/hora</ModalText>
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle>Estado del Sensor</ModalSectionTitle>
              <ModalText>Estado: {espacioSeleccionado.sensor.estado.toUpperCase()}</ModalText>
              <ModalText>Última actualización: {espacioSeleccionado.sensor.ultimaActualizacion}</ModalText>
            </ModalSection>

            {espacioSeleccionado.vehiculoActual && (
              <ModalSection>
                <ModalSectionTitle>Vehículo Actual</ModalSectionTitle>
                <ModalText>Patente: {espacioSeleccionado.vehiculoActual.patente}</ModalText>
                <ModalText>Hora de inicio: {espacioSeleccionado.vehiculoActual.horaInicio}</ModalText>
                <ModalText>Tiempo restante: {espacioSeleccionado.vehiculoActual.tiempoRestante}</ModalText>
              </ModalSection>
            )}
          </>
        )}
      </AppModal>
    </Container>
  );
};

export default EspaciosScreen;
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Componentes reutilizables
import AppHeader from '../components/common/AppHeader';
import SearchBar from '../components/common/SearchBar';
import FilterButtons from '../components/common/FilterButtons';
import ResponsiveGrid from '../components/grids/ResponsiveGrid';
import StatsGrid from '../components/dashboard/StatsGrid';
import EspacioCard from '../components/cards/EspacioCard';
import AppModal from '../components/common/AppModal';
import { Container } from '../components/shared/StyledComponents';

// Constantes
import { colors } from '../constants/colors';
import { getResponsiveSize, getDynamicSpacing } from '../utils/ResponsiveUtils';

// Styled components para el modal (SIN estilos inline)
import styled from 'styled-components/native';

const ModalSection = styled.View`
  margin-bottom: ${getDynamicSpacing(20)}px;
`;

const ModalSectionTitle = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${colors.dark};
  margin-bottom: ${getDynamicSpacing(10)}px;
`;

const ModalText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  color: ${colors.gray};
  margin-bottom: ${getDynamicSpacing(5)}px;
  line-height: ${getResponsiveSize(20)}px;
`;

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Espacios: undefined;
  GestionUsuarios: undefined;
  Infracciones: undefined;
  RegistroManual: undefined;
};

type EspaciosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Espacios'
>;

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
  
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Espacio | null>(null);

  // Mock data espacios
  const [espacios] = useState<Espacio[]>([
    {
      id: '1',
      numero: 'A-001',
      ubicacion: 'AV. SAN MARTÍN 123',
      estado: 'ocupado',
      tarifaPorHora: 50,
      vehiculoActual: {
        patente: 'ABC123',
        horaInicio: '14:30',
        tiempoRestante: '1h 23m'
      },
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 2 min'
      }
    },
    {
      id: '2',
      numero: 'A-002',
      ubicacion: 'AV. SAN MARTÍN 125',
      estado: 'libre',
      tarifaPorHora: 50,
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 1 min'
      }
    },
    {
      id: '3',
      numero: 'B-001',
      ubicacion: 'AV. BELGRANO 456',
      estado: 'mantenimiento',
      tarifaPorHora: 75,
      sensor: {
        estado: 'error',
        ultimaActualizacion: 'Hace 15 min'
      }
    },
    {
      id: '4',
      numero: 'B-002',
      ubicacion: 'AV. BELGRANO 458',
      estado: 'reservado',
      tarifaPorHora: 75,
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 3 min'
      }
    },
    {
      id: '5',
      numero: 'C-001',
      ubicacion: 'CALLE CORRIENTES 789',
      estado: 'ocupado',
      tarifaPorHora: 60,
      vehiculoActual: {
        patente: 'XYZ789',
        horaInicio: '13:15',
        tiempoRestante: '45m'
      },
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 1 min'
      }
    },
    {
      id: '6',
      numero: 'C-002',
      ubicacion: 'CALLE CORRIENTES 791',
      estado: 'libre',
      tarifaPorHora: 60,
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 4 min'
      }
    },
    {
      id: '7',
      numero: 'D-001',
      ubicacion: 'AV. INDEPENDENCIA 567',
      estado: 'libre',
      tarifaPorHora: 45,
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 2 min'
      }
    },
    {
      id: '8',
      numero: 'D-002',
      ubicacion: 'AV. INDEPENDENCIA 569',
      estado: 'ocupado',
      tarifaPorHora: 45,
      vehiculoActual: {
        patente: 'DEF456',
        horaInicio: '15:00',
        tiempoRestante: '2h 15m'
      },
      sensor: {
        estado: 'activo',
        ultimaActualizacion: 'Hace 1 min'
      }
    },
  ]);

  // Estadísticas calculadas
  const stats = {
    total: espacios.length,
    libre: espacios.filter(e => e.estado === 'libre').length,
    ocupado: espacios.filter(e => e.estado === 'ocupado').length,
    mantenimiento: espacios.filter(e => e.estado === 'mantenimiento').length,
  };

  // Configuración de estadísticas unificada
  const statsConfig = [
    {
      id: 'libre',
      number: stats.libre,
      label: 'Libres',
      backgroundColor: colors.green,
    },
    {
      id: 'ocupado',
      number: stats.ocupado,
      label: 'Ocupados',
      backgroundColor: colors.red,
    },
    {
      id: 'mantenimiento',
      number: stats.mantenimiento,
      label: 'Mantenimiento',
      backgroundColor: colors.yellow,
    },
    {
      id: 'total',
      number: stats.total,
      label: 'Total',
      backgroundColor: colors.primary,
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

  return (
    <Container>
      <AppHeader
        title="Gestión de Espacios"
        subtitle="Monitoreo en tiempo real"
        onBackPress={() => navigation.goBack()}
        onRightPress={() => Alert.alert('Mapa', 'Abrir vista de mapa general')}
        rightIconName="map"
      />

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

      <AppModal
        visible={showModal}
        title={`Detalle - ${espacioSeleccionado?.numero}`}
        onClose={() => setShowModal(false)}
      >
        {/* CORREGIDO: Sin estilos inline, usando styled components */}
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
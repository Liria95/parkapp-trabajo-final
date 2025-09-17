import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

// Componentes reutilizables
import AppHeader from '../components/common/AppHeader';
import FilterSection from '../components/common/FilterSection';
import SectionHeader from '../components/common/SectionHeader';
import InfractionCard from '../components/infractions/InfractionCard';
import CreateInfractionModal from '../components/infractions/CreateInfractionModal';
import { Container } from '../components/shared/StyledComponents';

// Constantes y utils
import { colors } from '../constants/colors';
import { getDynamicSpacing, breakpoints } from '../utils/ResponsiveUtils';

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Espacios: undefined;
  GestionUsuarios: undefined;
  Infracciones: undefined;
  RegistroManual: undefined;
};

type InfraccionesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Infracciones'
>;

type FilterType = 'todas' | 'pendiente' | 'pagada' | 'cancelada';

interface Infraccion {
  id: string;
  numero: string;
  patente: string;
  motivo: string;
  monto: number;
  fecha: string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  ubicacion: string;
}

interface NuevaInfraccion {
  patente: string;
  motivo: string;
  monto: string;
  ubicacion: string;
}

// Contenedor principal de contenido
const ContentContainer = styled.View`
  flex: 1;
  padding: 0 ${getDynamicSpacing(20)}px;
`;

// Contenedores de cards responsive
const CardsContainer = styled.View`
  flex: 1;
`;

const CardsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${getDynamicSpacing(15)}px;
  padding-bottom: ${getDynamicSpacing(20)}px;
`;

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: ${getDynamicSpacing(30)}px;
  right: ${getDynamicSpacing(30)}px;
  width: ${getDynamicSpacing(56)}px;
  height: ${getDynamicSpacing(56)}px;
  background-color: ${colors.primary};
  border-radius: ${getDynamicSpacing(28)}px;
  elevation: 8;
  shadow-color: ${colors.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const FloatingButtonIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

// Helper functions
const getCardColumns = (): number => {
  if (breakpoints.isDesktop) return 3;
  if (breakpoints.isLargeTablet && breakpoints.isLandscape) return 3;
  if (breakpoints.isLargeTablet) return 2;
  if (breakpoints.isTablet && breakpoints.isLandscape) return 2;
  if (breakpoints.isTablet) return 1;
  return 1; // Móviles siempre 1 columna
};

const InfraccionesScreen: React.FC = () => {
  const navigation = useNavigation<InfraccionesScreenNavigationProp>();
  
  const [filtroActivo, setFiltroActivo] = useState<FilterType>('todas');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [nuevaInfraccion, setNuevaInfraccion] = useState<NuevaInfraccion>({
    patente: '',
    motivo: '',
    monto: '',
    ubicacion: '',
  });

  // Datos de ejemplo
  const [infracciones] = useState<Infraccion[]>([
    { id: '1', numero: '001234', patente: 'ABC123', motivo: 'TIEMPO EXCEDIDO', monto: 2500, fecha: '30/08/2025 14:30', estado: 'pendiente', ubicacion: 'AV. SAN MARTÍN 123' },
    { id: '2', numero: '001235', patente: 'XYZ789', motivo: 'SIN REGISTRO', monto: 2500, fecha: '29/08/2025 10:15', estado: 'pagada', ubicacion: 'AV. BELGRANO 456' },
    { id: '3', numero: '001236', patente: 'DEF456', motivo: 'ESTACIONAMIENTO PROHIBIDO', monto: 3000, fecha: '28/08/2025 16:45', estado: 'pendiente', ubicacion: 'CALLE CORRIENTES 789' },
    { id: '4', numero: '001237', patente: 'GHI789', motivo: 'NO PAGO TARIFA', monto: 2000, fecha: '27/08/2025 12:20', estado: 'cancelada', ubicacion: 'AV. RIVADAVIA 321' },
    { id: '5', numero: '001238', patente: 'JKL012', motivo: 'ZONA PROHIBIDA', monto: 3500, fecha: '26/08/2025 09:15', estado: 'pagada', ubicacion: 'PLAZA CENTRAL 101' },
    { id: '6', numero: '001239', patente: 'MNO345', motivo: 'TIEMPO EXCEDIDO', monto: 2500, fecha: '25/08/2025 17:30', estado: 'cancelada', ubicacion: 'AV. INDEPENDENCIA 567' },
  ]);

  const infraccionesFiltradas = infracciones.filter(inf => 
    filtroActivo === 'todas' || inf.estado === filtroActivo
  );

  // Handlers
  const handleCrearInfraccion = (): void => {
    if (!nuevaInfraccion.patente || !nuevaInfraccion.motivo || !nuevaInfraccion.monto || !nuevaInfraccion.ubicacion) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    
    Alert.alert(
      'Infracción Creada', 
      `Nueva infracción creada para patente ${nuevaInfraccion.patente}`, 
      [{ text: 'OK', onPress: () => handleCloseModal() }]
    );
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setNuevaInfraccion({ patente: '', motivo: '', monto: '', ubicacion: '' });
  };

  const handleFieldChange = (field: keyof NuevaInfraccion, value: string): void => {
    setNuevaInfraccion(prev => ({ ...prev, [field]: value }));
  };

  const handleGestionarInfraccion = (infraccion: Infraccion): void => {
    Alert.alert(
      `Infracción #${infraccion.numero}`,
      `Patente: ${infraccion.patente}\nEstado: ${infraccion.estado.toUpperCase()}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver Detalles', onPress: () => console.log('Ver detalles') },
        { text: 'Cambiar Estado', onPress: () => console.log('Cambiar estado') },
      ]
    );
  };

  const getSectionTitle = (): string => {
    return `Infracciones ${filtroActivo !== 'todas' ? `(${filtroActivo})` : ''}`;
  };

  const renderInfractionsList = () => {
    if (getCardColumns() === 1) {
      // Layout de 1 columna con scroll
      return (
        <ScrollView 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: getDynamicSpacing(40)
          }}
          style={{ flex: 1 }}
          nestedScrollEnabled={true}
        >
          {infraccionesFiltradas.map(infraccion => (
            <InfractionCard
              key={infraccion.id}
              infraccion={infraccion}
              onPress={handleGestionarInfraccion}
            />
          ))}
        </ScrollView>
      );
    } else {
      // Layout de múltiples columnas  
      return (
        <ScrollView 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: getDynamicSpacing(40)
          }}
          style={{ flex: 1 }}
          nestedScrollEnabled={true}
        >
          <CardsGrid>
            {infraccionesFiltradas.map(infraccion => (
              <InfractionCard
                key={infraccion.id}
                infraccion={infraccion}
                onPress={handleGestionarInfraccion}
              />
            ))}
          </CardsGrid>
        </ScrollView>
      );
    }
  };

  return (
    <Container>
      <AppHeader
        title="Gestión de Infracciones"
        subtitle="Control y seguimiento de multas"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />

      <FilterSection
        activeFilter={filtroActivo}
        onFilterChange={setFiltroActivo}
      />

      <ContentContainer>
        <SectionHeader
          title={getSectionTitle()}
          count={infraccionesFiltradas.length}
          subtitle="Gestiona el estado y seguimiento"
        />
        
        <CardsContainer>
          {renderInfractionsList()}
        </CardsContainer>
      </ContentContainer>

      <CreateInfractionModal
        visible={showModal}
        nuevaInfraccion={nuevaInfraccion}
        onClose={handleCloseModal}
        onFieldChange={handleFieldChange}
        onCreate={handleCrearInfraccion}
      />

      {/* Botón flotante para crear nueva infracción */}
      <FloatingButton onPress={() => setShowModal(true)}>
        <FloatingButtonIcon>
          <Ionicons name="add" size={getDynamicSpacing(28)} color={colors.white} />
        </FloatingButtonIcon>
      </FloatingButton>
    </Container>
  );
};

export default InfraccionesScreen;
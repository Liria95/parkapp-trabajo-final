import React, { useState, useEffect, useContext } from 'react';
import { Alert, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

// Componentes reutilizables
import AppHeader from '../../components/common/AppHeader';
import FilterSection from '../../components/common/FilterSection';
import SectionHeader from '../../components/common/SectionHeader';
import InfractionCard from '../../components/infractions/InfractionCard';
import CreateInfractionModal from '../../components/infractions/CreateInfractionModal';
import { Container } from '../../components/shared/StyledComponents';
import { AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';

// Servicios
import { FinesService, FineForDisplay } from '../../services/FinesService';

// Theme y utils
import { theme } from '../../config/theme';
import { getDynamicSpacing, breakpoints } from '../../utils/ResponsiveUtils';

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Espacios: undefined;
  GestionUsuarios: undefined;
  Infracciones: undefined;
  RegistroManual: undefined;
};

type InfraccionesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Infracciones'>;

type FilterType = 'todas' | 'pendiente' | 'pagada' | 'cancelada';

// Interface compatible con InfractionCard
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

// Styled Components
const ContentContainer = styled.View`
  flex: 1;
  padding: 0 ${getDynamicSpacing(20)}px;
`;

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
  background-color: ${theme.colors.primary};
  border-radius: ${getDynamicSpacing(28)}px;
  elevation: 8;
  shadow-color: ${theme.colors.primary};
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
  return 1;
};

const InfraccionesScreen: React.FC = () => {
  const navigation = useNavigation<InfraccionesScreenNavigationProp>();
  const authContext = useContext(AuthContext);

  const [filtroActivo, setFiltroActivo] = useState<FilterType>('todas');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [infracciones, setInfracciones] = useState<Infraccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [nuevaInfraccion, setNuevaInfraccion] = useState<NuevaInfraccion>({
    patente: '',
    motivo: '',
    monto: '',
    ubicacion: '',
  });

  // Cargar infracciones al montar
  useEffect(() => {
    cargarInfracciones();
  }, []);

  const cargarInfracciones = async () => {
    const token = authContext?.state.token;

    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Cargando infracciones desde Firebase...');

      const result = await FinesService.getAllFines(token);

      if (result.success && result.fines) {
        console.log('Infracciones cargadas:', result.fines.length);
        
        // Mapear a la interface que espera InfractionCard
        const infraccionesMapeadas: Infraccion[] = result.fines.map(fine => ({
          id: fine.id,
          numero: fine.numero,
          patente: fine.patente,
          motivo: fine.motivo,
          monto: fine.monto,
          fecha: fine.fecha,
          estado: fine.estado,
          ubicacion: fine.ubicacion,
        }));
        
        setInfracciones(infraccionesMapeadas);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron cargar las infracciones');
      }
    } catch (error) {
      console.error('Error al cargar infracciones:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar las infracciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarInfracciones();
  };

  const infraccionesFiltradas = infracciones.filter(inf =>
    filtroActivo === 'todas' || inf.estado === filtroActivo
  );

  // Handlers
  const handleCrearInfraccion = async (): Promise<void> => {
    if (!nuevaInfraccion.patente || !nuevaInfraccion.motivo || !nuevaInfraccion.monto || !nuevaInfraccion.ubicacion) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    // Implementar creación con userId
    Alert.alert(
      'Funcionalidad pendiente',
      'Para crear una infracción necesitas seleccionar un usuario. Esta funcionalidad estará disponible próximamente.',
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
    const token = authContext?.state.token;

    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      return;
    }

    Alert.alert(
      `Infracción #${infraccion.numero}`,
      `Patente: ${infraccion.patente}\nEstado: ${infraccion.estado.toUpperCase()}\nMonto: $${infraccion.monto}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Pagada',
          onPress: async () => {
            const result = await FinesService.updateFineStatus(infraccion.id, 'pagada', token);
            if (result.success) {
              Alert.alert('Éxito', 'Infracción marcada como pagada');
              cargarInfracciones();
            } else {
              Alert.alert('Error', result.message || 'No se pudo actualizar');
            }
          },
        },
        {
          text: 'Cancelar Infracción',
          style: 'destructive',
          onPress: async () => {
            const result = await FinesService.updateFineStatus(infraccion.id, 'cancelada', token);
            if (result.success) {
              Alert.alert('Éxito', 'Infracción cancelada');
              cargarInfracciones();
            } else {
              Alert.alert('Error', result.message || 'No se pudo cancelar');
            }
          },
        },
      ]
    );
  };

  const getSectionTitle = (): string => {
    return `Infracciones ${filtroActivo !== 'todas' ? `(${filtroActivo})` : ''}`;
  };

  const renderInfractionsList = () => {
    if (loading) {
      return (
        <Container style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.gray }}>
            Cargando infracciones...
          </Text>
        </Container>
      );
    }

    if (infraccionesFiltradas.length === 0) {
      return (
        <Container style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.gray }}>
            No hay infracciones {filtroActivo !== 'todas' ? filtroActivo + 's' : ''}
          </Text>
        </Container>
      );
    }

    if (getCardColumns() === 1) {
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

      <FloatingButton onPress={() => setShowModal(true)}>
        <FloatingButtonIcon>
          <Ionicons name="add" size={getDynamicSpacing(28)} color={theme.colors.white} />
        </FloatingButtonIcon>
      </FloatingButton>
    </Container>
  );
};

export default InfraccionesScreen;
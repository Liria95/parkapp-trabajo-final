import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

// Componentes reutilizables
import AppHeader from '../../components/common/AppHeader';
import ScannerSection from '../../components/registration/ScannerSection';
import FormContainer from '../../forms/FormContainer';
import InputField from '../../forms/InputField';
import LocationCard from '../../components/registration/LocationCard';
import UserFoundCard from '../../components/registration/UserFoundCard';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import AuthButton from '../../components/auth/AuthButton';
import AppModal from '../../components/common/AppModal';
import { Container } from '../../components/shared/StyledComponents';

// Theme
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

// Hooks
import { useFormValidation } from '../../forms/useFormValidation';

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Espacios: undefined;
  GestionUsuarios: undefined;
  Infracciones: undefined;
  RegistroManual: undefined;
};

type RegistroManualScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistroManual'>;

interface UsuarioEncontrado {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  saldo: number;
}

interface EspacioSeleccionado {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
}

const ContentScrollView = styled.ScrollView`
  flex: 1;
`;

const ActionsContainer = styled.View`
  flex-direction: row;
  gap: ${getDynamicSpacing(10)}px;
  padding: ${getDynamicSpacing(20)}px;
`;

const ActionButton = styled.TouchableOpacity<{ primary?: boolean }>`
  flex: 1;
  background-color: ${props => props.primary ? theme.colors.primary : theme.colors.gray};
  padding: ${getDynamicSpacing(15)}px;
  border-radius: ${getResponsiveSize(8)}px;
  align-items: center;
  elevation: 2;
`;

const ActionButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModalSpaceItem = styled.TouchableOpacity`
  padding: ${getDynamicSpacing(15)}px;
  border-radius: ${getResponsiveSize(8)}px;
  background-color: ${theme.colors.lightGray};
  margin-bottom: ${getDynamicSpacing(10)}px;
  border-width: 2px;
  border-color: transparent;
`;

const ModalSpaceTitle = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  margin-bottom: ${getDynamicSpacing(5)}px;
`;

const ModalSpaceInfo = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.gray};
  margin-bottom: ${getResponsiveSize(2)}px;
`;

const ModalSpacePrice = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${theme.colors.primary};
`;

const RegistroManualScreen: React.FC = () => {
  const navigation = useNavigation<RegistroManualScreenNavigationProp>();
  
  const [patente, setPatente] = useState<string>('');
  const [patenteValidada, setPatenteValidada] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<EspacioSeleccionado | null>(null);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<UsuarioEncontrado | null>(null);
  const [notificarUsuario, setNotificarUsuario] = useState<boolean>(true);
  const [showEspaciosModal, setShowEspaciosModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { errors, validateForm, clearError } = useFormValidation();

  // Mock data espacios disponibles
  const espaciosDisponibles = [
    { id: '1', numero: 'A-001', ubicacion: 'AV. SAN MARTÍN 123', tarifaPorHora: 50 },
    { id: '2', numero: 'B-005', ubicacion: 'AV. BELGRANO 456', tarifaPorHora: 75 },
    { id: '3', numero: 'C-012', ubicacion: 'CALLE CORRIENTES 789', tarifaPorHora: 60 },
  ];

  const handleScanCamera = () => {
    Alert.alert(
      'Escanear Patente',
      'Funcionalidad de cámara para escanear patente automáticamente',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Simular Escaneo', 
          onPress: () => {
            setPatente('ABC123');
            setPatenteValidada(true);
            validarPatente('ABC123');
          }
        }
      ]
    );
  };

  const handlePatenteChange = (text: string) => {
    setPatente(text.toUpperCase());
    setPatenteValidada(false);
    clearError('patente');
    
    if (text.length >= 6) {
      validarPatente(text);
    } else {
      setUsuarioEncontrado(null);
    }
  };

  const validarPatente = (patente: string) => {
    // Simular validación de patente
    setTimeout(() => {
      setPatenteValidada(true);
      buscarUsuarioExistente(patente);
    }, 1000);
  };

  const buscarUsuarioExistente = (patente: string) => {
    // Simular búsqueda en base de datos
    const usuarioMock: UsuarioEncontrado = {
      id: '1',
      nombre: 'JUAN PÉREZ',
      email: 'juan.perez@email.com',
      telefono: '+54 9 11 1234-5678',
      saldo: 1250.00,
    };
    
    if (patente === 'ABC123') {
      setUsuarioEncontrado(usuarioMock);
    } else {
      setUsuarioEncontrado(null);
    }
  };

  const handleSeleccionarEspacio = (espacio: EspacioSeleccionado) => {
    setEspacioSeleccionado(espacio);
    setShowEspaciosModal(false);
  };

  const handleRegistrar = async (): Promise<void> => {
    const isValid = validateForm({ patente }, {
      patente: { required: true, minLength: 6 },
    });

    if (!espacioSeleccionado) {
      Alert.alert('Error', 'Debe seleccionar una ubicación');
      return;
    }

    if (isValid) {
      setLoading(true);
      
      // Simular registro
      setTimeout(() => {
        Alert.alert(
          'Registro Exitoso',
          `Vehículo ${patente} registrado en ${espacioSeleccionado.ubicacion}\n${notificarUsuario ? 'Notificación enviada al usuario' : 'Sin notificación'}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setPatente('');
                setPatenteValidada(false);
                setEspacioSeleccionado(null);
                setUsuarioEncontrado(null);
                setNotificarUsuario(true);
                setSearchQuery('');
                setLoading(false);
              }
            }
          ]
        );
      }, 1500);
    }
  };

  return (
    <Container>
      <AppHeader
        title="Registro Manual"
        subtitle="Registrar vehículo sin app"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />

      <ContentScrollView showsVerticalScrollIndicator={false}>
        <ScannerSection onCameraPress={handleScanCamera} />

        <FormContainer paddingHorizontal={20}>
          <InputField
            label="Patente del Vehículo"
            iconName="car-outline"
            placeholder="ABC123"
            value={patente}
            onChangeText={handlePatenteChange}
            error={errors.patente}
            autoCapitalize="characters"
            maxLength={10}
          />
        </FormContainer>

        <LocationCard 
          espacioSeleccionado={espacioSeleccionado}
          onLocationPress={() => setShowEspaciosModal(true)}
        />

        <FormContainer paddingHorizontal={20}>
          <InputField
            label="Buscar usuario existente (opcional)"
            iconName="search-outline"
            placeholder="Email o teléfono del usuario"
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FormContainer>

        {usuarioEncontrado && (
          <UserFoundCard usuario={usuarioEncontrado} />
        )}

        <ToggleSwitch
          title="Notificar al usuario"
          subtitle="Enviar SMS/email con detalles"
          value={notificarUsuario}
          onToggle={() => setNotificarUsuario(!notificarUsuario)}
        />

        <ActionsContainer>
          <ActionButton onPress={() => navigation.goBack()}>
            <ActionButtonText>Cancelar</ActionButtonText>
          </ActionButton>
          <ActionButton primary onPress={handleRegistrar}>
            <ActionButtonText>Registrar</ActionButtonText>
          </ActionButton>
        </ActionsContainer>
      </ContentScrollView>

      {/* Modal Selección de Espacios */}
      <AppModal
        visible={showEspaciosModal}
        title="Seleccionar Espacio"
        onClose={() => setShowEspaciosModal(false)}
      >
        {espaciosDisponibles.map(espacio => (
          <ModalSpaceItem
            key={espacio.id}
            onPress={() => handleSeleccionarEspacio(espacio)}
          >
            <ModalSpaceTitle>Espacio {espacio.numero}</ModalSpaceTitle>
            <ModalSpaceInfo>{espacio.ubicacion}</ModalSpaceInfo>
            <ModalSpacePrice>${espacio.tarifaPorHora}/hora</ModalSpacePrice>
          </ModalSpaceItem>
        ))}
      </AppModal>
    </Container>
  );
};

export default RegistroManualScreen;
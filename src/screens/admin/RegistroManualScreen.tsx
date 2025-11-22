import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import * as SecureStore from 'expo-secure-store';

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
import { theme } from '../../config/theme';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

// Hooks
import { useFormValidation } from '../../forms/useFormValidation';

// Service
import { ManualRegistrationService } from '../../services/manualRegistrationService';
import type { EspacioDisponible } from '../../services/manualRegistrationService';

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
  vehicleId: string;
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

const UserTypeSelector = styled.View`
  flex-direction: row;
  padding: ${getDynamicSpacing(20)}px;
  gap: ${getDynamicSpacing(10)}px;
`;

const UserTypeButton = styled.TouchableOpacity<{ selected?: boolean }>`
  flex: 1;
  padding: ${getDynamicSpacing(15)}px;
  border-radius: ${getResponsiveSize(8)}px;
  background-color: ${props => props.selected ? theme.colors.primary : theme.colors.lightGray};
  border-width: 2px;
  border-color: ${props => props.selected ? theme.colors.primary : 'transparent'};
  align-items: center;
`;

const UserTypeText = styled.Text<{ selected?: boolean }>`
  color: ${props => props.selected ? theme.colors.white : theme.colors.dark};
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
`;

const InfoCard = styled.View`
  background-color: ${theme.colors.lightGray};
  padding: ${getDynamicSpacing(15)}px;
  margin: ${getDynamicSpacing(20)}px;
  border-radius: ${getResponsiveSize(8)}px;
  border-left-width: 4px;
  border-left-color: ${theme.colors.warning};
`;

const InfoText = styled.Text`
  color: ${theme.colors.dark};
  font-size: ${getResponsiveSize(12)}px;
  line-height: ${getResponsiveSize(18)}px;
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

const SectionTitle = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  margin-bottom: ${getDynamicSpacing(10)}px;
  padding: 0 ${getDynamicSpacing(20)}px;
`;

const LoadingText = styled.Text`
  color: ${theme.colors.gray};
  font-size: ${getResponsiveSize(14)}px;
  text-align: center;
  padding: ${getDynamicSpacing(20)}px;
`;

const RegistroManualScreen: React.FC = () => {
  const navigation = useNavigation<RegistroManualScreenNavigationProp>();
  
  // Tipo de usuario
  const [tipoUsuario, setTipoUsuario] = useState<'registrado' | 'visitante'>('registrado');
  
  // Datos comunes
  const [patente, setPatente] = useState<string>('');
  const [patenteValidada, setPatenteValidada] = useState<boolean>(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<EspacioSeleccionado | null>(null);
  const [notificarUsuario, setNotificarUsuario] = useState<boolean>(true);
  const [showEspaciosModal, setShowEspaciosModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSpaces, setLoadingSpaces] = useState<boolean>(false);
  
  // Para usuarios registrados
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<UsuarioEncontrado | null>(null);
  const [buscandoUsuario, setBuscandoUsuario] = useState<boolean>(false);
  
  // Para visitantes (SOLO horas, sin nombre/email/teléfono)
  // Se eliminan los estados: nombreVisitante, emailVisitante, telefonoVisitante
  const [horasEstacionamiento, setHorasEstacionamiento] = useState<string>('2');

  const { errors, validateForm, clearError } = useFormValidation();

  // Espacios disponibles (desde backend)
  const [espaciosDisponibles, setEspaciosDisponibles] = useState<EspacioDisponible[]>([]);

  // Obtener token de autenticación
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      console.log('Token recuperado:', token ? 'Token existe' : 'Token no existe');
      if (token) {
        console.log('Longitud del token:', token.length);
        console.log('Primeros 20 caracteres:', token.substring(0, 20));
      }
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  };

  // Cargar espacios disponibles al montar
  useEffect(() => {
    loadAvailableSpaces();
  }, []);

  const loadAvailableSpaces = async () => {
    try {
      setLoadingSpaces(true);
      console.log('Iniciando carga de espacios disponibles...');
      
      const token = await getAuthToken();
      
      if (!token) {
        console.log('Error: No hay token de autenticacion');
        Alert.alert('Error', 'No hay sesión activa. Por favor, inicie sesión nuevamente.');
        return;
      }

      console.log('Llamando al servicio de espacios disponibles...');
      const response = await ManualRegistrationService.getAvailableSpaces(token);
      
      console.log('Respuesta del servicio:', JSON.stringify(response, null, 2));
      
      if (response.success && response.espacios) {
        console.log('Espacios cargados exitosamente:', response.espacios.length);
        setEspaciosDisponibles(response.espacios);
        
        if (response.espacios.length === 0) {
          Alert.alert('Aviso', 'No hay espacios disponibles en este momento');
        }
      } else {
        console.log('No se pudieron cargar espacios:', response.message);
        Alert.alert('Aviso', response.message || 'No hay espacios disponibles');
      }
    } catch (error: any) {
      console.error('Error al cargar espacios:', error);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', 'No se pudieron cargar los espacios disponibles. Verifique su conexión.');
    } finally {
      setLoadingSpaces(false);
    }
  };

  // Escanear patente (simulado)
  const handleScanCamera = () => {
    Alert.alert(
      'Escanear Patente',
      'Funcionalidad de cámara para escanear patente automáticamente',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Simular Escaneo', 
          onPress: () => {
            const patenteSimulada = 'ABC' + Math.floor(Math.random() * 1000);
            setPatente(patenteSimulada);
            setPatenteValidada(false);
            if (tipoUsuario === 'registrado') {
              validarPatente(patenteSimulada);
            }
          }
        }
      ]
    );
  };

  // Manejar cambio de patente
  const handlePatenteChange = (text: string) => {
    setPatente(text.toUpperCase());
    setPatenteValidada(false);
    setUsuarioEncontrado(null);
    clearError('patente');
    
    // Auto-buscar cuando tiene 6+ caracteres (usuarios registrados)
    if (tipoUsuario === 'registrado' && text.length >= 6) {
      validarPatente(text);
    }
  };

  // Validar patente y buscar usuario
  const validarPatente = async (patenteValue: string) => {
    if (tipoUsuario !== 'registrado') return;
    
    try {
      setBuscandoUsuario(true);
      console.log('Buscando usuario con patente:', patenteValue);
      
      const token = await getAuthToken();
      
      if (!token) {
        console.log('Error: No hay token al validar patente');
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      const response = await ManualRegistrationService.searchByPlate(patenteValue, token);
      
      console.log('Respuesta de busqueda de usuario:', JSON.stringify(response, null, 2));
      
      if (response.success && response.found && response.user) {
        console.log('Usuario encontrado:', response.user.nombre);
        setUsuarioEncontrado(response.user);
        setPatenteValidada(true);
      } else {
        console.log('Usuario no encontrado con esta patente');
        setUsuarioEncontrado(null);
        setPatenteValidada(true);
      }
    } catch (error: any) {
      console.error('Error al buscar usuario:', error);
      console.error('Error stack:', error.stack);
      setUsuarioEncontrado(null);
      setPatenteValidada(false);
      Alert.alert('Error', error.message || 'Error al buscar usuario');
    } finally {
      setBuscandoUsuario(false);
    }
  };

  // Seleccionar espacio
  const handleSeleccionarEspacio = (espacio: EspacioDisponible) => {
    console.log('Espacio seleccionado:', espacio.numero);
    setEspacioSeleccionado({
      id: espacio.id,
      numero: espacio.numero,
      ubicacion: espacio.ubicacion,
      tarifaPorHora: espacio.tarifaPorHora
    });
    setShowEspaciosModal(false);
  };

  // Cambiar tipo de usuario
  const handleTipoUsuarioChange = (tipo: 'registrado' | 'visitante') => {
    console.log('Cambiando tipo de usuario a:', tipo);
    setTipoUsuario(tipo);
    
    // Limpiar datos según tipo
    if (tipo === 'visitante') {
      setSearchQuery('');
      setUsuarioEncontrado(null);
      setPatenteValidada(false);
    } else {
      // Solo limpiar la duración del visitante, ya que no hay otros datos de visitante
      setHorasEstacionamiento('2'); 
    }
  };

  // Calcular total para visitantes
  const calcularTotal = (): number => {
    if (!espacioSeleccionado) return 0;
    const horas = parseFloat(horasEstacionamiento) || 0;
    return espacioSeleccionado.tarifaPorHora * horas;
  };

  // Validaciones y confirmación
  const handleRegistrar = async (): Promise<void> => {
    console.log('Iniciando proceso de registro...');
    console.log('Tipo de usuario:', tipoUsuario);
    
    // Validación común
    if (!patente || patente.length < 6) {
      Alert.alert('Error', 'Ingrese una patente válida (mínimo 6 caracteres)');
      return;
    }

    if (!espacioSeleccionado) {
      Alert.alert('Error', 'Debe seleccionar un espacio de estacionamiento');
      return;
    }

    // Validaciones específicas según tipo de usuario
    if (tipoUsuario === 'registrado') {
      if (!usuarioEncontrado) {
        Alert.alert(
          'Error', 
          'No se encontró un usuario registrado con esta patente.\n\nSeleccione "Visitante" si la persona no tiene cuenta en ParkApp.'
        );
        return;
      }

      // Verificar saldo mínimo
      if (usuarioEncontrado.saldo < espacioSeleccionado.tarifaPorHora) {
        Alert.alert(
          'Saldo Insuficiente',
          `El usuario necesita al menos $${espacioSeleccionado.tarifaPorHora} para estacionar.\n\nSaldo actual: $${usuarioEncontrado.saldo.toFixed(2)}`
        );
        return;
      }

      // Confirmar registro de usuario
      Alert.alert(
        'Confirmar Registro',
        `Usuario: ${usuarioEncontrado.nombre}\nPatente: ${patente}\nEspacio: ${espacioSeleccionado.numero}\nUbicación: ${espacioSeleccionado.ubicacion}\n\n¿Confirmar registro?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => procesarRegistro()
          }
        ]
      );
    } else {
      // Visitante - SOLO validar horas
      const horas = parseFloat(horasEstacionamiento);
      if (!horas || horas <= 0) {
        Alert.alert('Error', 'Ingrese una cantidad de horas válida');
        return;
      }

      const total = calcularTotal();
      
      // Confirmar pago en efectivo
      Alert.alert(
        'Confirmar Pago en Efectivo',
        `Visitante: Patente ${patente}\nEspacio: ${espacioSeleccionado.numero}\nUbicación: ${espacioSeleccionado.ubicacion}\nDuración: ${horasEstacionamiento}h\n\nTotal a cobrar: $${total.toFixed(2)}\n(${horasEstacionamiento}h × $${espacioSeleccionado.tarifaPorHora}/h)\n\n¿Recibió el pago en efectivo?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, recibí el pago',
            onPress: () => procesarRegistro(total)
          }
        ]
      );
    }
  };

  // Procesar el registro (backend)
  const procesarRegistro = async (montoVisitante?: number): Promise<void> => {
    setLoading(true);
    console.log('Procesando registro...');
    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.log('Error: No hay token al procesar registro');
        Alert.alert('Error', 'No hay sesión activa');
        setLoading(false);
        return;
      }

      if (tipoUsuario === 'registrado' && usuarioEncontrado) {
        console.log('Registrando usuario con cuenta...');
        console.log('Datos:', {
          userId: usuarioEncontrado.id,
          vehicleId: usuarioEncontrado.vehicleId,
          parkingSpaceId: espacioSeleccionado!.id,
          sendNotification: notificarUsuario
        });
        
        // Registrar usuario con cuenta
        const response = await ManualRegistrationService.registerUser(
          {
            userId: usuarioEncontrado.id,
            vehicleId: usuarioEncontrado.vehicleId,
            parkingSpaceId: espacioSeleccionado!.id,
            sendNotification: notificarUsuario
          },
          token
        );

        console.log('Respuesta de registro de usuario:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          console.log('Usuario registrado exitosamente');
          
          const mensaje = `Vehículo registrado exitosamente\n\n` +
            `Patente: ${patente}\n` +
            `Usuario: ${usuarioEncontrado.nombre}\n` +
            `Espacio: ${response.data.espacioCodigo}\n` +
            `Ubicación: ${response.data.ubicacion}\n` +
            `Tarifa: $${response.data.tarifaPorHora}/h\n\n` +
            `${notificarUsuario ? 'Notificación enviada' : 'Sin notificación'}`;

          Alert.alert('Registro Exitoso', mensaje, [
            { text: 'OK', onPress: resetForm }
          ]);
        } else {
          console.log('Error al registrar:', response.message);
          Alert.alert('Error', response.message || 'Error al registrar');
        }
      } else {
        console.log('Registrando visitante (simplificado)...');
        // Los campos de nombre, email, y teléfono del visitante han sido eliminados de aquí.
        console.log('Datos:', {
          licensePlate: patente,
          parkingSpaceId: espacioSeleccionado!.id,
          hours: parseFloat(horasEstacionamiento)
        });
        
        // Registrar visitante simplificado (SOLO patente y horas)
        const response = await ManualRegistrationService.registerVisitor(
          {
            licensePlate: patente,
            parkingSpaceId: espacioSeleccionado!.id,
            hours: parseFloat(horasEstacionamiento)
            // Se eliminan: name, email, phone, sendNotification (porque ya no hay email)
          },
          token
        );

        console.log('Respuesta de registro de visitante:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          console.log('Visitante registrado exitosamente');
          
          const mensaje = `Visitante registrado exitosamente\n\n` +
            `Patente: ${patente}\n` +
            `Espacio: ${response.data.espacioCodigo}\n` +
            `Ubicación: ${response.data.ubicacion}\n` +
            `Duración: ${response.data.hours}h\n` +
            `Total cobrado: $${response.data.totalAmount.toFixed(2)}\n\n` +
            `Se creó un registro temporal con la patente en el sistema.`;

          Alert.alert('Registro Exitoso', mensaje, [
            { text: 'OK', onPress: resetForm }
          ]);
        } else {
          console.log('Error al registrar visitante:', response.message);
          Alert.alert('Error', response.message || 'Error al registrar visitante');
        }
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      console.error('Error stack:', error.stack);
      Alert.alert(
        'Error al Registrar',
        error.message || 'Ocurrió un error al procesar el registro. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    console.log('Reseteando formulario...');
    setPatente('');
    setPatenteValidada(false);
    setEspacioSeleccionado(null);
    setUsuarioEncontrado(null);
    setNotificarUsuario(true);
    setSearchQuery('');
    // Se eliminan los resets de: setNombreVisitante, setEmailVisitante, setTelefonoVisitante
    setHorasEstacionamiento('2');
    setLoading(false);
    
    // Recargar espacios
    loadAvailableSpaces();
  };

  // Render
  return (
    <Container>
      <AppHeader
        title="Registro Manual"
        subtitle="Registrar estacionamiento sin app"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />

      <ContentScrollView showsVerticalScrollIndicator={false}>
        {/* Selector de tipo de usuario */}
        <UserTypeSelector>
          <UserTypeButton
            selected={tipoUsuario === 'registrado'}
            onPress={() => handleTipoUsuarioChange('registrado')}
          >
            <UserTypeText selected={tipoUsuario === 'registrado'}>
              Usuario Registrado
            </UserTypeText>
          </UserTypeButton>

          <UserTypeButton
            selected={tipoUsuario === 'visitante'}
            onPress={() => handleTipoUsuarioChange('visitante')}
          >
            <UserTypeText selected={tipoUsuario === 'visitante'}>
              Visitante
            </UserTypeText>
          </UserTypeButton>
        </UserTypeSelector>

        {/* Info según tipo */}
        <InfoCard>
          <InfoText>
            {tipoUsuario === 'registrado'
              ? 'Para usuarios con cuenta en ParkApp. El tiempo se descontará de su saldo.'
              : 'Para personas sin cuenta. Solo necesita la patente. El pago es en efectivo.'}
          </InfoText>
        </InfoCard>

        <ScannerSection onCameraPress={handleScanCamera} />

        <FormContainer paddingHorizontal={20}>
          <InputField
            label="Patente del Vehículo *"
            iconName="car-outline"
            placeholder="ABC123"
            value={patente}
            onChangeText={handlePatenteChange}
            error={errors.patente}
            autoCapitalize="characters"
            maxLength={10}
          />
          {buscandoUsuario && (
            <LoadingText>Buscando usuario...</LoadingText>
          )}
        </FormContainer>

        <LocationCard 
          espacioSeleccionado={espacioSeleccionado}
          onLocationPress={() => setShowEspaciosModal(true)}
        />

        {/* FORMULARIO PARA USUARIOS REGISTRADOS */}
        {tipoUsuario === 'registrado' && (
          <>
            <FormContainer paddingHorizontal={20}>
              <InputField
                label="Buscar usuario (opcional)"
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
          </>
        )}

        {/* FORMULARIO SIMPLIFICADO PARA VISITANTES */}
        {tipoUsuario === 'visitante' && (
          <>
            <SectionTitle>Duración del Estacionamiento</SectionTitle>
            
            <FormContainer paddingHorizontal={20}>
              {/* Se eliminan: Nombre, Email, Teléfono del visitante */}

              <InputField
                label="Horas de Estacionamiento *"
                iconName="time-outline"
                placeholder="2"
                value={horasEstacionamiento}
                onChangeText={setHorasEstacionamiento}
                keyboardType="numeric"
              />
            </FormContainer>

            {espacioSeleccionado && horasEstacionamiento && (
              <InfoCard>
                <InfoText style={{ fontWeight: 'bold', fontSize: getResponsiveSize(16) }}>
                  Total a cobrar: ${calcularTotal().toFixed(2)}
                </InfoText>
                <InfoText>
                  {horasEstacionamiento}h × ${espacioSeleccionado.tarifaPorHora}/h
                </InfoText>
                 <InfoText style={{ marginTop: 10, fontStyle: 'italic' }}>
                   Se creará un registro temporal con la patente {patente || '[patente]'} en el sistema.
                 </InfoText>
              </InfoCard>
            )}
          </>
        )}

        {/* TOGGLE solo visible para usuarios registrados (se eliminan las opciones de email para visitantes) */}
        {tipoUsuario === 'registrado' && (
          <ToggleSwitch
            title="Notificar al usuario"
            subtitle="Enviar notificación push" 
            value={notificarUsuario}
            onToggle={() => setNotificarUsuario(!notificarUsuario)}
          />
        )}
        
        {/* En el caso de Visitante, el toggle de notificación se oculta y la lógica de registro simplificada ya no lo usa. */}

        <ActionsContainer>
          <ActionButton onPress={() => navigation.goBack()}>
            <ActionButtonText>Cancelar</ActionButtonText>
          </ActionButton>
          <ActionButton primary onPress={handleRegistrar} disabled={loading}>
            <ActionButtonText>
              {loading ? 'Registrando...' : 'Registrar'}
            </ActionButtonText>
          </ActionButton>
        </ActionsContainer>
      </ContentScrollView>

      {/* Modal Selección de Espacios */}
      <AppModal
        visible={showEspaciosModal}
        title="Seleccionar Espacio"
        onClose={() => setShowEspaciosModal(false)}
      >
        {loadingSpaces ? (
          <LoadingText>Cargando espacios disponibles...</LoadingText>
        ) : espaciosDisponibles.length === 0 ? (
          <LoadingText>No hay espacios disponibles</LoadingText>
        ) : (
          espaciosDisponibles.map(espacio => (
            <ModalSpaceItem
              key={espacio.id}
              onPress={() => handleSeleccionarEspacio(espacio)}
            >
              <ModalSpaceTitle>Espacio {espacio.numero}</ModalSpaceTitle>
              <ModalSpaceInfo>{espacio.ubicacion}</ModalSpaceInfo>
              <ModalSpacePrice>${espacio.tarifaPorHora}/hora</ModalSpacePrice>
            </ModalSpaceItem>
          ))
        )}
      </AppModal>
    </Container>
  );
};

export default RegistroManualScreen;
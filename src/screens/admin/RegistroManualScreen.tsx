import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, TouchableOpacity, View, Text as RNText } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';

// Componentes reutilizables
import AppHeader from '../../components/common/AppHeader';
import ScannerSection from '../../components/registration/ScannerSection';
import FormContainer from '../../forms/FormContainer';
import InputField from '../../forms/InputField';
import LocationCard from '../../components/registration/LocationCard';
import UserFoundCard from '../../components/registration/UserFoundCard';
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

const styles = {
  filtroUbicacion: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.lightGray,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filtroUbicacionActivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filtroUbicacionTexto: {
    color: theme.colors.dark,
    fontSize: 12,
  },
  filtroUbicacionTextoActivo: {
    color: theme.colors.white,
    fontWeight: 'bold' as any,
  },
};

const RegistroManualScreen: React.FC = () => {
  const navigation = useNavigation<RegistroManualScreenNavigationProp>();
  
  // Tipo de registro
  const [tipoRegistro, setTipoRegistro] = useState<'multa' | 'visitante'>('multa');
  const [subTipoVisitante, setSubTipoVisitante] = useState<'estacionamiento' | 'multa'>('estacionamiento');
  
  // Datos comunes
  const [patente, setPatente] = useState<string>('');
  const [patenteValidada, setPatenteValidada] = useState<boolean>(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<EspacioSeleccionado | null>(null);
  const [showEspaciosModal, setShowEspaciosModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSpaces, setLoadingSpaces] = useState<boolean>(false);
  
  // Para filtrar por ubicación
  const [ubicacionesFiltro, setUbicacionesFiltro] = useState<string[]>([]);
  const [ubicacionSeleccionadaFiltro, setUbicacionSeleccionadaFiltro] = useState<string>('todas');
  
  // Para multas (usuario registrado)
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<UsuarioEncontrado | null>(null);
  const [buscandoUsuario, setBuscandoUsuario] = useState<boolean>(false);
  const [montoMulta, setMontoMulta] = useState<string>('');
  const [motivoMulta, setMotivoMulta] = useState<string>('');
  
  // Para visitantes
  const [horasEstacionamiento, setHorasEstacionamiento] = useState<string>('2');
  
  // Para multa a visitante (sin registro)
  const [nombreVisitante, setNombreVisitante] = useState<string>('');
  const [montoMultaVisitante, setMontoMultaVisitante] = useState<string>('');
  const [motivoMultaVisitante, setMotivoMultaVisitante] = useState<string>('');

  const { errors, validateForm, clearError } = useFormValidation();

  // Espacios disponibles (desde backend)
  const [espaciosDisponibles, setEspaciosDisponibles] = useState<EspacioDisponible[]>([]);
  const [espaciosOriginales, setEspaciosOriginales] = useState<EspacioDisponible[]>([]);

  // Obtener token de autenticación
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  };

  // Cargar espacios disponibles al montar
  useEffect(() => {
    console.log('COMPONENTE RegistroManual');
    console.log('Llamando a loadAvailableSpaces()...');
    loadAvailableSpaces();
  }, []);

  const loadAvailableSpaces = async () => {
    console.log('INICIO loadAvailableSpaces()');
    
    try {
      setLoadingSpaces(true);
      console.log('Loading spaces = true');
      console.log('========================================');
      console.log('CARGANDO ESPACIOS DISPONIBLES');
      console.log('========================================');
      
      const token = await getAuthToken();
      console.log('Token obtenido:', token ? 'SÍ (primeros 20 chars): ' + token.substring(0, 20) : 'NO');
      
      if (!token) {
        console.log('NO HAY TOKEN');
        Alert.alert('Error', 'No hay sesión activa. Por favor, inicie sesión nuevamente.');
        return;
      }

      // Intentar obtener ubicación GPS del admin
      let adminLocation = undefined;
      
      try {
        console.log('📍 Solicitando permisos de ubicación...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Status de permisos:', status);
        
        if (status === 'granted') {
          console.log('Permisos concedidos, obteniendo ubicación...');
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          adminLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            radius: 500 // 500km de radio
          };
          
          console.log('Ubicación GPS del admin:', adminLocation);
        } else {
          console.log('Permisos de ubicación denegados');
        }
      } catch (locationError) {
        console.log('Error al obtener ubicación GPS:', locationError);
        console.log('→ Continuando sin GPS...');
      }

      console.log('Llamando a ManualRegistrationService.getAvailableSpaces...');
      
      // Llamar al servicio con o sin ubicación
      const response = await ManualRegistrationService.getAvailableSpaces(
        token,
        adminLocation
      );
      
      console.log('========================================');
      console.log('RESPUESTA DEL SERVICIO:');
      console.log('Success:', response.success);
      console.log('Espacios:', response.espacios?.length || 0);
      if (response.espacios && response.espacios.length > 0) {
        console.log('Primer espacio:', response.espacios[0].numero);
        if (response.espacios[0].distancia !== undefined) {
          console.log('   Distancia:', response.espacios[0].distancia.toFixed(2), 'km');
        }
      }
      console.log('Message:', response.message);
      console.log('========================================');
      
      if (response.success && response.espacios) {
        console.log('Guardando espacios en estado...');
        setEspaciosDisponibles(response.espacios);
        setEspaciosOriginales(response.espacios);
        
        // Extraer ubicaciones únicas para el filtro
        const ubicacionesUnicas = Array.from(
          new Set(response.espacios.map(e => e.ubicacion))
        ).sort();
        setUbicacionesFiltro(ubicacionesUnicas);
        
        if (response.espacios.length === 0) {
          console.log('RESPUESTA VACÍA - No hay espacios');
          Alert.alert('Aviso', 'No hay espacios disponibles en este momento');
        } else {
          console.log('ESPACIOS CARGADOS CORRECTAMENTE:', response.espacios.length);
        }
      } else {
        console.log('ERROR EN RESPUESTA:', response.message);
        Alert.alert('Aviso', response.message || 'No hay espacios disponibles');
      }
    } catch (error: any) {
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
            if (tipoRegistro === 'multa') {
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
    
    // Auto-buscar cuando tiene 6+ caracteres (para multas)
    if (tipoRegistro === 'multa' && text.length >= 6) {
      validarPatente(text);
    }
  };

  // Validar patente y buscar usuario (para multas)
  const validarPatente = async (patenteValue: string) => {
    if (tipoRegistro !== 'multa') return;
    
    try {
      setBuscandoUsuario(true);
      console.log('Buscando usuario con patente para multa:', patenteValue);
      
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      const response = await ManualRegistrationService.searchByPlate(patenteValue, token);
      
      if (response.success && response.found && response.user) {
        console.log('Usuario encontrado para multa:', response.user.nombre);
        setUsuarioEncontrado(response.user);
        setPatenteValidada(true);
      } else {
        console.log('Usuario no encontrado con esta patente');
        setUsuarioEncontrado(null);
        setPatenteValidada(true);
        Alert.alert(
          'Usuario no encontrado',
          'No se encontró un usuario registrado con esta patente. Si desea registrar un visitante, seleccione la opción "Visitante".'
        );
      }
    } catch (error: any) {
      console.error('Error al buscar usuario:', error);
      setUsuarioEncontrado(null);
      setPatenteValidada(false);
      Alert.alert('Error', error.message || 'Error al buscar usuario');
    } finally {
      setBuscandoUsuario(false);
    }
  };

  // Seleccionar espacio
  const handleSeleccionarEspacio = (espacio: EspacioDisponible) => {
    setEspacioSeleccionado({
      id: espacio.id,
      numero: espacio.numero,
      ubicacion: espacio.ubicacion,
      tarifaPorHora: espacio.tarifaPorHora
    });
    setShowEspaciosModal(false);
  };

  // Cambiar tipo de registro
  const handleTipoRegistroChange = (tipo: 'multa' | 'visitante') => {
    setTipoRegistro(tipo);
    
    // Limpiar datos según tipo
    if (tipo === 'visitante') {
      setUsuarioEncontrado(null);
      setPatenteValidada(false);
      setMontoMulta('');
      setMotivoMulta('');
    } else {
      setHorasEstacionamiento('2');
    }
  };

  // Calcular total para visitantes
  const calcularTotal = (): number => {
    if (!espacioSeleccionado) return 0;
    const horas = parseFloat(horasEstacionamiento) || 0;
    return espacioSeleccionado.tarifaPorHora * horas;
  };

  // Filtrar espacios por ubicación seleccionada
  const handleFiltrarPorUbicacion = (ubicacion: string) => {
    setUbicacionSeleccionadaFiltro(ubicacion);
    
    if (ubicacion === 'todas') {
      setEspaciosDisponibles(espaciosOriginales);
    } else {
      const espaciosFiltrados = espaciosOriginales.filter(
        e => e.ubicacion === ubicacion
      );
      setEspaciosDisponibles(espaciosFiltrados);
    }
  };

  // Validaciones y confirmación
  const handleRegistrar = async (): Promise<void> => {
    
    // Validación común
    if (!patente || patente.length < 6) {
      Alert.alert('Error', 'Ingrese una patente válida (mínimo 6 caracteres)');
      return;
    }

    // Validaciones específicas según tipo de registro
    if (tipoRegistro === 'multa') {
      if (!usuarioEncontrado) {
        Alert.alert(
          'Error', 
          'No se encontró un usuario registrado con esta patente.\n\nPara registrar un visitante, seleccione la opción "Visitante".'
        );
        return;
      }

      if (!espacioSeleccionado) {
        Alert.alert('Error', 'Debe seleccionar la ubicación donde ocurrió la infracción');
        return;
      }

      if (!montoMulta || parseFloat(montoMulta) <= 0) {
        Alert.alert('Error', 'Ingrese un monto de multa válido');
        return;
      }

      if (!motivoMulta || motivoMulta.trim().length < 5) {
        Alert.alert('Error', 'Ingrese un motivo de la multa (mínimo 5 caracteres)');
        return;
      }

      // Confirmar multa
      Alert.alert(
        'Confirmar Multa',
        `Usuario: ${usuarioEncontrado.nombre}\nPatente: ${patente}\nUbicación: ${espacioSeleccionado.ubicacion}\nEspacio: ${espacioSeleccionado.numero}\nMonto: $${parseFloat(montoMulta).toFixed(2)}\nMotivo: ${motivoMulta}\n\n¿Confirmar la multa?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar Multa',
            style: 'destructive',
            onPress: () => procesarMulta()
          }
        ]
      );
    } else {
      // Visitante - diferenciar entre estacionamiento y multa
      if (subTipoVisitante === 'estacionamiento') {
        // Validar estacionamiento
        if (!espacioSeleccionado) {
          Alert.alert('Error', 'Debe seleccionar un espacio de estacionamiento');
          return;
        }

        const horas = parseFloat(horasEstacionamiento);
        if (!horas || horas <= 0) {
          Alert.alert('Error', 'Ingrese una cantidad de horas válida');
          return;
        }

        const total = calcularTotal();
        
        // Confirmar pago en efectivo AL MOMENTO
        Alert.alert(
          'Confirmar Pago en Efectivo',
          `Visitante: Patente ${patente}\nEspacio: ${espacioSeleccionado.numero}\nUbicación: ${espacioSeleccionado.ubicacion}\n\nDuración: ${horasEstacionamiento}h\nTarifa: $${espacioSeleccionado.tarifaPorHora}/hora\n\nTotal a cobrar: $${total.toFixed(2)}\n\n💰 ¿Recibió el pago en efectivo?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Sí, recibí $' + total.toFixed(2),
              onPress: () => procesarVisitante(total)
            }
          ]
        );
      } else {
        // Validar multa a visitante
        if (!espacioSeleccionado) {
          Alert.alert('Error', 'Debe seleccionar la ubicación donde ocurrió la infracción');
          return;
        }

        if (!montoMultaVisitante || parseFloat(montoMultaVisitante) <= 0) {
          Alert.alert('Error', 'Ingrese un monto de multa válido');
          return;
        }

        if (!motivoMultaVisitante || motivoMultaVisitante.trim().length < 5) {
          Alert.alert('Error', 'Ingrese un motivo de la multa (mínimo 5 caracteres)');
          return;
        }

        const nombreFinal = nombreVisitante.trim() || `Visitante ${patente}`;
        
        // Confirmar multa a visitante con pago en efectivo
        Alert.alert(
          'Confirmar Multa a Visitante',
          `VISITANTE NO REGISTRADO\n\nPatente: ${patente}\nNombre: ${nombreFinal}\nUbicación: ${espacioSeleccionado.ubicacion}\nEspacio: ${espacioSeleccionado.numero}\nMonto: $${parseFloat(montoMultaVisitante).toFixed(2)}\nMotivo: ${motivoMultaVisitante}\n\nSe creará un usuario temporal y se aplicará la multa.\n\n💰 ¿Recibió el pago en efectivo de $${parseFloat(montoMultaVisitante).toFixed(2)}?`,
          [
            { text: 'No, cancelar', style: 'cancel' },
            {
              text: 'Sí, recibí el pago',
              style: 'destructive',
              onPress: () => procesarMultaVisitante()
            }
          ]
        );
      }
    }
  };

  // Procesar multa
  const procesarMulta = async (): Promise<void> => {
    setLoading(true);
    console.log('Procesando multa...');
    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa');
        setLoading(false);
        return;
      }

      // Crear la multa en Firebase
      const response = await ManualRegistrationService.createFine(
        {
          userId: usuarioEncontrado!.id,
          licensePlate: patente,
          reason: motivoMulta,
          amount: parseFloat(montoMulta),
          location: `${espacioSeleccionado!.ubicacion} - Espacio ${espacioSeleccionado!.numero}`,
          parkingSpaceId: espacioSeleccionado!.id
        },
        token
      );

      if (response.success && response.data) {
        console.log('Multa creada exitosamente');
        
        const mensaje = `Multa registrada exitosamente\n\n` +
          `Número de multa: #${response.data.numero}\n` +
          `Usuario: ${usuarioEncontrado!.nombre}\n` +
          `Email: ${usuarioEncontrado!.email}\n` +
          `Patente: ${patente}\n` +
          `Ubicación: ${espacioSeleccionado!.ubicacion}\n` +
          `Espacio: ${espacioSeleccionado!.numero}\n` +
          `Monto: $${parseFloat(montoMulta).toFixed(2)}\n` +
          `Motivo: ${motivoMulta}\n\n` +
          `La multa ha sido registrada en el sistema y el usuario puede verla en su historial.`;

        Alert.alert('Multa Registrada', mensaje, [
          { text: 'OK', onPress: resetForm }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error al registrar la multa');
      }

    } catch (error: any) {
      Alert.alert(
        'Error al Registrar Multa',
        error.message || 'Ocurrió un error al procesar la multa. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Procesar visitante
  const procesarVisitante = async (montoVisitante: number): Promise<void> => {
    setLoading(true);    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa');
        setLoading(false);
        return;
      }

      const response = await ManualRegistrationService.registerVisitor(
        {
          licensePlate: patente,
          parkingSpaceId: espacioSeleccionado!.id,
          hours: parseFloat(horasEstacionamiento)
        },
        token
      );

      if (response.success && response.data) {
        const mensaje = `Visitante registrado exitosamente\n\n` +
          `Pago recibido: $${response.data.totalAmount.toFixed(2)}\n\n` +
          `Patente: ${patente}\n` +
          `Espacio: ${response.data.espacioCodigo}\n` +
          `Ubicación: ${response.data.ubicacion}\n` +
          `Duración: ${response.data.hours}h\n` +
          `Tarifa: $${response.data.tarifaPorHora}/hora\n\n` +
          `Inicio: ${new Date(response.data.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}\n` +
          `Fin estimado: ${new Date(response.data.endTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
          `ℹEl admin puede finalizar la sesión antes si el visitante se retira temprano.`;

        Alert.alert('Registro Exitoso', mensaje, [
          { text: 'OK', onPress: resetForm }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error al registrar visitante');
      }
    } catch (error: any) {
      console.error('Error al registrar visitante:', error);
      Alert.alert(
        'Error al Registrar',
        error.message || 'Ocurrió un error al procesar el registro. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Procesar multa a visitante (crear usuario temporal + multa)
  const procesarMultaVisitante = async (): Promise<void> => {
    setLoading(true);
    console.log('Procesando multa a visitante no registrado...');
    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa');
        setLoading(false);
        return;
      }

      const nombreFinal = nombreVisitante.trim() || `Visitante ${patente}`;
      
      // Llamar al servicio que creará usuario temporal + multa
      const response = await ManualRegistrationService.createVisitorFine(
        {
          licensePlate: patente,
          visitorName: nombreFinal,
          parkingSpaceId: espacioSeleccionado!.id,
          reason: motivoMultaVisitante,
          amount: parseFloat(montoMultaVisitante),
          location: `${espacioSeleccionado!.ubicacion} - Espacio ${espacioSeleccionado!.numero}`
        },
        token
      );

      if (response.success && response.data) {
        const mensaje = `Multa a visitante registrada exitosamente\n\n` +
          `Número de multa: #${response.data.fineNumero}\n` +
          `Patente: ${patente}\n` +
          `Nombre: ${nombreFinal}\n` +
          `Ubicación: ${espacioSeleccionado!.ubicacion}\n` +
          `Espacio: ${espacioSeleccionado!.numero}\n` +
          `Monto: $${parseFloat(montoMultaVisitante).toFixed(2)}\n` +
          `Motivo: ${motivoMultaVisitante}\n\n` +
          `Pagado en efectivo\n` +
          `Se creó un usuario temporal y la multa fue registrada.`;

        Alert.alert('Multa Registrada', mensaje, [
          { text: 'OK', onPress: resetForm }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error al registrar la multa');
      }
    } catch (error: any) {
      Alert.alert(
        'Error al Registrar Multa',
        error.message || 'Ocurrió un error al procesar la multa. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setPatente('');
    setPatenteValidada(false);
    setEspacioSeleccionado(null);
    setUsuarioEncontrado(null);
    setMontoMulta('');
    setMotivoMulta('');
    setHorasEstacionamiento('2');
    setNombreVisitante(''); // ← Limpiar multa visitante
    setMontoMultaVisitante(''); // ← Limpiar multa visitante
    setMotivoMultaVisitante(''); // ← Limpiar multa visitante
    setLoading(false);
    
    // Recargar espacios
    loadAvailableSpaces();
  };

  // Render
  return (
    <Container>
      <AppHeader
        title="Registro Manual"
        subtitle="Multas y visitantes"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />

      <ContentScrollView showsVerticalScrollIndicator={false}>
        {/* Selector de tipo de registro */}
        <UserTypeSelector>
          <UserTypeButton
            selected={tipoRegistro === 'multa'}
            onPress={() => handleTipoRegistroChange('multa')}
          >
            <UserTypeText selected={tipoRegistro === 'multa'}>
              Multa
            </UserTypeText>
          </UserTypeButton>

          <UserTypeButton
            selected={tipoRegistro === 'visitante'}
            onPress={() => handleTipoRegistroChange('visitante')}
          >
            <UserTypeText selected={tipoRegistro === 'visitante'}>
              Visitante
            </UserTypeText>
          </UserTypeButton>
        </UserTypeSelector>

        {/* Info según tipo */}
        <InfoCard>
          <InfoText>
            {tipoRegistro === 'multa'
              ? 'Buscar usuario registrado por patente para aplicar una multa.'
              : subTipoVisitante === 'estacionamiento'
              ? 'Registrar estacionamiento de visitante. Cobrar en efectivo al momento.'
              : 'Multar a un visitante no registrado. Se creará un registro temporal con la patente.'}
          </InfoText>
        </InfoCard>

        {/* Sub-selector para visitantes */}
        {tipoRegistro === 'visitante' && (
          <UserTypeSelector>
            <UserTypeButton
              selected={subTipoVisitante === 'estacionamiento'}
              onPress={() => setSubTipoVisitante('estacionamiento')}
            >
              <UserTypeText selected={subTipoVisitante === 'estacionamiento'}>
                Estacionar
              </UserTypeText>
            </UserTypeButton>

            <UserTypeButton
              selected={subTipoVisitante === 'multa'}
              onPress={() => setSubTipoVisitante('multa')}
            >
              <UserTypeText selected={subTipoVisitante === 'multa'}>
                Multar
              </UserTypeText>
            </UserTypeButton>
          </UserTypeSelector>
        )}

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

        {/* FORMULARIO PARA MULTAS */}
        {tipoRegistro === 'multa' && (
          <>
            {usuarioEncontrado && (
              <UserFoundCard usuario={usuarioEncontrado} />
            )}

            {usuarioEncontrado && (
              <>
                <SectionTitle>Ubicación de la Infracción</SectionTitle>
                
                <LocationCard 
                  espacioSeleccionado={espacioSeleccionado}
                  onLocationPress={() => setShowEspaciosModal(true)}
                />

                <FormContainer paddingHorizontal={20}>
                  <InputField
                    label="Monto de la Multa *"
                    iconName="cash-outline"
                    placeholder="500"
                    value={montoMulta}
                    onChangeText={setMontoMulta}
                    keyboardType="numeric"
                  />

                  <InputField
                    label="Motivo de la Multa *"
                    iconName="document-text-outline"
                    placeholder="Estacionamiento indebido, exceso de tiempo, etc."
                    value={motivoMulta}
                    onChangeText={setMotivoMulta}
                    multiline
                    numberOfLines={3}
                  />
                </FormContainer>
              </>
            )}
          </>
        )}

        {/* FORMULARIO PARA VISITANTES */}
        {tipoRegistro === 'visitante' && (
          <>
            {/* ESTACIONAMIENTO DE VISITANTE */}
            {subTipoVisitante === 'estacionamiento' && (
              <>
                <LocationCard 
                  espacioSeleccionado={espacioSeleccionado}
                  onLocationPress={() => setShowEspaciosModal(true)}
                />

                <SectionTitle>Duración del Estacionamiento</SectionTitle>
                
                <FormContainer paddingHorizontal={20}>
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
                      Pago en efectivo al momento del registro
                    </InfoText>
                    <InfoText style={{ marginTop: 5, fontStyle: 'italic' }}>
                      El admin puede finalizar antes si se retira temprano
                    </InfoText>
                  </InfoCard>
                )}
              </>
            )}

            {/* MULTA A VISITANTE */}
            {subTipoVisitante === 'multa' && (
              <>
                <SectionTitle>Datos del Visitante</SectionTitle>
                
                <FormContainer paddingHorizontal={20}>
                  <InputField
                    label="Nombre del Visitante (Opcional)"
                    iconName="person-outline"
                    placeholder="Ej: Juan Pérez"
                    value={nombreVisitante}
                    onChangeText={setNombreVisitante}
                  />
                </FormContainer>

                <SectionTitle>Ubicación de la Infracción</SectionTitle>
                
                <LocationCard 
                  espacioSeleccionado={espacioSeleccionado}
                  onLocationPress={() => setShowEspaciosModal(true)}
                />

                <FormContainer paddingHorizontal={20}>
                  <InputField
                    label="Monto de la Multa *"
                    iconName="cash-outline"
                    placeholder="500"
                    value={montoMultaVisitante}
                    onChangeText={setMontoMultaVisitante}
                    keyboardType="numeric"
                  />

                  <InputField
                    label="Motivo de la Multa *"
                    iconName="document-text-outline"
                    placeholder="Estacionamiento indebido, exceso de tiempo, etc."
                    value={motivoMultaVisitante}
                    onChangeText={setMotivoMultaVisitante}
                    multiline
                    numberOfLines={3}
                  />
                </FormContainer>

                <InfoCard>
                  <InfoText style={{ fontWeight: 'bold' }}>
                    Multa a visitante no registrado
                  </InfoText>
                  <InfoText style={{ marginTop: 5 }}>
                    Se creará un usuario temporal con:
                    {'\n'}• Patente: {patente || '[patente]'}
                    {'\n'}• Nombre: {nombreVisitante || 'Visitante ' + patente}
                    {'\n'}• Email: visitante_{patente.toLowerCase()}@temp.com
                  </InfoText>
                </InfoCard>
              </>
            )}
          </>
        )}

        <ActionsContainer>
          <ActionButton onPress={() => navigation.goBack()}>
            <ActionButtonText>Cancelar</ActionButtonText>
          </ActionButton>
          <ActionButton primary onPress={handleRegistrar} disabled={loading}>
            <ActionButtonText>
              {loading 
                ? 'Procesando...' 
                : tipoRegistro === 'multa' 
                ? 'Registrar Multa' 
                : subTipoVisitante === 'estacionamiento'
                ? 'Registrar Estacionamiento'
                : 'Registrar Multa a Visitante'}
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
        {/* Filtro de ubicación */}
        {ubicacionesFiltro.length > 1 && (
          <View style={{ marginBottom: 15 }}>
            <RNText style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>
              Filtrar por ubicación:
            </RNText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
            >
              <TouchableOpacity
                style={[
                  styles.filtroUbicacion,
                  ubicacionSeleccionadaFiltro === 'todas' && styles.filtroUbicacionActivo
                ]}
                onPress={() => handleFiltrarPorUbicacion('todas')}
              >
                <RNText style={[
                  styles.filtroUbicacionTexto,
                  ubicacionSeleccionadaFiltro === 'todas' && styles.filtroUbicacionTextoActivo
                ]}>
                  Todas ({espaciosOriginales.length})
                </RNText>
              </TouchableOpacity>
              
              {ubicacionesFiltro.map((ubicacion) => {
                const count = espaciosOriginales.filter(e => e.ubicacion === ubicacion).length;
                return (
                  <TouchableOpacity
                    key={ubicacion}
                    style={[
                      styles.filtroUbicacion,
                      ubicacionSeleccionadaFiltro === ubicacion && styles.filtroUbicacionActivo
                    ]}
                    onPress={() => handleFiltrarPorUbicacion(ubicacion)}
                  >
                    <RNText 
                      style={[
                        styles.filtroUbicacionTexto,
                        ubicacionSeleccionadaFiltro === ubicacion && styles.filtroUbicacionTextoActivo
                      ]}
                      numberOfLines={1}
                    >
                      {ubicacion.length > 25 ? ubicacion.substring(0, 25) + '...' : ubicacion} ({count})
                    </RNText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ModalSpacePrice>${espacio.tarifaPorHora}/hora</ModalSpacePrice>
                {espacio.distancia !== undefined && (
                  <RNText style={{ fontSize: 11, color: '#4CAF50', fontWeight: '600' }}>
                    {espacio.distancia < 1 
                      ? `${(espacio.distancia * 1000).toFixed(0)}m` 
                      : `${espacio.distancia.toFixed(1)}km`}
                  </RNText>
                )}
              </View>
            </ModalSpaceItem>
          ))
        )}
      </AppModal>
    </Container>
  );
};

export default RegistroManualScreen;
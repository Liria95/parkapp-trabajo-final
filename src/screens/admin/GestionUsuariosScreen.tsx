import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Componentes reutilizables
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../forms/SearchBar';
import FilterButtons from '../../forms/FilterButtons';
import ResponsiveGrid from '../../components/grids/ResponsiveGrid';
import UserDetailCard from '../../components/cards/UserDetailCard';
import AppModal from '../../components/common/AppModal';
import FormContainer from '../../forms/FormContainer';
import InputField from '../../forms/InputField';
import AuthButton from '../../components/auth/AuthButton';
import { Container } from '../../components/shared/StyledComponents';
import UserHistorialModal from '../../components/modals/UserHistorialModal';


// Hooks
import { useFormValidation } from '../../forms/useFormValidation';

// Tipos
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminDashboard: undefined;
  Infracciones: undefined;
  GestionUsuarios: undefined;
  RegistroManual: undefined;
};

type GestionUsuariosNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GestionUsuarios'
>;

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  patente: string;
  saldo: number;
  telefono: string;
  estado: 'activo' | 'inactivo';
  ubicacionActual?: string;
  fechaRegistro: string;
  ultimaActividad: string;
}

const GestionUsuariosScreen: React.FC = () => {
  const navigation = useNavigation<GestionUsuariosNavigationProp>();
  
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHistorialModal, setShowHistorialModal] = useState<boolean>(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    patente: '',
    telefono: '',
    saldoInicial: '',
  });

  const { errors, validateForm, clearError } = useFormValidation();

  // Mock data usuarios
  const [usuarios] = useState<Usuario[]>([
    {
      id: '1',
      nombre: 'JUAN PÉREZ',
      email: 'juan.perez@email.com',
      patente: 'ABC123',
      saldo: 1250.00,
      telefono: '+54 9 11 1234-5678',
      estado: 'activo',
      ubicacionActual: 'AV. SAN MARTÍN',
      fechaRegistro: '15/01/2025',
      ultimaActividad: 'Hace 5 minutos',
    },
    {
      id: '2',
      nombre: 'MARÍA GARCÍA',
      email: 'maria.garcia@email.com',
      patente: 'XYZ789',
      saldo: 850.00,
      telefono: '+54 9 11 8765-4321',
      estado: 'inactivo',
      fechaRegistro: '12/01/2025',
      ultimaActividad: 'Hace 2 horas',
    },
  ]);

  // Configuración de filtros
  const filtros = [
    { id: 'todos', label: 'Todos' },
    { id: 'activo', label: 'Activos' },
    { id: 'inactivo', label: 'Inactivos' },
  ];

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchEstado = filtroEstado === 'todos' || usuario.estado === filtroEstado;
    const matchBusqueda = searchQuery === '' || 
      usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.patente.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchEstado && matchBusqueda;
  });

  const handleInputChange = (field: string, value: string): void => {
    setNuevoUsuario(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleAddUserMenu = () => {
    Alert.alert(
      'Registrar Usuario',
      'Selecciona el método de registro',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Registro Manual', 
          onPress: () => navigation.navigate('RegistroManual') 
        },
        { 
          text: 'Formulario Completo', 
          onPress: () => setShowModal(true) 
        }
      ]
    );
  };

  const handleCrearUsuario = async (): Promise<void> => {
    const isValid = validateForm(nuevoUsuario, {
      nombre: { required: true, minLength: 2 },
      email: { required: true, email: true },
      patente: { required: true, minLength: 6 },
      telefono: { required: true, phone: true },
    });

    if (isValid) {
      setLoading(true);
      
      // Simular creación
      setTimeout(() => {
        Alert.alert(
          'Usuario Creado',
          `Usuario ${nuevoUsuario.nombre} registrado exitosamente`,
          [{ text: 'OK', onPress: () => setShowModal(false) }]
        );
        
        setNuevoUsuario({ nombre: '', email: '', patente: '', telefono: '', saldoInicial: '' });
        setLoading(false);
      }, 1000);
    }
  };

  const handleVerHistorial = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowHistorialModal(true);
  };

  return (
    <Container>
      <AppHeader
        title="Gestión de Usuarios"
        subtitle="Administrar usuarios del sistema"
        onBackPress={() => navigation.goBack()}
        onRightPress={handleAddUserMenu}
        rightIconName="person-add"
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por patente/email/nombre"
      />

      <FilterButtons
        filters={filtros}
        activeFilter={filtroEstado}
        onFilterPress={setFiltroEstado}
      />

      <ResponsiveGrid>
        {usuariosFiltrados.map(usuario => (
          <UserDetailCard
            key={usuario.id}
            usuario={usuario}
            onPress={handleVerHistorial}
          />
        ))}
      </ResponsiveGrid>

      {/* Modal Crear Usuario */}
      <AppModal
        visible={showModal}
        title="Registrar Usuario Manualmente"
        onClose={() => setShowModal(false)}
      >
        <FormContainer>
          <InputField
            label="Nombre completo"
            iconName="person-outline"
            placeholder="Juan Pérez"
            value={nuevoUsuario.nombre}
            onChangeText={(text) => handleInputChange('nombre', text)}
            error={errors.nombre}
          />

          <InputField
            label="Email"
            iconName="mail-outline"
            placeholder="juan@email.com"
            value={nuevoUsuario.email}
            onChangeText={(text) => handleInputChange('email', text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Patente"
            iconName="car-outline"
            placeholder="ABC123"
            value={nuevoUsuario.patente}
            onChangeText={(text) => handleInputChange('patente', text.toUpperCase())}
            error={errors.patente}
            autoCapitalize="characters"
            maxLength={6}
          />

          <InputField
            label="Teléfono"
            iconName="call-outline"
            placeholder="+54 9 11 1234-5678"
            value={nuevoUsuario.telefono}
            onChangeText={(text) => handleInputChange('telefono', text)}
            error={errors.telefono}
            keyboardType="phone-pad"
          />

          <InputField
            label="Saldo inicial (opcional)"
            iconName="cash-outline"
            placeholder="1000"
            value={nuevoUsuario.saldoInicial}
            onChangeText={(text) => handleInputChange('saldoInicial', text)}
            keyboardType="numeric"
          />

          <AuthButton
            title="REGISTRAR USUARIO"
            onPress={handleCrearUsuario}
            loading={loading}
          />
        </FormContainer>
      </AppModal>

      {/* Modal Historial Usuario */}
      <AppModal
        visible={showHistorialModal}
        title={`Historial - ${usuarioSeleccionado?.nombre}`}
        onClose={() => setShowHistorialModal(false)}
      >
        {usuarioSeleccionado && (
          <UserHistorialModal usuario={usuarioSeleccionado} />
        )}
      </AppModal>
    </Container>
  );
};

export default GestionUsuariosScreen;
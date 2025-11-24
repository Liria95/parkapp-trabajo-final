import React, { useState, useEffect, useContext } from 'react';
import { Alert, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Componentes reutilizables
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../forms/SearchBar';
import FilterButtons from '../../forms/FilterButtons';
import ResponsiveGrid from '../../components/grids/ResponsiveGrid';
import UserDetailCard from '../../components/cards/UserDetailCard';
import AppModal from '../../components/common/AppModal';
import { Container } from '../../components/shared/StyledComponents';
import UserHistorialModal from '../../components/modals/UserHistorialModal';

// Servicios
import { AdminUserService, UsuarioParaAdmin } from '../../services/AdminUserService';
import { AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';

// Tipos
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminDashboard: undefined;
  Infracciones: undefined;
  GestionUsuarios: undefined;
  RegistroManual: undefined;
};

type GestionUsuariosNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GestionUsuarios'>;

const GestionUsuariosScreen: React.FC = () => {
  const navigation = useNavigation<GestionUsuariosNavigationProp>();
  const authContext = useContext(AuthContext);
  
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHistorialModal, setShowHistorialModal] = useState<boolean>(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioParaAdmin | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  
  const [usuarios, setUsuarios] = useState<UsuarioParaAdmin[]>([]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const token = authContext?.state.token;
    
    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      setLoadingUsers(false);
      return;
    }

    try {
      setLoadingUsers(true);
      console.log('Cargando usuarios desde Firebase...');
      
      const result = await AdminUserService.getAllUsers(token);
      
      if (result.success && result.users) {
        console.log('Usuarios cargados:', result.users.length);
        setUsuarios(result.users);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron cargar los usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

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
      usuario.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchEstado && matchBusqueda;
  });

  const handleAddUserManual = () => {
    navigation.navigate('RegistroManual');
  };

  const handleVerHistorial = (usuario: UsuarioParaAdmin) => {
    setUsuarioSeleccionado(usuario);
    setShowHistorialModal(true);
  };

  if (loadingUsers) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </Container>
    );
  }

  return (
    <Container>
      <AppHeader
        title="Gestión de Usuarios"
        subtitle={`${usuarios.length} usuarios registrados`}
        onBackPress={() => navigation.goBack()}
        onRightPress={handleAddUserManual}
        rightIconName="person-add"
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por nombre o email"
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
            usuario={{
              id: usuario.id,
              nombre: usuario.nombreCompleto,
              email: usuario.email,
              patente: 'N/A',
              saldo: usuario.balance,
              telefono: usuario.phone,
              estado: usuario.estado,
              fechaRegistro: usuario.fechaRegistro,
              ultimaActividad: usuario.ultimaActividad,
            }}
            onPress={() => handleVerHistorial(usuario)}
          />
        ))}
      </ResponsiveGrid>

      {usuariosFiltrados.length === 0 && !loadingUsers && (
        <Container style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 16, color: '#666' }}>
            No se encontraron usuarios
          </Text>
        </Container>
      )}

      {/* Modal Historial Usuario */}
      <AppModal
        visible={showHistorialModal}
        title={`Historial - ${usuarioSeleccionado?.nombreCompleto}`}
        onClose={() => setShowHistorialModal(false)}
      >
        {usuarioSeleccionado && (
          <UserHistorialModal usuario={{
            nombre: usuarioSeleccionado.nombreCompleto,
            email: usuarioSeleccionado.email,
            patente: 'N/A',
            saldo: usuarioSeleccionado.balance,
            telefono: usuarioSeleccionado.phone,
            estado: usuarioSeleccionado.estado,
            fechaRegistro: usuarioSeleccionado.fechaRegistro,
            ultimaActividad: usuarioSeleccionado.ultimaActividad,
          }} />
        )}
      </AppModal>
    </Container>
  );
};

export default GestionUsuariosScreen;
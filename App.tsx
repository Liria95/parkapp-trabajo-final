import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

// Importacion pantallas AUTH
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Importacion pantallas ADMIN
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminDrawer from './src/screens/admin/AdminDrawer';
import EspaciosScreen from './src/screens/admin/EspaciosScreen';
import GestionUsuariosScreen from './src/screens/admin/GestionUsuariosScreen';
import InfraccionesScreen from './src/screens/admin/InfraccionesScreen';
import RegistroManualScreen from './src/screens/admin/RegistroManualScreen';
import AdminPanel from './src/screens/admin/AdminPanel';

// Importacion navegación de usuario
import NavegadorTabsUsuario from './src/screens/user/navegacion/NavegadorTabs';

// Context
import { AuthProvider, AuthContext } from './src/components/shared/Context/AuthContext';
import { UsuarioProvider } from './src/screens/user/contexto/UsuarioContext';
import { theme } from './src/config/theme';

// Tipos de navegación
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminDrawer: undefined;
  Espacios: undefined;
  GestionUsuarios: undefined;
  Infracciones: undefined;
  RegistroManual: undefined;
  AdminPanel: undefined;
};

export type UserStackParamList = {
  UserMain: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
const UserStack = createNativeStackNavigator<UserStackParamList>();

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${theme.colors.lightGray};
`;

const LoadingScreen = () => (
  <LoadingContainer>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </LoadingContainer>
);

const AuthNavigator = () => (
  <AuthStack.Navigator 
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ gestureEnabled: false }}
    />
    <AuthStack.Screen 
      name="Register" 
      component={RegisterScreen}
    />
  </AuthStack.Navigator>
);

//Stack para Admin con TODAS las pantallas
const AdminNavigator = () => (
  <AdminStack.Navigator 
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      animation: 'slide_from_right',
    }}
  >
    <AdminStack.Screen 
      name="AdminDashboard" 
      component={AdminDashboard}
      options={{ gestureEnabled: false }}
    />
    <AdminStack.Screen name="AdminDrawer" component={AdminDrawer} />
    <AdminStack.Screen name="Espacios" component={EspaciosScreen} />
    <AdminStack.Screen name="GestionUsuarios" component={GestionUsuariosScreen} />
    <AdminStack.Screen name="Infracciones" component={InfraccionesScreen} />
    <AdminStack.Screen name="RegistroManual" component={RegistroManualScreen} />
    <AdminStack.Screen name="AdminPanel" component={AdminPanel} />
  </AdminStack.Navigator>
);

const UserNavigator = () => (
  <UsuarioProvider>
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      <UserStack.Screen name="UserMain" component={NavegadorTabsUsuario} />
    </UserStack.Navigator>
  </UsuarioProvider>
);

const RootNavigator = () => {
  const { state } = useContext(AuthContext);

  console.log('🔍 Estado actual:', {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.user?.isAdmin,
    userName: state.user?.name || 'No user'
  });

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (!state.isAuthenticated) {
    console.log('🔓 No autenticado - Mostrando AuthNavigator');
    return <AuthNavigator />;
  }

  // Verificar is_admin (booleano) en lugar de type (string)
  if (state.user?.isAdmin === true) {
    console.log('👑 Usuario Admin detectado - Mostrando AdminNavigator');
    return <AdminNavigator />;
  } else {
    console.log('🙌 Usuario normal detectado - Mostrando UserNavigator');
    return <UserNavigator />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

// Importacion pantallas AUTH
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

// Importacion pantallas ADMIN
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminDrawer from './screens/admin/AdminDrawer';
import EspaciosScreen from './screens/admin/EspaciosScreen';
import GestionUsuariosScreen from './screens/admin/GestionUsuariosScreen';
import InfraccionesScreen from './screens/admin/InfraccionesScreen';
import RegistroManualScreen from './screens/admin/RegistroManualScreen';
import AdminPanel from './screens/admin/AdminPanel';

// Importacion navegación de usuario
import NavegadorTabsUsuario from './screens/user/navegacion/NavegadorTabs';

// Context
import { AuthProvider, AuthContext } from './components/shared/Context/AuthContext';
import { UsuarioProvider } from './screens/user/contexto/UsuarioContext';
import { colors } from './constants/colors';

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
  background-color: ${colors.lightGray};
`;

const LoadingScreen = () => (
  <LoadingContainer>
    <ActivityIndicator size="large" color={colors.primary} />
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

  console.log('Estado actual:', {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    userType: state.user?.type,
    user: state.user?.name || 'No user'
  });

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (!state.isAuthenticated) {
    return <AuthNavigator />;
  }

  if (state.user?.type === 'admin') {
    return <AdminNavigator />;
  } else {
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
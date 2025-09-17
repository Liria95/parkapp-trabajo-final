import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Componentes reutilizables
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsGrid from '../components/dashboard/StatsGrid';
import SectionCard from '../components/dashboard/SectionCard';
import ChartPlaceholder from '../components/dashboard/ChartPlaceholder';
import UserList from '../components/dashboard/UserList';
import BottomTabNavigation from '../components/navigation/BottomTabNavigation';

// Constantes
import { colors } from '../constants/colors';

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Infracciones: undefined;
  GestionUsuarios: undefined;
  Espacios: undefined;
};

type AdminDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminDashboard'
>;

interface ActiveUser {
  id: string;
  name: string;
  plate: string;
  balance: number;
  currentLocation?: string;
  status: 'active' | 'inactive';
}

interface DashboardStats {
  occupiedSpaces: number;
  freeSpaces: number;
  todayIncome: number;
  violations: number;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${colors.lightGray};
`;

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [stats] = useState<DashboardStats>({
    occupiedSpaces: 156,
    freeSpaces: 44,
    todayIncome: 24580,
    violations: 12,
  });

  const [activeUsers] = useState<ActiveUser[]>([
    { 
      id: '1', 
      name: 'JUAN PÉREZ', 
      plate: 'ABC123', 
      balance: 1250.0, 
      currentLocation: 'AV. SAN MARTÍN', 
      status: 'active' 
    },
    { 
      id: '2', 
      name: 'MARÍA GARCÍA', 
      plate: 'XYZ789', 
      balance: 850.0, 
      status: 'inactive' 
    },
  ]);

  // Configuración de estadísticas
  const statsConfig = [
    {
      id: 'occupied',
      number: stats.occupiedSpaces,
      label: 'Espacios\nOcupados',
      backgroundColor: colors.primary,
    },
    {
      id: 'free',
      number: stats.freeSpaces,
      label: 'Espacios\nLibres',
      backgroundColor: colors.green,
    },
    {
      id: 'income',
      number: `$${stats.todayIncome.toLocaleString()}`,
      label: 'Ingresos Hoy',
      backgroundColor: colors.yellow,
    },
    {
      id: 'violations',
      number: stats.violations,
      label: 'Infracciones',
      backgroundColor: colors.red,
      buttonText: 'VER',
      onPress: () => navigation.navigate('Infracciones'),
    },
  ];

  // Configuración de navegación inferior
  const tabsConfig = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      iconName: 'grid-outline',
      onPress: () => handleNavigation('dashboard'),
    },
    {
      id: 'espacios',
      label: 'ESPACIOS',
      iconName: 'car-outline',
      onPress: () => handleNavigation('espacios'),
    },
    {
      id: 'usuarios',
      label: 'USUARIOS',
      iconName: 'people-outline',
      onPress: () => handleNavigation('usuarios'),
    },
  ];

  const handleUserAction = (userId: string) => {
    Alert.alert('Ver Usuario', `Mostrar detalles del usuario ${userId}`);
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Menú', 
      'Gestión de Estacionamientos\nTransacciones y Saldo\nInfracciones'
    );
  };

  const handleNavigation = (section: string) => {
    setActiveTab(section);
    
    if (section === 'usuarios') {
      navigation.navigate('GestionUsuarios');
    } else if (section === 'espacios') {
      navigation.navigate('Espacios');
    }
  };

  return (
    <Container>
      <DashboardHeader
        title="Admin - Sistema ParkApp"
        subtitle="Dashboard General"
        onMenuPress={handleMenuPress}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <StatsGrid stats={statsConfig} />

        <SectionCard title="Gráfico de ocupación">
          <ChartPlaceholder
            iconName="bar-chart-outline"
            title="Actividad en Tiempo Real"
          />
        </SectionCard>

        <SectionCard
          title="Usuarios Activos"
          actionText="VER TODOS"
          onActionPress={() => navigation.navigate('GestionUsuarios')}
        >
          <UserList
            users={activeUsers}
            onUserAction={handleUserAction}
          />
        </SectionCard>
      </ScrollView>

      <BottomTabNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
      />
    </Container>
  );
};

export default AdminDashboard;
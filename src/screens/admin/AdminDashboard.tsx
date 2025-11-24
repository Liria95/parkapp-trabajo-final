import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

// Componentes reutilizables
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import SectionCard from '../../components/dashboard/SectionCard';
import ChartPlaceholder from '../../components/dashboard/ChartPlaceholder';
import UserList from '../../components/dashboard/UserList';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';

// Servicios
import { AdminUserService } from '../../services/AdminUserService';
import { FinesService } from '../../services/FinesService';
import { ParkingSessionService, ActiveSessionDetail } from '../../services/parkingSessionService';
import { AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';

// Theme
import { theme } from '../../config/theme';

// Tipos
type RootStackParamList = {
  AdminDashboard: undefined;
  Infracciones: undefined;
  GestionUsuarios: undefined;
  Espacios: undefined;
  AdminDrawer: undefined;
};

type AdminDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;

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
  totalSpaces: number;
  todayIncome: string;
  violations: number;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.lightGray};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const authContext = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    occupiedSpaces: 0,
    freeSpaces: 0,
    totalSpaces: 0,
    todayIncome: '0',
    violations: 0,
  });

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionDetail[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('dashboard');
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    const token = authContext?.state.token;

    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Cargando datos del dashboard admin...');

      let espaciosLibres = 0;
      let espaciosOcupados = 0;
      let espaciosTotales = 0;

      try {
        const spacesResult = await ParkingSessionService.getStats(token);
        console.log('Estadísticas de sesiones:', spacesResult);

        if (spacesResult.success && spacesResult.stats) {
          espaciosLibres = spacesResult.stats.available || 0;
          espaciosOcupados = spacesResult.stats.occupied || 0;
          espaciosTotales = spacesResult.stats.total || 0;

          if (spacesResult.activeSessions) {
            setActiveSessions(spacesResult.activeSessions);
          }
        }
      } catch (error) {
        console.error('Error al cargar espacios:', error);
      }

      const usuariosResult = await AdminUserService.getAllUsers(token);

      if (usuariosResult.success && usuariosResult.users) {
        const usuariosActivos = usuariosResult.users
          .filter(user => user.estado === 'activo')
          .slice(0, 5)
          .map(user => ({
            id: user.id,
            name: user.nombreCompleto,
            plate: 'N/A',
            balance: user.balance,
            status: user.estado as 'active' | 'inactive',
          }));

        setActiveUsers(usuariosActivos);
      }

      let ingresosHoy = 0;
      try {
        const incomeResult = await AdminUserService.getTodayIncome(token);
        if (incomeResult.success && incomeResult.income) {
          ingresosHoy = parseFloat(incomeResult.income);
        }
      } catch (error) {
        console.warn('No se pudieron cargar los ingresos del día:', error);
        ingresosHoy = 0;
      }

      let multasPendientes = 0;
      try {
        const finesResult = await FinesService.getAllFines(token);
        if (finesResult.success && finesResult.fines) {
          multasPendientes = finesResult.fines.filter(f => f.estado === 'pendiente').length;
        }
      } catch (finesError) {
        console.warn('No se pudieron cargar las infracciones:', finesError);
      }

      setStats({
        occupiedSpaces: espaciosOcupados,
        freeSpaces: espaciosLibres,
        totalSpaces: espaciosTotales,
        todayIncome: ingresosHoy.toFixed(2),
        violations: multasPendientes,
      });

      console.log('Estadísticas actualizadas:', {
        espaciosLibres,
        espaciosOcupados,
        espaciosTotales,
        ingresosHoy,
        multasPendientes
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerEspaciosOcupados = () => {
    if (activeSessions.length === 0) {
      Alert.alert('Sin espacios ocupados', 'No hay espacios ocupados en este momento');
      return;
    }

    const mensaje = activeSessions.map((session, index) => {
      const startTime = new Date(session.startTime);
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / (1000 * 60));
      const tipo = session.isVisitor ? 'Visitante' : 'Usuario';
      
      return `${index + 1}. ${session.spaceCode}\n` +
             `   Patente: ${session.licensePlate}\n` +
             `   Tipo: ${tipo}\n` +
             `   Ubicación: ${session.streetAddress}\n` +
             `   Tiempo: ${elapsed} min\n` +
             `   Tarifa: $${session.feePerHour}/h`;
    }).join('\n\n');

    Alert.alert(
      `Espacios Ocupados (${activeSessions.length})`,
      mensaje,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ir a Espacios',
          onPress: () => navigation.navigate('Espacios')
        }
      ],
      { cancelable: true }
    );
  };

  const handleVerEspaciosLibres = () => {
    const mensaje = `Espacios disponibles: ${stats.freeSpaces}\n` +
                   `Total de espacios: ${stats.totalSpaces}\n\n` +
                   `Estos espacios están listos para ser ocupados por los usuarios.`;

    Alert.alert(
      'Espacios Libres',
      mensaje,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver Todos los Espacios',
          onPress: () => navigation.navigate('Espacios')
        }
      ]
    );
  };

  const statsConfig = [
    {
      id: 'occupied',
      number: stats.occupiedSpaces,
      label: 'Espacios\nOcupados',
      backgroundColor: theme.colors.primary,
      buttonText: 'VER',
      onPress: handleVerEspaciosOcupados,
    },
    {
      id: 'free',
      number: stats.freeSpaces,
      label: 'Espacios\nLibres',
      backgroundColor: theme.colors.success,
      buttonText: 'VER',
      onPress: handleVerEspaciosLibres,
    },
    {
      id: 'income',
      number: `$${parseFloat(stats.todayIncome).toLocaleString()}`,
      label: 'Ingresos Hoy',
      backgroundColor: theme.colors.warning,
    },
    {
      id: 'violations',
      number: stats.violations,
      label: 'Infracciones',
      backgroundColor: theme.colors.danger,
      buttonText: 'VER',
      onPress: () => navigation.navigate('Infracciones'),
    },
  ];

  const tabsConfig = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      iconName: 'grid-outline',
      onPress: () => handleNavigation('dashboard'),
    },
    {
      id: 'admindrawer',
      label: 'ADMIN',
      iconName: 'briefcase-outline',
      onPress: () => handleNavigation('admindrawer'),
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
    const user = activeUsers.find(u => u.id === userId);
    
    if (!user) {
      Alert.alert('Error', 'Usuario no encontrado');
      return;
    }

    Alert.alert(
      user.name,
      `Saldo: $${user.balance.toFixed(2)}\nEstado: ${user.status === 'active' ? 'Activo' : 'Inactivo'}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ir a Gestión de Usuarios',
          onPress: () => {
            navigation.navigate('GestionUsuarios');
          }
        }
      ]
    );
  };

  const handleNavigation = (section: string) => {
    if (section === activeTab) {
      return;
    }

    setActiveTab(section);
    switch (section) {
      case 'usuarios':
        navigation.navigate('GestionUsuarios');
        break;
      case 'espacios':
        navigation.navigate('Espacios');
        break;
      case 'admindrawer':
        navigation.navigate('AdminDrawer');
        break;
      default:
        console.warn(`Sección desconocida: ${section}`);
    }
  };

  if (loading) {
    return (
      <Container>
        <DashboardHeader
          title="Admin - Sistema ParkApp"
          subtitle="Dashboard General"
        />
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.gray }}>
            Cargando dashboard...
          </Text>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <DashboardHeader
        title="Admin - Sistema ParkApp"
        subtitle="Dashboard General"
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
import { theme } from '../../config/theme';
import { StyleSheet, View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { getDynamicSpacing, getResponsiveSize } from '../../utils/ResponsiveUtils';

// Componentes reutilizables
import { Container } from '../../components/shared/StyledComponents';
import StatsGrid from '../../components/dashboard/StatsGrid';
import InfoCard from '../../components/historial/InfoCard';
import { AUTH_ACTIONS, AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';

// Servicios
import { AdminUserService } from '../../services/AdminUserService';
import { FinesService } from '../../services/FinesService';
import { ParkingSpacesService } from '../../services/ParkingSpacesService';

// navegación
type RootStackParamList = {
  AdminDashboard: undefined;
  Historial: undefined;
};

type HistorialNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Historial'>;

interface User {
  id: string;
  nombre: string;
  email: string;
  saldo: number;
  estado: 'activo' | 'inactivo';
  ultimaActividad: string;
  multasPendientes?: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalBalance: string;
  averageBalance: string;
  activeAdmins?: number;
  pendingFines?: number;
  occupiedSpaces?: number;
  freeSpaces?: number;
  totalSpaces?: number;
}

interface Fine {
  id: string;
  userId: string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  monto: number;
}

interface UserFromService {
  id: string;
  nombreCompleto: string;
  email: string;
  balance: number;
  estado: 'activo' | 'inactivo';
  ultimaActividad: string;
}

export default function Historial() {
  const navigation = useNavigation<HistorialNavigationProp>();
  const authContext = useContext(AuthContext);

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<User | null>(null);
  
  const [historyData, setHistoryData] = useState({
    yesterday: { users: 0, revenue: 0 },
    lastWeek: { users: 0, revenue: 0 },
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = authContext?.state.token;

    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Cargando datos del dashboard...');

      const [usuariosResult, statsResult, finesResult, historyResult, spacesResult] = await Promise.all([
        AdminUserService.getAllUsers(token),
        AdminUserService.getStats(token),
        FinesService.getAllFines(token),
        AdminUserService.getHistoryStats(token),
        ParkingSpacesService.getStats(token),
      ]);

      if (usuariosResult.success && usuariosResult.users) {
        console.log('Usuarios cargados:', usuariosResult.users.length);
        
        const multasPorUsuario = new Map<string, number>();
        if (finesResult.success && finesResult.fines) {
          finesResult.fines.forEach((fine: Fine) => {
            if (fine.estado === 'pendiente') {
              const count = multasPorUsuario.get(fine.userId) || 0;
              multasPorUsuario.set(fine.userId, count + 1);
            }
          });
        }
        
        const usuariosFormateados = usuariosResult.users.map((user: UserFromService) => ({
          id: user.id,
          nombre: user.nombreCompleto,
          email: user.email,
          saldo: user.balance,
          estado: user.estado,
          ultimaActividad: user.ultimaActividad,
          multasPendientes: multasPorUsuario.get(user.id) || 0,
        }));

        setUsuarios(usuariosFormateados);
      }

      if (statsResult.success && statsResult.stats) {
        console.log('Estadísticas cargadas:', statsResult.stats);
        
        let pendingFines = 0;
        if (finesResult.success && finesResult.fines) {
          pendingFines = finesResult.fines.filter((f: Fine) => f.estado === 'pendiente').length;
        }

        let occupiedSpaces = 0;
        let freeSpaces = 0;
        let totalSpaces = 0;

        if (spacesResult.success && spacesResult.stats) {
          occupiedSpaces = spacesResult.stats.occupied || 0;
          freeSpaces = spacesResult.stats.available || 0;
          totalSpaces = spacesResult.stats.total || 0;
          console.log('Estadísticas de espacios:', spacesResult.stats);
        }
        
        setStats({
          ...statsResult.stats,
          pendingFines,
          occupiedSpaces,  
          freeSpaces,     
          totalSpaces,    
        });
      }

      if (historyResult.success && historyResult.history) {
        console.log('Histórico cargado:', historyResult.history);
        setHistoryData({
          yesterday: {
            users: historyResult.history.yesterday.activeUsers,
            revenue: parseFloat(historyResult.history.yesterday.revenue),
          },
          lastWeek: {
            users: historyResult.history.lastWeek.activeUsers,
            revenue: parseFloat(historyResult.history.lastWeek.revenue),
          },
        });
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const historyStats = [
    {
      id: 'yesterday-occupancy',
      label: 'Ocupación Ayer',
      value: historyData.yesterday.users > 0 ? `${historyData.yesterday.users}` : '-',
      trend: stats ? `${((historyData.yesterday.users - stats.activeUsers) / stats.activeUsers * 100).toFixed(0)}%` : '0%',
    },
    {
      id: 'yesterday-revenue',
      label: 'Ingresos Ayer',
      value: historyData.yesterday.revenue > 0 ? `$${historyData.yesterday.revenue.toFixed(0)}` : '$0',
      trend: stats ? `${((historyData.yesterday.revenue - parseFloat(stats.totalBalance)) / parseFloat(stats.totalBalance) * 100).toFixed(0)}%` : '0%',
    },
    {
      id: 'last-week-occupancy',
      label: 'Ocupación Semana Pasada',
      value: historyData.lastWeek.users > 0 ? `${historyData.lastWeek.users}` : '-',
      trend: stats ? `${((historyData.lastWeek.users - stats.activeUsers) / stats.activeUsers * 100).toFixed(0)}%` : '0%',
    },
    {
      id: 'last-week-revenue',
      label: 'Ingresos Semana Pasada',
      value: historyData.lastWeek.revenue > 0 ? `$${historyData.lastWeek.revenue.toFixed(0)}` : '$0',
      trend: stats ? `${((historyData.lastWeek.revenue - parseFloat(stats.totalBalance)) / parseFloat(stats.totalBalance) * 100).toFixed(0)}%` : '0%',
    },
  ];

  const getCardColor = (label: string) => {
    if (label.includes('Ocupación')){
      return theme.colors.primary;
    }
    if (label.includes('Ingresos')){
      return theme.colors.warning;
    }
    return theme.colors.gray;
  };

  const statsConfig = stats ? [
    {
      id: 'ocupacion',
      number: stats.occupiedSpaces || 0,
      label: 'Ocupación Actual',
      backgroundColor: theme.colors.primary,
    },
    {
      id: 'ingresos',
      number: `$${stats.totalBalance}`,
      label: 'Ingresos Hoy',
      backgroundColor: theme.colors.success,
    },
    {
      id: 'multas',
      number: stats.pendingFines || 0,
      label: 'Multas Pendientes',
      backgroundColor: theme.colors.danger,
    },
    {
      id: 'admins',
      number: stats.activeAdmins || 0,
      label: 'Admins Activos',
      backgroundColor: theme.colors.warning,
    },
  ] : [];

  const handleUsuarioPress = (usuario: User) => {
    setUsuarioSeleccionado(usuario);
    Alert.alert(
      usuario.nombre,
      `Email: ${usuario.email}\nSaldo: $${usuario.saldo}\nEstado: ${usuario.estado}\nÚltima actividad: ${usuario.ultimaActividad}\nMultas pendientes: ${usuario.multasPendientes || 0}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Ver más', onPress: () => console.log('Ver más detalles') }
      ]
    );
  };

  const getUserColor = (estado: User['estado']) => {
    switch (estado) {
      case 'activo': return theme.colors.success;
      case 'inactivo': return theme.colors.gray;
      default: return theme.colors.gray;
    }
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.gray }}>
          Cargando dashboard...
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      {stats && <StatsGrid stats={statsConfig} />}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {historyStats.map((item) => (
            <InfoCard
              key={item.id}
              label={item.label}
              value={item.value}
              trend={item.trend}
              backgroundColor={getCardColor(item.label)}
            />
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Usuarios HOY</Text>
      
      {usuarios.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.gray }}>No hay usuarios registrados</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          keyExtractor={(usuario) => usuario.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleUsuarioPress(item)}
            >
              <View style={[styles.userAvatar, { backgroundColor: getUserColor(item.estado) }]}>
                <Text style={styles.userAvatarText}>{item.nombre[0]}</Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.nombre}</Text>
                <Text style={styles.userDetails}>
                  {item.estado.toUpperCase()} | Multas: {item.multasPendientes || 0}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  section:{
    marginBottom: getDynamicSpacing(20),
  },
  sectionTitle:{
    textAlign: 'center',
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: getDynamicSpacing(10),
    marginTop: 15
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.dark,
  },
  userDetails: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 2,
  },
});
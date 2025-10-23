import { theme } from '../../config/theme' ;
import { StyleSheet, View, Text, TouchableOpacity, Alert, FlatList} from "react-native";
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { getDynamicSpacing, getResponsiveSize } from '../../utils/ResponsiveUtils';


// Componentes reutilizables
import { Container } from '../../components/shared/StyledComponents';
import AppHeader from '../../components/common/AppHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import InfoCard from '../../components/adminpanel/InfoCard';
import { AUTH_ACTIONS, AuthContext } from '../../components/shared/Context/AuthContext';


// navegación
type RootStackParamList = {
  AdminDashboard: undefined;
  AdminPanel: undefined;
};

type AdminPanelNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminPanel'>;

// Styled components
const Section = styled.View`
  margin-bottom: ${getDynamicSpacing(20)}px;
`;

const SectionTitle = styled.Text`
  text-align: center;
  font-size: ${getResponsiveSize(18)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  margin-bottom: ${getDynamicSpacing(10)}px;
`;

const UserRow = styled.View`
  padding: ${getDynamicSpacing(10)}px;
  border-bottom-width: 1px;
  border-color: ${theme.colors.lightGray};
`;

const UserText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  color: ${theme.colors.dark};
`;

interface User {
  id: string;
  nombre: string;
  tipo: 'frecuente' | 'nuevo' | 'moroso';
  multas: number;
}

export default function AdminPanel () {

    const navigation = useNavigation<AdminPanelNavigationProp>();


    // Mock datos
    const [stats, setStats] = useState({
        ocupacion: 92,
        ingresosHoy: 24580,
        multasPendientes: 12,
        adminsActivos: 3,
    });

    const [comparativa, setComparativa] = useState({
        ingresos: '+12%',
        ocupacion: '-3%',
        multas: '+5%',
    });

    const [usuarios] = useState<User[]>([
        { id: '1', nombre: 'Juan Pérez', tipo: 'frecuente', multas: 0 },
        { id: '2', nombre: 'María García', tipo: 'moroso', multas: 3 },
        { id: '3', nombre: 'Ana López', tipo: 'nuevo', multas: 0 },
        { id: '4', nombre: 'Carlos Gómez', tipo: 'moroso', multas: 5 },
    ]);

    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<User | null>(null);

    // Alerta si ocupación supera 95%
    useEffect(() => {
        if (stats.ocupacion > 95) {
            Alert.alert(
            '⚠️ Alerta de Ocupación',
            'La ocupación ha superado el 95%. Considere liberar espacios o ajustar tarifas.'
        );
        }
    }, [stats.ocupacion]);

    //Historial ingresos y ocupaciones anteriores
    const historyStats = [
      {
        id: 'yesterday-occupancy',
        label: 'Ocupación Ayer',
        value: '88%',
        trend: '-4%',
      },
      {
        id: 'yesterday-revenue',
        label: 'Ingresos Ayer',
        value: '$20.500',
        trend: '+2%',
      },
      {
        id: 'last-week-occupancy',
        label: 'Ocupación Miércoles Pasado',
        value: '91%',
        trend: '+1%',
      },
      {
        id: 'last-week-revenue',
        label: 'Ingresos Miércoles Pasado',
        value: '$21.700',
        trend: '-3%',
      },
    ];

    // Configuración de StatsGrid
    const statsConfig = [
      {
          id: 'ocupacion',
          number: `${stats.ocupacion}%`,
          label: 'Ocupación Actual',
          backgroundColor: theme.colors.primary,
      },
      {
          id: 'ingresos',
          number: `$${stats.ingresosHoy}`,
          label: 'Ingresos Hoy',
          backgroundColor: theme.colors.success,
      },
      {
          id: 'multas',
          number: stats.multasPendientes,
          label: 'Multas Pendientes',
          backgroundColor: theme.colors.danger,
      },
      {
          id: 'admins',
          number: stats.adminsActivos,
          label: 'Admins Activos',
          backgroundColor: theme.colors.warning,
      },
    ];

    const handleUsuarioPress = (usuario: User) => {
        setUsuarioSeleccionado(usuario);
        Alert.alert(`Ver usuario ${usuario.nombre}`, 'Detalle del usuario')
    };

    const getUserColor = (tipo: User['tipo']) => {
        switch(tipo) {
            case 'frecuente': return theme.colors.success;
            case 'nuevo': return theme.colors.primary;
            case 'moroso': return theme.colors.danger;
            default: return theme.colors.gray;
        }
    }

    return (
        <Container>
            <StatsGrid stats={statsConfig} />
        
            {/* Histórico de días anteriores */}
            <Section>
              <SectionTitle>Histórico reciente</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                {historyStats.map((item) => (
                  <InfoCard
                    key={item.id}
                    label={item.label}
                    value={item.value}
                    trend={item.trend}
                    backgroundColor={theme.colors.lightGray}
                  />
                ))}
              </View>
            </Section>
            
            <SectionTitle>Usuarios HOY</SectionTitle>
            <FlatList
              data={usuarios}
              refreshing={true}
              keyExtractor={(usuario) => usuario.id}
              contentContainerStyle={{ paddingHorizontal: 16 }} //igual que StatsGrid
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => handleUsuarioPress(item)}
                >
                  <View style={[styles.userAvatar, { backgroundColor: getUserColor(item.tipo) }]}>
                    <Text style={styles.userAvatarText}>{item.nombre[0]}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.userDetails}>
                      {item.tipo.toUpperCase()} | Multas: {item.multas}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />     
                
            
        </Container>
    )
}

const styles = StyleSheet.create({
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f8f8',
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      elevation: 3, // para Android sombra
      shadowColor: '#000', // para iOS sombra
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
    },
});
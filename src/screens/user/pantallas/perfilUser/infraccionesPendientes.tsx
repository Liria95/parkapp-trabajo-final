import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../../config/theme';
import { AuthContext } from '../../../../components/shared/Context/AuthContext/AuthContext';
import { FinesService } from '../../../../services/FinesService';

interface Infraccion {
  id: string;
  numero: string;
  reason: string;
  amount: number;
  location: string;
  status: string;
  issuedAt: string;
}

export default function InfraccionesPendientes() {
  const navigation = useNavigation();
  const { state } = useContext(AuthContext);
  const [infracciones, setInfracciones] = useState<Infraccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarInfracciones();
  }, []);

  const cargarInfracciones = async () => {
    if (!state.token || !state.user?.id) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    try {
      setLoading(true);
      const result = await FinesService.getUserFines(state.user.id, state.token!);

      if (result.success && result.fines) {
        // Filtrar solo las pendientes
        const pendientes = result.fines.filter((f: Infraccion) => f.status === 'pendiente');
        setInfracciones(pendientes);
      } else {
        console.error('Error al cargar infracciones:', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las infracciones');
    } finally {
      setLoading(false);
    }
  };

  const handlePagarMulta = async (infraccionId: string, monto: number) => {
    if (!state.token) return;

    Alert.alert(
      'Pagar Infracción',
      `¿Deseas pagar esta infracción de $${monto}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: async () => {
            try {
              const result = await FinesService.payFine(infraccionId, state.token!);

              if (result.success) {
                Alert.alert('Éxito', 'Infracción pagada correctamente');
                cargarInfracciones(); // Recargar lista
              } else {
                Alert.alert('Error', result.message || 'No se pudo pagar la infracción');
              }
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al procesar el pago');
            }
          }
        }
      ]
    );
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Infracciones Pendientes</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Infracciones Pendientes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {infracciones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            <Text style={styles.emptyTitle}>¡Sin infracciones!</Text>
            <Text style={styles.emptyText}>No tienes infracciones pendientes</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryAmount}>
                ${infracciones.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
              </Text>
              <Text style={styles.summaryText}>{infracciones.length} infracción(es) pendiente(s)</Text>
            </View>

            {infracciones.map((infraccion) => (
              <View key={infraccion.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>#{infraccion.numero}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: theme.colors.warning }]}>
                      <Text style={styles.statusText}>PENDIENTE</Text>
                    </View>
                  </View>
                  <Text style={styles.amount}>${infraccion.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Ionicons name="alert-circle" size={20} color={theme.colors.gray} />
                    <Text style={styles.infoLabel}>Motivo:</Text>
                    <Text style={styles.infoValue}>{infraccion.reason}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={20} color={theme.colors.gray} />
                    <Text style={styles.infoLabel}>Lugar:</Text>
                    <Text style={styles.infoValue}>{infraccion.location}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={20} color={theme.colors.gray} />
                    <Text style={styles.infoLabel}>Fecha:</Text>
                    <Text style={styles.infoValue}>{formatearFecha(infraccion.issuedAt)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePagarMulta(infraccion.id, infraccion.amount)}
                >
                  <Ionicons name="card" size={20} color={theme.colors.white} />
                  <Text style={styles.payButtonText}>Pagar Ahora</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.9,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginVertical: 8,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.9,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.lightGray,
    marginVertical: 12,
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray,
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.dark,
    flex: 1,
  },
  payButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});

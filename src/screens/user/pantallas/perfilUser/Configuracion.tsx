import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from "../../../../config/theme";
import { AuthContext, AUTH_ACTIONS } from '../../../../components/shared/Context/AuthContext/AuthContext';

export default function Configuracion() {
  const navigation = useNavigation();
  const { state } = useContext(AuthContext);

  const opciones = [
    {
      id: 1,
      titulo: 'Editar Perfil',
      descripcion: 'Actualiza tus datos personales',
      icono: 'person-outline',
      color: theme.colors.primary,
      screen: 'EditarPerfil',
    },
    {
      id: 2,
      titulo: 'Eliminar Cuenta',
      descripcion: 'Eliminar permanentemente tu cuenta',
      icono: 'trash-outline',
      color: theme.colors.danger,
      screen: 'EliminarCuenta',
    },
  ];

  const handleOptionPress = (screen: string) => {
    navigation.navigate(screen as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="person-circle" size={64} color={theme.colors.primary} />
          <Text style={styles.userName}>{state.user?.name} {state.user?.surname}</Text>
          <Text style={styles.userEmail}>{state.user?.email}</Text>
        </View>

        {opciones.map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            style={styles.optionCard}
            onPress={() => handleOptionPress(opcion.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${opcion.color}20` }]}>
              <Ionicons name={opcion.icono as any} size={24} color={opcion.color} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{opcion.titulo}</Text>
              <Text style={styles.optionDescription}>{opcion.descripcion}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
          </TouchableOpacity>
        ))}

        <View style={styles.versionCard}>
          <Text style={styles.versionText}>ParkApp v1.0.0</Text>
          <Text style={styles.versionSubtext}>© 2025 Todos los derechos reservados</Text>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 4,
  },
  optionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  versionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray,
  },
  versionSubtext: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 4,
  },
});
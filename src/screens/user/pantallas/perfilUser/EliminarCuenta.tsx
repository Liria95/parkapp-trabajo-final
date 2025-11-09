import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from "../../../../config/theme";
import { AuthContext, AUTH_ACTIONS } from '../../../../components/shared/Context/AuthContext/AuthContext';
import { UserProfileService } from '../../../../services/UserProfileService';

export default function EliminarCuenta() {
  const navigation = useNavigation();
  const { state, dispatch } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDeleteAccount = async () => {
    if (!state.token || !state.user?.id) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    if (confirmationText.toUpperCase() !== 'ELIMINAR') {
      Alert.alert('Error', 'Debes escribir exactamente "ELIMINAR" para confirmar');
      return;
    }

    Alert.alert(
      'Advertencia Final',
      'Esta acción es IRREVERSIBLE. Se eliminarán todos tus datos: vehículos, historial, transacciones, etc.\n\n¿Estás completamente seguro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const result = await UserProfileService.deleteAccount(
                state.user!.id,
                '', // Sin contraseña (el usuario ya está autenticado)
                state.token!
              );

              if (result.success) {
                Alert.alert(
                  'Cuenta Eliminada',
                  'Tu cuenta ha sido eliminada exitosamente.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        dispatch({ type: AUTH_ACTIONS.LOGOUT });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              } else {
                Alert.alert('Error', result.message || 'No se pudo eliminar la cuenta');
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Ocurrió un error al eliminar la cuenta');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eliminar Cuenta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={64} color={theme.colors.danger} />
          <Text style={styles.warningTitle}>Acción Irreversible</Text>
          <Text style={styles.warningText}>
            Al eliminar tu cuenta, se perderán PERMANENTEMENTE todos tus datos
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Se eliminará:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.infoText}>Todos tus datos personales</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.infoText}>Historial de estacionamiento</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.infoText}>Vehículos registrados</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.infoText}>Transacciones y saldo</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.infoText}>Notificaciones</Text>
          </View>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Requisitos:</Text>
          <View style={styles.requirementItem}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.requirementText}>
              No debes tener estacionamiento activo
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.requirementText}>
              No debes tener multas pendientes
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Confirma la eliminación</Text>
          
          <Text style={styles.securityNote}>
            Ya estás autenticado, solo necesitas confirmar escribiendo la palabra clave
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Escribe <Text style={styles.boldText}>ELIMINAR</Text> en mayúsculas
            </Text>
            <TextInput
              style={styles.input}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="ELIMINAR"
              placeholderTextColor={theme.colors.gray}
              autoCapitalize="characters"
            />
            <Text style={styles.helperText}>
              Debe ser exactamente: ELIMINAR
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="trash" size={22} color={theme.colors.white} />
                <Text style={styles.deleteButtonText}>Eliminar Mi Cuenta</Text>
              </>
            )}
          </TouchableOpacity>
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
    backgroundColor: theme.colors.danger,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.danger,
    elevation: 3,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.danger,
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.dark,
    flex: 1,
  },
  requirementsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: theme.colors.dark,
    flex: 1,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: 12,
  },
  securityNote: {
    fontSize: 13,
    color: theme.colors.primary,
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: theme.colors.danger,
    fontSize: 16,
  },
  input: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: theme.colors.dark,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 6,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});
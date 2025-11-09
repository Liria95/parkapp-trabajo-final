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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from "../../../../config/theme";
import { AuthContext, AUTH_ACTIONS } from '../../../../components/shared/Context/AuthContext/AuthContext';
import { UserProfileService } from '../../../../services/UserProfileService';

export default function EditarPerfil() {
  const navigation = useNavigation();
  const { state, dispatch } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Datos del perfil
  const [name, setName] = useState(state.user?.name || '');
  const [surname, setSurname] = useState(state.user?.surname || '');
  const [phone, setPhone] = useState(state.user?.phone || '');
  
  // Cambio de contraseña (sin pedir la actual)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    if (!state.token || !state.user?.id) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    // Validaciones
    if (!name.trim() || !surname.trim()) {
      Alert.alert('Error', 'El nombre y apellido son obligatorios');
      return;
    }

    if (showPasswordSection) {
      if (!newPassword || newPassword.length < 6) {
        Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
    }

    try {
      setLoading(true);

      const updateData: any = {
        name: name.trim(),
        surname: surname.trim(),
        phone: phone.trim(),
      };

      if (showPasswordSection && newPassword) {
        updateData.newPassword = newPassword;
      }

      const result = await UserProfileService.updateProfile(
        state.user.id,
        updateData,
        state.token
      );

      if (result.success && result.user) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');

        // Actualizar contexto
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: {
            user: {
              ...state.user,
              name: result.user.name,
              surname: result.user.surname,
              phone: result.user.phone,
            },
          },
        });

        // Limpiar campos de contraseña
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);

        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={theme.colors.gray}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
              placeholder="Tu apellido"
              placeholderTextColor={theme.colors.gray}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Tu teléfono"
              placeholderTextColor={theme.colors.gray}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={state.user?.email}
              editable={false}
            />
            <Text style={styles.helperText}>El email no puede ser modificado</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.passwordSection}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
          activeOpacity={0.7}
        >
          <View style={styles.passwordHeader}>
            <Text style={styles.passwordTitle}>Cambiar Contraseña</Text>
            <Ionicons
              name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.colors.gray}
            />
          </View>
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={styles.section}>
            <Text style={styles.warningText}>
              ⚠️ Al cambiar tu contraseña, se cerrará tu sesión en todos los dispositivos
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nueva Contraseña</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.gray}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma la nueva contraseña"
                placeholderTextColor={theme.colors.gray}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.white} />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.dark,
    marginBottom: 20,
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
  input: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: theme.colors.dark,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 6,
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 13,
    color: theme.colors.warning,
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.dark,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});
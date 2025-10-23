import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Componentes reutilizables
import AuthContainer from '../../components/auth/AuthContainer';
import FormContainer from '../../forms/FormContainer';
import InputField from '../../forms/InputField';
import AuthButton from '../../components/auth/AuthButton';
import LogoHeader from '../../components/common/LogoHeader';
import LinkButton from '../../components/common/LinkButton';

// Hooks y servicios
import { useFormValidation } from '../../forms/useFormValidation';
import { AuthService } from '../../services/AuthService';

import { AUTH_ACTIONS, AuthContext } from '../../components/shared/Context/AuthContext';

// Tipos
interface NavigationProp {
  navigate: (screen: string) => void;
}

interface LoginScreenProps {
  navigation: NavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { state, dispatch } = useContext(AuthContext);

  useEffect(() => {
    if (state.user) {
      console.log('✅ Usuario logueado:', state.user);
      console.log('🎫 Token:', state.token);
      console.log('🔄 Refresh Token:', state.refreshToken);
    }
  }, [state]);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { errors, validateForm, clearError } = useFormValidation();

  const handleLogin = async (): Promise<void> => {
    const isValid = validateForm(
      { email, password },
      {
        email: { required: true, email: true },
        password: { required: true, minLength: 6 },
      }
    );

    if (!isValid) return;

    setLoading(true);

    try {
      const result = await AuthService.login(email, password);

      console.log('🔐 Respuesta del backend:', result);

      if (result.success && result.user) {
        // Guardar usuario y tokens en el contexto global
        dispatch({
          type: AUTH_ACTIONS.LOGIN,
          payload: {
            token: result.token,
            refreshToken: result.refreshToken,
            user: result.user,
          },
        });

        // ✅ Redirección según el tipo de usuario (CORREGIDO)
        if (result.isAdmin) {
          console.log('👑 Login Admin exitoso:', result.user?.name);
          // RootNavigator manejará la navegación automáticamente
        } else {
          console.log('🙌 Login Usuario exitoso:', result.user?.name);
          // RootNavigator manejará la navegación automáticamente
        }
      } else {
        Alert.alert(
          'Error de login',
          result.message || 'Email o contraseña incorrectos',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.', [
        { text: 'OK' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <LogoHeader title="ParkApp" />

      <FormContainer>
        <InputField
          label="Email"
          iconName="mail-outline"
          placeholder="Ingresá tu email"
          value={email}
          onChangeText={(text: string) => {
            setEmail(text);
            clearError('email');
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <InputField
          label="Contraseña"
          iconName="lock-closed-outline"
          placeholder="Ingresá tu contraseña"
          value={password}
          onChangeText={(text: string) => {
            setPassword(text);
            clearError('password');
          }}
          error={errors.password}
          secureTextEntry={!showPassword}
          showPasswordToggle={true}
          isPasswordVisible={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AuthButton
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
        />

        <LinkButton
          normalText="¿No tenés cuenta?"
          linkText="Registrate"
          onPress={() => navigation.navigate('Register')}
        />
      </FormContainer>
    </AuthContainer>
  );
};

export default LoginScreen;
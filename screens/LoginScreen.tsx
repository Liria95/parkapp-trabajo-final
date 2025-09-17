import React, { useState } from 'react';
import { Alert } from 'react-native';

// Componentes reutilizables
import AuthContainer from '../components/auth/AuthContainer';
import FormContainer from '../components/common/FormContainer';
import InputField from '../components/common/InputField';
import AuthButton from '../components/common/AuthButton';
import LogoHeader from '../components/common/LogoHeader';
import LinkButton from '../components/common/LinkButton';

// Hooks y servicios
import { useFormValidation } from '../hooks/useFormValidation';
import { AuthService } from '../services/AuthService';

// Tipos
interface NavigationProp {
  navigate: (screen: string) => void;
}

interface LoginScreenProps {
  navigation: NavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
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

    if (isValid) {
      setLoading(true);
      
      try {
        const result = await AuthService.login(email, password);
        
        if (result.success && result.isAdmin) {
          console.log('Login Admin exitoso:', result.user?.name);
          navigation.navigate('AdminDashboard');
        } else if (result.success) {
          Alert.alert('Login exitoso', result.message, [{ text: 'OK' }]);
        } else {
          Alert.alert('Error de login', result.message, [{ text: 'OK' }]);
        }
      } catch (error) {
        Alert.alert('Error', 'Ocurrió un error inesperado', [{ text: 'OK' }]);
      } finally {
        setLoading(false);
      }
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
          normalText="¿No tienes cuenta?"
          linkText="Registrarse"
          onPress={() => navigation.navigate('Register')}
        />
      </FormContainer>
    </AuthContainer>
  );
};

export default LoginScreen;
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

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

// Tipos para navegación
type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { errors, validateForm, clearError } = useFormValidation();

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleRegister = async (): Promise<void> => {
    const isValid = validateForm(formData, {
      fullName: { required: true, minLength: 2 },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      password: { required: true, minLength: 6 },
      confirmPassword: { required: true, match: 'password' },
    });

    if (isValid) {
      setLoading(true);
      
      try {
        const result = await AuthService.register({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        if (result.success) {
          Alert.alert('Registro exitoso', result.message, [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
        } else {
          Alert.alert('Error de registro', result.message, [{ text: 'OK' }]);
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
      <LogoHeader
        title="Únite y estaciona fácil"
        subtitle="Creá tu cuenta de usuario para comenzar"
        marginTop={60}
        marginBottom={40}
      />
      
      <FormContainer>
        <InputField
          label="Nombre completo"
          iconName="person-outline"
          placeholder="Juan Pérez"
          value={formData.fullName}
          onChangeText={(text) => handleInputChange('fullName', text)}
          error={errors.fullName}
          autoCapitalize="words"
        />

        <InputField
          label="Email"
          iconName="mail-outline"
          placeholder="juan@email.com"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputField
          label="Teléfono"
          iconName="call-outline"
          placeholder="+54 9 11 1234-5678"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          error={errors.phone}
          keyboardType="phone-pad"
        />

        <InputField
          label="Contraseña"
          iconName="lock-closed-outline"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          error={errors.password}
          secureTextEntry={!showPassword}
          showPasswordToggle={true}
          isPasswordVisible={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoCapitalize="none"
        />

        <InputField
          label="Confirmar contraseña"
          iconName="lock-closed-outline"
          placeholder="Repetí tu contraseña"
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
          error={errors.confirmPassword}
          secureTextEntry={!showConfirmPassword}
          showPasswordToggle={true}
          isPasswordVisible={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          autoCapitalize="none"
        />

        <AuthButton
          title="Crear Cuenta"
          onPress={handleRegister}
          loading={loading}
        />

        <LinkButton
          normalText="¿Ya tienes cuenta?"
          linkText="Inicia sesión"
          onPress={() => navigation.navigate('Login')}
        />
      </FormContainer>
    </AuthContainer>
  );
};

export default RegisterScreen;
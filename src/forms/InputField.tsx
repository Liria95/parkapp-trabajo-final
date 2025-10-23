import React from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { theme } from '../config/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  iconName: string;
  error?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
}

const InputContainer = styled.View`
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${theme.colors.dark};
  margin-bottom: 8px;
`;

const InputWrapper = styled.View<{ hasError: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: 15px;
  border-width: ${props => props.hasError ? 2 : 1}px;
  border-color: ${props => props.hasError ? theme.colors.danger : '#E0E0E0'};
  elevation: 1;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${theme.colors.dark};
  margin-left: 10px;
`;

const ErrorText = styled.Text`
  color: ${theme.colors.danger};
  font-size: 12px;
  margin-top: 5px;
  margin-left: 5px;
`;

const EyeButton = styled.TouchableOpacity`
  padding: 5px;
`;

const InputField: React.FC<InputFieldProps> = ({
  label,
  iconName,
  error,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  ...textInputProps
}) => {
  return (
    <InputContainer>
      <InputLabel>{label}</InputLabel>
      <InputWrapper hasError={!!error}>
        <Ionicons
          name={iconName as any}
          size={20}
          color={error ? theme.colors.danger : theme.colors.gray}
        />
        <StyledTextInput {...textInputProps} />
        {showPasswordToggle && onTogglePassword && (
          <EyeButton onPress={onTogglePassword}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.gray}
            />
          </EyeButton>
        )}
      </InputWrapper>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </InputContainer>
  );
};

export default InputField;
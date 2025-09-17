import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

const StyledButton = styled.TouchableOpacity<{ variant: string; loading: boolean }>`
  background-color: ${props => {
    if (props.loading) return colors.gray;
    return props.variant === 'primary' ? colors.primary : colors.white;
  }};
  padding-vertical: 15px;
  border-radius: 8px;
  align-items: center;
  margin-top: 20px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  border-width: ${props => props.variant === 'secondary' ? 2 : 0}px;
  border-color: ${props => props.variant === 'secondary' ? colors.primary : 'transparent'};
  opacity: ${props => props.loading ? 0.7 : 1};
`;

const ButtonText = styled.Text<{ variant: string }>`
  color: ${props => props.variant === 'primary' ? colors.white : colors.primary};
  font-size: 16px;
  font-weight: bold;
`;

const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  ...touchableProps
}) => {
  return (
    <StyledButton
      variant={variant}
      loading={loading}
      disabled={loading}
      {...touchableProps}
    >
      <ButtonText variant={variant}>
        {loading ? 'Cargando...' : title}
      </ButtonText>
    </StyledButton>
  );
};

export default AuthButton;
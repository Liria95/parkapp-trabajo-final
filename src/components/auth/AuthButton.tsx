import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const StyledButton = styled.TouchableOpacity<{
  bgColor: string;
  disabled?: boolean;
  variant: string;
}>`
  background-color: ${props => {
    if (props.disabled) return theme.colors.gray;
    if (props.variant === 'outline') return 'transparent';
    return props.bgColor;
  }};
  border: ${props => props.variant === 'outline' ? `2px solid ${props.bgColor}` : 'none'};
  padding: ${getDynamicSpacing(16)}px;
  border-radius: ${getResponsiveSize(12)}px;
  align-items: center;
  justify-content: center;
  min-height: ${getResponsiveSize(50)}px;
  elevation: ${props => props.variant === 'outline' ? 0 : 3};
  shadow-color: ${props => props.bgColor};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ButtonText = styled.Text<{
  textColor: string;
  variant: string;
  bgColor: string;
}>`
  color: ${props => {
    if (props.variant === 'outline') return props.bgColor;
    return props.textColor;
  }};
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  backgroundColor = theme.colors.primary,
  textColor = theme.colors.white,
  loading = false,
  disabled = false,
  variant = 'primary',
}) => {
  return (
    <StyledButton
      bgColor={backgroundColor}
      disabled={disabled || loading}
      variant={variant}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <ButtonText 
          textColor={textColor}
          variant={variant}
          bgColor={backgroundColor}
        >
          {title}
        </ButtonText>
      )}
    </StyledButton>
  );
};

export default AuthButton;
import React from 'react';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, breakpoints } from '../../utils/ResponsiveUtils';

interface StatCardProps {
  number: string | number;
  label: string;
  backgroundColor: string;
  onPress?: () => void;
  buttonText?: string;
  style?: ViewStyle;
}

const CardContainer = styled.TouchableOpacity<{ bgColor: string }>`
  background-color: ${props => props.bgColor};
  border-radius: ${getResponsiveSize(12)}px;
  padding: ${getResponsiveSize(16)}px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: ${getResponsiveSize(breakpoints.isSmallPhone ? 70 : 80)}px;
`;

const StatNumber = styled.Text`
  font-size: ${getResponsiveSize(breakpoints.isTablet ? 22 : breakpoints.isSmallPhone ? 16 : 18)}px;
  font-weight: bold;
  color: ${theme.colors.white};
  text-align: center;
  margin-bottom: ${getResponsiveSize(4)}px;
`;

const StatLabel = styled.Text`
  font-size: ${getResponsiveSize(breakpoints.isTablet ? 12 : breakpoints.isSmallPhone ? 9 : 10)}px;
  color: ${theme.colors.white};
  text-align: center;
  line-height: ${getResponsiveSize(breakpoints.isTablet ? 16 : breakpoints.isSmallPhone ? 12 : 14)}px;
  flex-wrap: wrap;
`;

const StatButton = styled.TouchableOpacity`
  margin-top: ${getResponsiveSize(8)}px;
  background-color: ${theme.colors.white};
  padding: ${getResponsiveSize(4)}px ${getResponsiveSize(8)}px;
  border-radius: ${getResponsiveSize(6)}px;
  align-items: center;
  justify-content: center;
  min-width: ${getResponsiveSize(40)}px;
  min-height: ${getResponsiveSize(24)}px;
`;

const StatButtonText = styled.Text`
  color: ${theme.colors.danger};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
`;

const StatCard: React.FC<StatCardProps> = ({
  number,
  label,
  backgroundColor,
  onPress,
  buttonText,
  style,
}) => {
  return (
    <CardContainer 
      bgColor={backgroundColor} 
      style={style}
      onPress={!buttonText ? onPress : undefined}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <StatNumber>{number}</StatNumber>
      <StatLabel>{label}</StatLabel>
      {buttonText && onPress && (
        <StatButton onPress={onPress}>
          <StatButtonText>{buttonText}</StatButtonText>
        </StatButton>
      )}
    </CardContainer>
  );
};

export default StatCard;
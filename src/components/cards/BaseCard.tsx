import React from 'react';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface BaseCardProps {
  children: React.ReactNode;
  backgroundColor?: string;
  borderLeftColor?: string;
  borderLeftWidth?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

const StyledCard = styled.TouchableOpacity<{
  bgColor: string;
  borderColor?: string;
  borderWidth?: number;
}>`
  background-color: ${props => props.bgColor};
  border-left-width: ${props => props.borderWidth || 0}px;
  border-left-color: ${props => props.borderColor || 'transparent'};
  border-radius: ${getResponsiveSize(16)}px;
  padding: ${getDynamicSpacing(20)}px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  margin-bottom: ${getDynamicSpacing(15)}px;
`;

const BaseCard: React.FC<BaseCardProps> = ({
  children,
  backgroundColor = theme.colors.white,
  borderLeftColor,
  borderLeftWidth,
  style,
  onPress,
}) => {
  return (
    <StyledCard
      bgColor={backgroundColor}
      borderColor={borderLeftColor}
      borderWidth={borderLeftWidth}
      style={style}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </StyledCard>
  );
};

export default BaseCard;
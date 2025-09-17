import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize, getDynamicSpacing, breakpoints } from '../../utils/ResponsiveUtils';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  rightIconName?: string;
  showBackButton?: boolean;
}

const Header = styled.View`
  background-color: ${colors.primary};
  padding: ${getDynamicSpacing(breakpoints.isLandscape ? 25 : 50)}px ${getDynamicSpacing(20)}px ${getDynamicSpacing(15)}px ${getDynamicSpacing(20)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: ${getDynamicSpacing(breakpoints.isLandscape ? 60 : 80)}px;
`;

const HeaderContent = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 ${getDynamicSpacing(15)}px;
  max-width: ${breakpoints.isSmallPhone ? '60%' : '70%'};
`;

const HeaderTitle = styled.Text`
  color: ${colors.white};
  font-size: ${getResponsiveSize(breakpoints.isLandscape ? 16 : 18)}px;
  font-weight: bold;
  flex-wrap: wrap;
  line-height: ${getResponsiveSize(breakpoints.isLandscape ? 20 : 24)}px;
`;

const HeaderSubtitle = styled.Text`
  color: ${colors.white};
  font-size: ${getResponsiveSize(breakpoints.isLandscape ? 12 : 14)}px;
  opacity: 0.9;
  margin-top: ${getResponsiveSize(2)}px;
  flex-wrap: wrap;
  line-height: ${getResponsiveSize(breakpoints.isLandscape ? 16 : 18)}px;
`;

const HeaderButton = styled.TouchableOpacity`
  width: ${getResponsiveSize(40)}px;
  height: ${getResponsiveSize(40)}px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${getResponsiveSize(20)}px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  onRightPress,
  rightIconName = 'menu',
  showBackButton = true,
}) => {
  return (
    <Header>
      {showBackButton && onBackPress && (
        <HeaderButton onPress={onBackPress}>
          <Ionicons name="arrow-back" size={getResponsiveSize(20)} color={colors.white} />
        </HeaderButton>
      )}
      
      <HeaderContent>
        <HeaderTitle>{title}</HeaderTitle>
        {subtitle && <HeaderSubtitle>{subtitle}</HeaderSubtitle>}
      </HeaderContent>
      
      {onRightPress && (
        <HeaderButton onPress={onRightPress}>
          <Ionicons name={rightIconName as any} size={getResponsiveSize(20)} color={colors.white} />
        </HeaderButton>
      )}
    </Header>
  );
};

export default AppHeader;
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onMenuPress: () => void;
}

const Header = styled.View`
  background-color: ${colors.primary};
  padding: ${getResponsiveSize(50)}px ${getResponsiveSize(20)}px ${getResponsiveSize(15)}px ${getResponsiveSize(20)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: ${getResponsiveSize(80)}px;
`;

const HeaderContent = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-right: ${getResponsiveSize(15)}px;
`;

const HeaderTitle = styled.Text`
  color: ${colors.white};
  font-size: ${getResponsiveSize(18)}px;
  font-weight: bold;
  flex-wrap: wrap;
`;

const HeaderSubtitle = styled.Text`
  color: ${colors.white};
  font-size: ${getResponsiveSize(14)}px;
  opacity: 0.9;
  margin-top: ${getResponsiveSize(2)}px;
  flex-wrap: wrap;
`;

const MenuButton = styled.TouchableOpacity`
  width: ${getResponsiveSize(40)}px;
  height: ${getResponsiveSize(40)}px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${getResponsiveSize(20)}px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onMenuPress,
}) => {
  return (
    <Header>
      <HeaderContent>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderSubtitle>{subtitle}</HeaderSubtitle>
      </HeaderContent>
      <MenuButton onPress={onMenuPress}>
        <Ionicons name="menu" size={getResponsiveSize(20)} color={colors.white} />
      </MenuButton>
    </Header>
  );
};

export default DashboardHeader;
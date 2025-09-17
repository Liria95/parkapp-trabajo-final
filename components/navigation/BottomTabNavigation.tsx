import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface TabItem {
  id: string;
  label: string;
  iconName: string;
  onPress: () => void;
}

interface BottomTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
}

const BottomNavigation = styled.View`
  flex-direction: row;
  background-color: ${colors.white};
  padding: ${getResponsiveSize(12)}px 0;
  border-top-width: 1px;
  border-top-color: #E5E5E5;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  justify-content: space-around;
  align-items: center;
`;

const NavItem = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${getResponsiveSize(8)}px ${getResponsiveSize(4)}px;
  min-height: ${getResponsiveSize(50)}px;
`;

const NavText = styled.Text<{ active: boolean }>`
  font-size: ${getResponsiveSize(10)}px;
  font-weight: 500;
  margin-top: ${getResponsiveSize(4)}px;
  text-align: center;
  color: ${props => props.active ? colors.primary : colors.gray};
`;

const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  tabs,
  activeTab,
}) => {
  return (
    <BottomNavigation>
      {tabs.map((tab) => (
        <NavItem key={tab.id} onPress={tab.onPress}>
          <Ionicons 
            name={tab.iconName as any}
            size={getResponsiveSize(22)} 
            color={activeTab === tab.id ? colors.primary : colors.gray} 
          />
          <NavText active={activeTab === tab.id}>{tab.label}</NavText>
        </NavItem>
      ))}
    </BottomNavigation>
  );
};

export default BottomTabNavigation;
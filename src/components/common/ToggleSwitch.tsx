import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface ToggleSwitchProps {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
}

const ToggleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${theme.colors.lightGray};
  padding: ${getDynamicSpacing(15)}px;
  border-radius: ${getResponsiveSize(8)}px;
  margin: ${getDynamicSpacing(20)}px;
`;

const ToggleTextContainer = styled.View`
  flex: 1;
`;

const ToggleTitle = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
`;

const ToggleSubtitle = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.gray};
`;

const ToggleButton = styled.TouchableOpacity<{ active: boolean }>`
  width: ${getResponsiveSize(50)}px;
  height: ${getResponsiveSize(28)}px;
  background-color: ${props => props.active ? theme.colors.success : theme.colors.gray};
  border-radius: ${getResponsiveSize(14)}px;
  justify-content: center;
  align-items: ${props => props.active ? 'flex-end' : 'flex-start'};
  padding: ${getResponsiveSize(2)}px;
`;

const ToggleCircle = styled.View`
  width: ${getResponsiveSize(24)}px;
  height: ${getResponsiveSize(24)}px;
  background-color: ${theme.colors.white};
  border-radius: ${getResponsiveSize(12)}px;
  elevation: 2;
`;

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  title,
  subtitle,
  value,
  onToggle,
}) => {
  return (
    <ToggleContainer>
      <ToggleTextContainer>
        <ToggleTitle>{title}</ToggleTitle>
        <ToggleSubtitle>{subtitle}</ToggleSubtitle>
      </ToggleTextContainer>
      <ToggleButton active={value} onPress={onToggle}>
        <ToggleCircle />
      </ToggleButton>
    </ToggleContainer>
  );
};

export default ToggleSwitch;
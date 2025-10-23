import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface SectionCardProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  children?: React.ReactNode;
}

const Card = styled.View`
  background-color: ${theme.colors.white};
  margin: 0 ${getResponsiveSize(20)}px ${getResponsiveSize(15)}px ${getResponsiveSize(20)}px;
  border-radius: ${getResponsiveSize(12)}px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
`;

const Header = styled.View`
  padding: ${getResponsiveSize(16)}px ${getResponsiveSize(20)}px ${getResponsiveSize(12)}px ${getResponsiveSize(20)}px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Title = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  flex: 1;
  min-width: ${getResponsiveSize(120)}px;
`;

const ActionText = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
`;

const SectionCard: React.FC<SectionCardProps> = ({
  title = 'Sin título',
  actionText,
  onActionPress,
  children = null,
}) => {
  // Opcional: log para depuración
  // console.log('SectionCard props', { title, actionText, children });

  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        {actionText && onActionPress && (
          <TouchableOpacity onPress={onActionPress}>
            <ActionText>{actionText}</ActionText>
          </TouchableOpacity>
        )}
      </Header>
      {/* Render condicional para evitar errores si children es undefined */}
      {children ? children : null}
    </Card>
  );
};

export default SectionCard;
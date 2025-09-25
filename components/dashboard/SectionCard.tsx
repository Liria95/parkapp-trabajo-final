import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface SectionCardProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  children?: React.ReactNode;
}

const Card = styled.View`
  background-color: ${colors.white};
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
  color: ${colors.dark};
  flex: 1;
  min-width: ${getResponsiveSize(120)}px;
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
            <Text
              style={{
                color: colors.primary,
                fontSize: getResponsiveSize(12),
                fontWeight: 'bold',
              }}
            >
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
      </Header>
      {/* Render condicional para evitar errores si children es undefined */}
      {children ? children : null}
    </Card>
  );
};

export default SectionCard;
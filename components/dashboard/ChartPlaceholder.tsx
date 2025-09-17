import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface ChartPlaceholderProps {
  iconName: string;
  title: string;
  size?: number;
}

const Container = styled.View`
  align-items: center;
  justify-content: center;
  padding: ${getResponsiveSize(30)}px ${getResponsiveSize(20)}px;
  flex-direction: column;
`;

const PlaceholderWrapper = styled.View`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${getResponsiveSize(8)}px;
`;

const PlaceholderText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  color: ${colors.gray};
  text-align: center;
  margin-top: ${getResponsiveSize(8)}px;
`;

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({
  iconName,
  title,
  size = 50,
}) => {
  return (
    <Container>
      <PlaceholderWrapper>
        <Ionicons 
          name={iconName as any} 
          size={getResponsiveSize(size)} 
          color={colors.secondary} 
        />
        <PlaceholderText>{title}</PlaceholderText>
      </PlaceholderWrapper>
    </Container>
  );
};

export default ChartPlaceholder;

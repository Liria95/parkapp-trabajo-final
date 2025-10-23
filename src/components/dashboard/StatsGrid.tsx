import React from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';
import StatCard from '../cards/StatCard';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface Stat {
  id: string;
  number: string | number;
  label: string;
  backgroundColor: string;
  buttonText?: string;
  onPress?: () => void;
}

interface StatsGridProps {
  stats: Stat[];
}

const { width } = Dimensions.get('window');

const getGridColumns = () => {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
};

const StatsContainer = styled.View`
  padding: ${getResponsiveSize(20)}px;
`;

const StatsGridContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${getResponsiveSize(12)}px;
`;

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const columns = getGridColumns();
  const gap = getResponsiveSize(12);
  const padding = getResponsiveSize(20) * 2;
  const availableWidth = width - padding - (gap * (columns - 1));
  const cardWidth = availableWidth / columns;

  return (
    <StatsContainer>
      <StatsGridContainer>
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            number={stat.number}
            label={stat.label}
            backgroundColor={stat.backgroundColor}
            buttonText={stat.buttonText}
            onPress={stat.onPress}
            style={{ width: cardWidth }}
          />
        ))}
      </StatsGridContainer>
    </StatsContainer>
  );
};

export default StatsGrid;
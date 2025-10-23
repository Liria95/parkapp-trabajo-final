import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../config/theme';
import { getResponsiveSize, getDynamicSpacing, breakpoints } from '../utils/ResponsiveUtils';

interface Filter {
  id: string;
  label: string;
}

interface FilterButtonsProps {
  filters: Filter[];
  activeFilter: string;
  onFilterPress: (filterId: string) => void;
}

const FilterContainer = styled.View`
  padding: 0 ${getDynamicSpacing(20)}px ${getDynamicSpacing(15)}px ${getDynamicSpacing(20)}px;
`;

const FilterScrollView = styled.ScrollView`
  flex-direction: row;
`;

const FilterButtonsWrapper = styled.View`
  flex-direction: row;
  gap: ${getDynamicSpacing(8)}px;
  align-items: center;
`;

const FilterButton = styled.TouchableOpacity<{ active: boolean }>`
  padding: ${getDynamicSpacing(10)}px ${getDynamicSpacing(16)}px;
  border-radius: ${getResponsiveSize(20)}px;
  background-color: ${props => props.active ? theme.colors.primary : theme.colors.white};
  border: 2px solid ${props => props.active ? theme.colors.primary : '#E0E0E0'};
  elevation: ${props => props.active ? 3 : 1};
  shadow-color: ${props => props.active ? theme.colors.primary : '#000'};
  shadow-offset: 0px ${props => props.active ? 3 : 1}px;
  shadow-opacity: ${props => props.active ? 0.3 : 0.1};
  shadow-radius: ${props => props.active ? 6 : 2}px;
  flex-shrink: 0;
  min-width: ${getResponsiveSize(80)}px;
  align-items: center;
  justify-content: center;
`;

const FilterText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? theme.colors.white : theme.colors.dark};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: ${props => props.active ? 'bold' : '500'};
  text-align: center;
`;

const FilterButtons: React.FC<FilterButtonsProps> = ({
  filters,
  activeFilter,
  onFilterPress,
}) => {
  return (
    <FilterContainer>
      <FilterScrollView horizontal showsHorizontalScrollIndicator={false}>
        <FilterButtonsWrapper>
          {filters.map(filter => (
            <FilterButton
              key={filter.id}
              active={activeFilter === filter.id}
              onPress={() => onFilterPress(filter.id)}
            >
              <FilterText active={activeFilter === filter.id}>
                {filter.label}  {/* 👈 CORRECTO: usa filter.label (prop) */}
              </FilterText>
            </FilterButton>
          ))}
        </FilterButtonsWrapper>
      </FilterScrollView>
    </FilterContainer>
  );
};

export default FilterButtons;
import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';
import { getResponsiveSize, getDynamicSpacing, breakpoints } from '../../utils/ResponsiveUtils';

type FilterType = 'todas' | 'pendiente' | 'pagada' | 'cancelada';

interface FilterSectionProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filters?: { key: FilterType; label: string }[];
}

const FilterContainer = styled.View`
  flex-direction: ${breakpoints.isTablet ? 'row' : 'column'};
  padding: ${getDynamicSpacing(20)}px;
  ${breakpoints.isTablet ? 'flex-wrap: wrap;' : ''}
  ${breakpoints.isTablet ? 'justify-content: flex-start;' : 'align-items: stretch;'}
  gap: ${getDynamicSpacing(10)}px;
`;

const FilterScrollView = styled.ScrollView`
  ${!breakpoints.isTablet ? 'flex: 1;' : ''}
`;

const FilterButtonsWrapper = styled.View`
  flex-direction: row;
  gap: ${getDynamicSpacing(10)}px;
  align-items: center;
  ${breakpoints.isTablet ? 'flex-wrap: wrap;' : ''}
  justify-content: ${breakpoints.isTablet ? 'flex-start' : 'space-between'};
`;

const FilterButton = styled.TouchableOpacity<{ active: boolean }>`
  padding: ${getDynamicSpacing(10)}px ${getDynamicSpacing(18)}px;
  border-radius: ${getResponsiveSize(25)}px;
  background-color: ${props => (props.active ? theme.colors.primary : theme.colors.white)};
  border: 2px solid ${props => (props.active ? theme.colors.primary : '#E0E0E0')};
  flex-shrink: 0;
  min-width: ${getResponsiveSize(90)}px;
  align-items: center;
  justify-content: center;
  elevation: ${props => (props.active ? 3 : 1)};
  shadow-color: ${props => (props.active ? theme.colors.primary : '#000')};
  shadow-offset: 0px ${props => (props.active ? 3 : 1)}px;
  shadow-opacity: ${props => (props.active ? 0.3 : 0.1)};
  shadow-radius: ${props => (props.active ? 6 : 2)}px;
`;

const FilterText = styled.Text<{ active: boolean }>`
  color: ${props => (props.active ? theme.colors.white : theme.colors.dark)};
  font-size: ${getResponsiveSize(13)}px;
  font-weight: ${props => (props.active ? 'bold' : '500')};
  text-align: center;
`;

const defaultFilters = [
  { key: 'todas' as FilterType, label: 'Todas' },
  { key: 'pendiente' as FilterType, label: 'Pendiente' },
  { key: 'pagada' as FilterType, label: 'Pagada' },
  { key: 'cancelada' as FilterType, label: 'Cancelada' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
  activeFilter,
  onFilterChange,
  filters = defaultFilters,
}) => {
  return (
    <FilterContainer>
      {breakpoints.isTablet ? (
        <FilterButtonsWrapper>
          {filters.map(filter => (
            <FilterButton 
              key={filter.key} 
              active={activeFilter === filter.key} 
              onPress={() => onFilterChange(filter.key)}
            >
              <FilterText active={activeFilter === filter.key}>
                {filter.label}
              </FilterText>
            </FilterButton>
          ))}
        </FilterButtonsWrapper>
      ) : (
        <FilterScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButtonsWrapper>
            {filters.map(filter => (
              <FilterButton 
                key={filter.key} 
                active={activeFilter === filter.key} 
                onPress={() => onFilterChange(filter.key)}
              >
                <FilterText active={activeFilter === filter.key}>
                  {filter.label}
                </FilterText>
              </FilterButton>
            ))}
          </FilterButtonsWrapper>
        </FilterScrollView>
      )}
    </FilterContainer>
  );
};

export default FilterSection;
import React from 'react';
import { ScrollView, View } from 'react-native';
import styled from 'styled-components/native';
import { getDynamicSpacing, breakpoints } from '../../utils/ResponsiveUtils';

interface ResponsiveGridProps {
  children: React.ReactNode[];
  columns?: number;
  spacing?: number;
  style?: any;
}

const GridContainer = styled.ScrollView`
  flex: 1;
  padding: 0 ${getDynamicSpacing(20)}px;
`;

const GridWrapper = styled.View<{ columns: number; spacing: number }>`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${props => getDynamicSpacing(props.spacing)}px;
  padding-bottom: ${getDynamicSpacing(40)}px;
`;

const getDefaultColumns = (): number => {
  if (breakpoints.isDesktop) return 3;
  if (breakpoints.isLargeTablet && breakpoints.isLandscape) return 3;
  if (breakpoints.isLargeTablet) return 2;
  if (breakpoints.isTablet && breakpoints.isLandscape) return 2;
  if (breakpoints.isTablet) return 1;
  return 1;
};

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  spacing = 15,
  style,
}) => {
  const gridColumns = columns || getDefaultColumns();

  return (
    <GridContainer 
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ flexGrow: 1 }}
      style={[{ flex: 1 }, style]}
      nestedScrollEnabled={true}
    >
      {gridColumns === 1 ? (
        <View style={{ paddingBottom: getDynamicSpacing(40) }}>
          {children}
        </View>
      ) : (
        <GridWrapper columns={gridColumns} spacing={spacing}>
          {children}
        </GridWrapper>
      )}
    </GridContainer>
  );
};

export default ResponsiveGrid;
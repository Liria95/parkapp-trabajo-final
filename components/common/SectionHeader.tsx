import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize, getDynamicSpacing, breakpoints } from '../../utils/ResponsiveUtils';

interface SectionHeaderProps {
  title: string;
  count: number;
  subtitle?: string;
}

const HeaderContainer = styled.View`
  flex-direction: ${breakpoints.isSmallPhone ? 'column' : 'row'};
  ${breakpoints.isSmallPhone ? 'align-items: flex-start;' : 'justify-content: space-between; align-items: center;'}
  padding: ${getDynamicSpacing(20)}px 0 ${getDynamicSpacing(15)}px 0;
  gap: ${getDynamicSpacing(10)}px;
`;

const TitleContainer = styled.View`
  flex: ${breakpoints.isSmallPhone ? '0' : '1'};
  min-width: ${getResponsiveSize(150)}px;
`;

const Title = styled.Text`
  font-size: ${getResponsiveSize(18)}px;
  font-weight: bold;
  color: ${colors.dark};
  line-height: ${getResponsiveSize(22)}px;
`;

const Subtitle = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${colors.gray};
  margin-top: ${getDynamicSpacing(2)}px;
`;

const Counter = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  color: ${colors.gray};
  background-color: ${colors.white};
  padding: ${getResponsiveSize(6)}px ${getResponsiveSize(12)}px;
  border-radius: ${getResponsiveSize(15)}px;
  border: 1px solid #E0E0E0;
  flex-shrink: 0;
  font-weight: 500;
  text-align: center;
`;

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, subtitle }) => {
  return (
    <HeaderContainer>
      <TitleContainer>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleContainer>
      <Counter>Total: {count}</Counter>
    </HeaderContainer>
  );
};

export default SectionHeader;
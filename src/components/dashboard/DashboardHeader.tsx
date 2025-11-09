import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';
import { getResponsiveSize } from '../../utils/ResponsiveUtils';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const Header = styled.View`
  background-color: ${theme.colors.primary};
  padding: ${getResponsiveSize(50)}px ${getResponsiveSize(20)}px ${getResponsiveSize(15)}px ${getResponsiveSize(20)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: ${getResponsiveSize(80)}px;
`;

const HeaderContent = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const HeaderTitle = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(18)}px;
  font-weight: bold;
  flex-wrap: wrap;
`;

const HeaderSubtitle = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(14)}px;
  opacity: 0.9;
  margin-top: ${getResponsiveSize(2)}px;
  flex-wrap: wrap;
`;

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <Header>
      <HeaderContent>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderSubtitle>{subtitle}</HeaderSubtitle>
      </HeaderContent>
    </Header>
  );
};

export default DashboardHeader;
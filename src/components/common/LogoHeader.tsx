import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';

interface LogoHeaderProps {
  title?: string;
  subtitle?: string;
  logoSource?: ImageSourcePropType;
  marginTop?: number;
  marginBottom?: number;
}

const Container = styled.View<{ marginTop: number; marginBottom: number }>`
  align-items: center;
  margin-top: ${props => props.marginTop}px;
  margin-bottom: ${props => props.marginBottom}px;
`;

const LogoImage = styled.Image`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  border-radius: 50px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${theme.colors.primary};
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${theme.colors.gray};
  text-align: center;
`;

const LogoHeader: React.FC<LogoHeaderProps> = ({
  title = "ParkApp",
  subtitle,
  logoSource = require('../../assets/logo.png'), // Ajusta la ruta según tu estructura
  marginTop = 80,
  marginBottom = 60,
}) => {
  return (
    <Container marginTop={marginTop} marginBottom={marginBottom}>
      <LogoImage source={logoSource} resizeMode="contain" />
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Container>
  );
};

export default LogoHeader;
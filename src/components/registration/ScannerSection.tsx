import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface ScannerSectionProps {
  onCameraPress: () => void;
}

const ScannerContainer = styled.View`
  background-color: ${theme.colors.success};
  border-radius: ${getResponsiveSize(12)}px;
  padding: ${getDynamicSpacing(20)}px;
  margin: ${getDynamicSpacing(20)}px;
  align-items: center;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
`;

const ScannerIcon = styled.View`
  width: ${getResponsiveSize(60)}px;
  height: ${getResponsiveSize(60)}px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${getResponsiveSize(12)}px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${getDynamicSpacing(15)}px;
  border: 2px dashed rgba(255, 255, 255, 0.5);
`;

const ScannerTitle = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  margin-bottom: ${getResponsiveSize(5)}px;
  text-align: center;
`;

const ScannerSubtitle = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(12)}px;
  opacity: 0.9;
  text-align: center;
  margin-bottom: ${getDynamicSpacing(15)}px;
`;

const ScannerButton = styled.TouchableOpacity`
  background-color: rgba(255, 255, 255, 0.2);
  padding: ${getDynamicSpacing(10)}px ${getDynamicSpacing(20)}px;
  border-radius: ${getResponsiveSize(20)}px;
`;

const ScannerButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
`;

const ScannerSection: React.FC<ScannerSectionProps> = ({ onCameraPress }) => {
  return (
    <ScannerContainer>
      <ScannerIcon>
        <Ionicons name="camera" size={getResponsiveSize(24)} color={theme.colors.white} />
      </ScannerIcon>
      <ScannerTitle>Escanear/Ingresar Patente</ScannerTitle>
      <ScannerSubtitle>Usar cámara o escribir manualmente</ScannerSubtitle>
      <ScannerButton onPress={onCameraPress}>
        <ScannerButtonText>ACTIVAR CÁMARA</ScannerButtonText>
      </ScannerButton>
    </ScannerContainer>
  );
};

export default ScannerSection;
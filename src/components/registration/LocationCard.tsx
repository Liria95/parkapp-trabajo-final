import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import BaseCard from '../cards/BaseCard';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface EspacioSeleccionado {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
}

interface LocationCardProps {
  espacioSeleccionado: EspacioSeleccionado | null;
  onLocationPress: () => void;
}

const LocationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${getDynamicSpacing(10)}px;
  margin-bottom: ${getDynamicSpacing(10)}px;
`;

const LocationIcon = styled.View`
  width: ${getResponsiveSize(24)}px;
  height: ${getResponsiveSize(24)}px;
  background-color: ${theme.colors.warning};
  border-radius: ${getResponsiveSize(12)}px;
  justify-content: center;
  align-items: center;
`;

const LocationTitle = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
`;

const LocationInfo = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.gray};
  margin-bottom: ${getResponsiveSize(4)}px;
`;

const SelectLocationContainer = styled.View`
  padding: ${getDynamicSpacing(15)}px;
  border-radius: ${getResponsiveSize(8)}px;
  background-color: ${theme.colors.lightGray};
  align-items: center;
  border-width: 2px;
  border-color: ${theme.colors.primary};
  border-style: dashed;
`;

const SelectLocationText = styled.Text`
  color: ${theme.colors.primary};
  font-weight: bold;
  margin-top: ${getDynamicSpacing(8)}px;
  font-size: ${getResponsiveSize(14)}px;
`;

const ChangeLocationButton = styled.TouchableOpacity`
  margin-top: ${getDynamicSpacing(10)}px;
`;

const ChangeLocationText = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
`;

const LocationCard: React.FC<LocationCardProps> = ({ espacioSeleccionado, onLocationPress }) => {
  if (!espacioSeleccionado) {
    return (
      <BaseCard backgroundColor={theme.colors.white}>
        <TouchableOpacity onPress={onLocationPress}>
          <SelectLocationContainer>
            <Ionicons name="location-outline" size={getResponsiveSize(30)} color={theme.colors.primary} />
            <SelectLocationText>SELECCIONAR UBICACIÓN</SelectLocationText>
          </SelectLocationContainer>
        </TouchableOpacity>
      </BaseCard>
    );
  }

  return (
    <BaseCard 
      backgroundColor={theme.colors.transaccion.cancelada}
      borderLeftColor={theme.colors.warning}
      borderLeftWidth={getResponsiveSize(5)}
    >
      <LocationHeader>
        <LocationIcon>
          <Ionicons name="location" size={getResponsiveSize(12)} color={theme.colors.white} />
        </LocationIcon>
        <LocationTitle>Ubicación Seleccionada</LocationTitle>
      </LocationHeader>
      
      <LocationInfo>UBICACIÓN: {espacioSeleccionado.ubicacion}</LocationInfo>
      <LocationInfo>ESPACIO: {espacioSeleccionado.numero}</LocationInfo>
      <LocationInfo>TARIFA: ${espacioSeleccionado.tarifaPorHora}/HORA</LocationInfo>
      <LocationInfo>INICIO: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</LocationInfo>
      
      <ChangeLocationButton onPress={onLocationPress}>
        <ChangeLocationText>CAMBIAR UBICACIÓN</ChangeLocationText>
      </ChangeLocationButton>
    </BaseCard>
  );
};

export default LocationCard;
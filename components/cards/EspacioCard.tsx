import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import BaseCard from './BaseCard';
import { colors } from '../../constants/colors';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface Espacio {
  id: string;
  numero: string;
  ubicacion: string;
  estado: 'libre' | 'ocupado' | 'mantenimiento' | 'reservado';
  tarifaPorHora: number;
  vehiculoActual?: {
    patente: string;
    horaInicio: string;
    tiempoRestante: string;
  };
  sensor: {
    estado: 'activo' | 'inactivo' | 'error';
    ultimaActualizacion: string;
  };
}

interface EspacioCardProps {
  espacio: Espacio;
  onPress: (espacio: Espacio) => void;
}

const EspacioHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${getDynamicSpacing(12)}px;
  gap: ${getDynamicSpacing(8)}px;
`;

const EspacioNumero = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${colors.dark};
  flex: 1;
`;

const EstadoBadge = styled.View<{ estado: string }>`
  background-color: ${props => {
    switch (props.estado) {
      case 'libre': return colors.green;
      case 'ocupado': return colors.red;
      case 'mantenimiento': return colors.yellow;
      case 'reservado': return colors.secondary;
      default: return colors.gray;
    }
  }};
  padding: ${getResponsiveSize(6)}px ${getResponsiveSize(10)}px;
  border-radius: ${getResponsiveSize(15)}px;
  elevation: 2;
  flex-shrink: 0;
`;

const EstadoText = styled.Text`
  font-size: ${getResponsiveSize(10)}px;
  font-weight: bold;
  color: ${colors.white};
  text-transform: uppercase;
  text-align: center;
`;

const EspacioInfo = styled.View`
  gap: ${getDynamicSpacing(8)}px;
  margin-bottom: ${getDynamicSpacing(12)}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${getDynamicSpacing(8)}px;
  flex-wrap: wrap;
`;

const InfoText = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${colors.gray};
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
`;

const TarifaText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${colors.primary};
`;

const VehiculoInfo = styled.View`
  background-color: ${colors.lightGray};
  padding: ${getDynamicSpacing(10)}px;
  border-radius: ${getResponsiveSize(8)}px;
  margin-bottom: ${getDynamicSpacing(12)}px;
  border-left-width: ${getResponsiveSize(3)}px;
  border-left-color: ${colors.primary};
`;

const PatenteText = styled.Text`
  font-size: ${getResponsiveSize(13)}px;
  font-weight: bold;
  color: ${colors.dark};
  margin-bottom: ${getResponsiveSize(4)}px;
`;

const TiempoText = styled.Text`
  font-size: ${getResponsiveSize(11)}px;
  color: ${colors.gray};
  line-height: ${getResponsiveSize(16)}px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  padding: ${getDynamicSpacing(10)}px ${getDynamicSpacing(16)}px;
  border-radius: ${getResponsiveSize(8)}px;
  align-items: center;
  justify-content: center;
  elevation: 3;
  min-height: ${getResponsiveSize(40)}px;
`;

const ActionButtonText = styled.Text`
  color: ${colors.white};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
  letter-spacing: 0.5px;
`;

// COLORES CARD
const getBackgroundColor = (estado: string): string => {
  switch (estado) {
    case 'libre': return colors.libreLight;         // Verde claro
    case 'ocupado': return colors.ocupadoLight;     // Rojo claro
    case 'mantenimiento': return colors.mantenimientoLight; // Amarillo claro
    case 'reservado': return colors.reservadoLight; // Azul claro
    default: return colors.white;
  }
};

const getBorderColor = (estado: string): string => {
  switch (estado) {
    case 'libre': return colors.green;
    case 'ocupado': return colors.red;
    case 'mantenimiento': return colors.yellow;
    case 'reservado': return colors.secondary;
    default: return colors.gray;
  }
};

const EspacioCard: React.FC<EspacioCardProps> = ({ espacio, onPress }) => {
  return (
    <BaseCard
      backgroundColor={getBackgroundColor(espacio.estado)}
      borderLeftColor={getBorderColor(espacio.estado)}
      borderLeftWidth={getResponsiveSize(5)}
    >
      <EspacioHeader>
        <EspacioNumero>{espacio.numero}</EspacioNumero>
        <EstadoBadge estado={espacio.estado}>
          <EstadoText>{espacio.estado}</EstadoText>
        </EstadoBadge>
      </EspacioHeader>
      
      <EspacioInfo>
        <InfoRow>
          <Ionicons name="location" size={getResponsiveSize(14)} color={colors.gray} />
          <InfoText>{espacio.ubicacion}</InfoText>
        </InfoRow>
        
        <InfoRow>
          <Ionicons name="cash" size={getResponsiveSize(14)} color={colors.primary} />
          <TarifaText>${espacio.tarifaPorHora}/hora</TarifaText>
        </InfoRow>

        <InfoRow>
          <Ionicons 
            name={espacio.sensor.estado === 'activo' ? 'radio' : 'warning'} 
            size={getResponsiveSize(14)} 
            color={espacio.sensor.estado === 'activo' ? colors.green : colors.red} 
          />
          <InfoText>
            Sensor: {espacio.sensor.estado} - {espacio.sensor.ultimaActualizacion}
          </InfoText>
        </InfoRow>
      </EspacioInfo>

      {espacio.vehiculoActual && (
        <VehiculoInfo>
          <PatenteText>🚗 {espacio.vehiculoActual.patente}</PatenteText>
          <TiempoText>
            Desde: {espacio.vehiculoActual.horaInicio} | Restante: {espacio.vehiculoActual.tiempoRestante}
          </TiempoText>
        </VehiculoInfo>
      )}

      <ActionButton onPress={() => onPress(espacio)}>
        <ActionButtonText>GESTIONAR</ActionButtonText>
      </ActionButton>
    </BaseCard>
  );
};

export default EspacioCard;
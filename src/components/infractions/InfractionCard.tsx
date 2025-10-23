import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import BaseCard from '../cards/BaseCard';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface Infraccion {
  id: string;
  numero: string;
  patente: string;
  motivo: string;
  monto: number;
  fecha: string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  ubicacion: string;
}

interface InfractionCardProps {
  infraccion: Infraccion;
  onPress: (infraccion: Infraccion) => void;
}

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${getDynamicSpacing(18)}px;
  gap: ${getDynamicSpacing(12)}px;
`;

const InfraccionNumber = styled.Text`
  font-size: ${getResponsiveSize(20)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  flex: 1;
  min-width: ${getResponsiveSize(100)}px;
`;

const EstadoBadge = styled.View<{ estado: string }>`
  background-color: ${props => {
    switch (props.estado) {
      case 'pendiente': return theme.colors.danger;
      case 'pagada': return theme.colors.success;
      case 'cancelada': return theme.colors.warning;
      default: return theme.colors.gray;
    }
  }};
  padding: ${getResponsiveSize(8)}px ${getResponsiveSize(14)}px;
  border-radius: ${getResponsiveSize(20)}px;
  flex-shrink: 0;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

const EstadoText = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
  color: ${theme.colors.white};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardBody = styled.View`
  flex-direction: column;
  gap: ${getDynamicSpacing(12)}px;
  margin-bottom: ${getDynamicSpacing(20)}px;
`;

const DetailRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${getDynamicSpacing(12)}px;
`;

const DetailIcon = styled.View`
  width: ${getResponsiveSize(28)}px;
  height: ${getResponsiveSize(28)}px;
  justify-content: center;
  align-items: center;
  background-color: rgba(46, 123, 220, 0.1);
  border-radius: ${getResponsiveSize(14)}px;
  flex-shrink: 0;
`;

const DetailContent = styled.View`
  flex: 1;
  min-width: 0;
`;

const DetailLabel = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.gray};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: ${getResponsiveSize(4)}px;
`;

const DetailValue = styled.Text`
  font-size: ${getResponsiveSize(15)}px;
  color: ${theme.colors.dark};
  font-weight: 500;
  line-height: ${getResponsiveSize(20)}px;
  flex-wrap: wrap;
`;

const MontoValue = styled.Text<{ estado: string }>`
  font-size: ${getResponsiveSize(18)}px;
  color: ${props => {
    switch (props.estado) {
      case 'pendiente': return theme.colors.danger;
      case 'pagada': return theme.colors.success;
      case 'cancelada': return theme.colors.warning;
      default: return theme.colors.dark;
    }
  }};
  font-weight: bold;
  line-height: ${getResponsiveSize(24)}px;
`;

const CardFooter = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  padding-top: ${getDynamicSpacing(15)}px;
  border-top-width: 1px;
  border-top-color: rgba(108, 117, 125, 0.15);
`;

const GestionarButton = styled.TouchableOpacity<{ estado: string }>`
  background-color: ${props => {
    switch (props.estado) {
      case 'pendiente': return theme.colors.danger;
      case 'pagada': return theme.colors.success;
      case 'cancelada': return theme.colors.warning;
      default: return theme.colors.primary;
    }
  }};
  padding: ${getResponsiveSize(12)}px ${getResponsiveSize(24)}px;
  border-radius: ${getResponsiveSize(25)}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: ${getResponsiveSize(8)}px;
  min-width: ${getResponsiveSize(130)}px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
`;

const GestionarButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(13)}px;
  font-weight: bold;
  letter-spacing: 0.5px;
`;

// Helper functions - Ahora usan colores anidados del theme
const getBackgroundColor = (estado: string): string => {
  switch (estado) {
    case 'pendiente': return theme.colors.transaccion.pendiente;
    case 'pagada': return theme.colors.transaccion.pagada;
    case 'cancelada': return theme.colors.transaccion.cancelada;
    default: return theme.colors.white;
  }
};

const getBorderColor = (estado: string): string => {
  switch (estado) {
    case 'pendiente': return theme.colors.danger;
    case 'pagada': return theme.colors.success;
    case 'cancelada': return theme.colors.warning;
    default: return theme.colors.gray;
  }
};

const getIconName = (tipo: string): any => {
  switch (tipo) {
    case 'patente': return 'car';
    case 'motivo': return 'alert-circle';
    case 'monto': return 'cash';
    case 'fecha': return 'calendar';
    case 'ubicacion': return 'location';
    default: return 'information-circle';
  }
};

const InfractionCard: React.FC<InfractionCardProps> = ({ infraccion, onPress }) => {
  return (
    <BaseCard
      backgroundColor={getBackgroundColor(infraccion.estado)}
      borderLeftColor={getBorderColor(infraccion.estado)}
      borderLeftWidth={getResponsiveSize(6)}
    >
      <CardHeader>
        <InfraccionNumber>#{infraccion.numero}</InfraccionNumber>
        <EstadoBadge estado={infraccion.estado}>
          <EstadoText>{infraccion.estado}</EstadoText>
        </EstadoBadge>
      </CardHeader>
      
      <CardBody>
        <DetailRow>
          <DetailIcon>
            <Ionicons name={getIconName('patente')} size={getResponsiveSize(16)} color={theme.colors.primary} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Patente</DetailLabel>
            <DetailValue>{infraccion.patente}</DetailValue>
          </DetailContent>
        </DetailRow>

        <DetailRow>
          <DetailIcon>
            <Ionicons name={getIconName('motivo')} size={getResponsiveSize(16)} color={theme.colors.primary} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Motivo</DetailLabel>
            <DetailValue>{infraccion.motivo}</DetailValue>
          </DetailContent>
        </DetailRow>

        <DetailRow>
          <DetailIcon>
            <Ionicons name={getIconName('monto')} size={getResponsiveSize(16)} color={theme.colors.primary} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Monto</DetailLabel>
            <MontoValue estado={infraccion.estado}>${infraccion.monto.toLocaleString()}</MontoValue>
          </DetailContent>
        </DetailRow>

        <DetailRow>
          <DetailIcon>
            <Ionicons name={getIconName('fecha')} size={getResponsiveSize(16)} color={theme.colors.primary} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Fecha</DetailLabel>
            <DetailValue>{infraccion.fecha}</DetailValue>
          </DetailContent>
        </DetailRow>

        <DetailRow>
          <DetailIcon>
            <Ionicons name={getIconName('ubicacion')} size={getResponsiveSize(16)} color={theme.colors.primary} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Ubicación</DetailLabel>
            <DetailValue>{infraccion.ubicacion}</DetailValue>
          </DetailContent>
        </DetailRow>
      </CardBody>

      <CardFooter>
        <GestionarButton estado={infraccion.estado} onPress={() => onPress(infraccion)}>
          <Ionicons name="settings" size={getResponsiveSize(16)} color={theme.colors.white} />
          <GestionarButtonText>GESTIONAR</GestionarButtonText>
        </GestionarButton>
      </CardFooter>
    </BaseCard>
  );
};

export default InfractionCard;
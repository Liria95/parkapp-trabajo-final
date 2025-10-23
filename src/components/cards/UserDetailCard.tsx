import React from 'react';
import styled from 'styled-components/native';
import BaseCard from './BaseCard';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  patente: string;
  saldo: number;
  telefono: string;
  estado: 'activo' | 'inactivo';
  ubicacionActual?: string;
  fechaRegistro: string;
  ultimaActividad: string;
}

interface UserDetailCardProps {
  usuario: Usuario;
  onPress: (usuario: Usuario) => void;
}

const UserHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${getDynamicSpacing(12)}px;
  gap: ${getDynamicSpacing(8)}px;
`;

const UserName = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  flex: 1;
`;

const StatusBadge = styled.View<{ estado: string }>`
  background-color: ${props => props.estado === 'activo' ? theme.colors.success : theme.colors.danger};
  padding: ${getResponsiveSize(6)}px ${getResponsiveSize(10)}px;
  border-radius: ${getResponsiveSize(15)}px;
  elevation: 2;
  flex-shrink: 0;
`;

const StatusText = styled.Text`
  font-size: ${getResponsiveSize(10)}px;
  font-weight: bold;
  color: ${theme.colors.white};
  text-transform: uppercase;
  text-align: center;
`;

const UserInfo = styled.View`
  gap: ${getDynamicSpacing(8)}px;
  margin-bottom: ${getDynamicSpacing(12)}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${getDynamicSpacing(8)}px;
  flex-wrap: wrap;
`;

const InfoLabel = styled.Text`
  font-size: ${getResponsiveSize(11)}px;
  color: ${theme.colors.gray};
  font-weight: 600;
  text-transform: uppercase;
  min-width: ${getResponsiveSize(60)}px;
`;

const InfoValue = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.dark};
  flex: 1;
  flex-wrap: wrap;
`;

const HighlightValue = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${theme.colors.primary};
  flex: 1;
`;

const LocationInfo = styled.View`
  background-color: rgba(0, 0, 0, 0.05);
  padding: ${getDynamicSpacing(10)}px;
  border-radius: ${getResponsiveSize(8)}px;
  margin-bottom: ${getDynamicSpacing(12)}px;
  border-left-width: ${getResponsiveSize(3)}px;
  border-left-color: ${theme.colors.primary};
`;

const LocationText = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const ActivityText = styled.Text`
  font-size: ${getResponsiveSize(11)}px;
  color: ${theme.colors.gray};
  font-style: italic;
  margin-top: ${getResponsiveSize(4)}px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: ${getDynamicSpacing(10)}px ${getDynamicSpacing(16)}px;
  border-radius: ${getResponsiveSize(8)}px;
  align-items: center;
  justify-content: center;
  elevation: 3;
  min-height: ${getResponsiveSize(40)}px;
`;

const ActionButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
  letter-spacing: 0.5px;
`;

// FUNCIÓN PARA OBTENER COLOR DE FONDO - USA COLORES DEL THEME
const getBackgroundColor = (estado: string): string => {
  switch (estado) {
    case 'activo': return '#E8F5E8';    // Verde claro (podría ser theme.colors.estado.libre si lo prefieres)
    case 'inactivo': return '#FFEBEE';  // Rojo claro (podría ser theme.colors.estado.ocupado si lo prefieres)
    default: return theme.colors.white;
  }
};

const getBorderColor = (estado: string): string => {
  switch (estado) {
    case 'activo': return theme.colors.success;
    case 'inactivo': return theme.colors.danger;
    default: return theme.colors.danger;
  }
};

const UserDetailCard: React.FC<UserDetailCardProps> = ({ usuario, onPress }) => {
  return (
    <BaseCard
      backgroundColor={getBackgroundColor(usuario.estado)}
      borderLeftColor={getBorderColor(usuario.estado)}
      borderLeftWidth={getResponsiveSize(5)}
    >
      <UserHeader>
        <UserName>{usuario.nombre}</UserName>
        <StatusBadge estado={usuario.estado}>
          <StatusText>{usuario.estado}</StatusText>
        </StatusBadge>
      </UserHeader>
      
      <UserInfo>
        <InfoRow>
          <InfoLabel>Patente:</InfoLabel>
          <InfoValue>{usuario.patente}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Saldo:</InfoLabel>
          <HighlightValue>${usuario.saldo.toFixed(2)}</HighlightValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Email:</InfoLabel>
          <InfoValue>{usuario.email}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Teléfono:</InfoLabel>
          <InfoValue>{usuario.telefono}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Registro:</InfoLabel>
          <InfoValue>{usuario.fechaRegistro}</InfoValue>
        </InfoRow>
      </UserInfo>

      {usuario.ubicacionActual && (
        <LocationInfo>
          <LocationText>📍 {usuario.ubicacionActual}</LocationText>
          <ActivityText>Última actividad: {usuario.ultimaActividad}</ActivityText>
        </LocationInfo>
      )}

      {!usuario.ubicacionActual && (
        <ActivityText>Última actividad: {usuario.ultimaActividad}</ActivityText>
      )}

      <ActionButton onPress={() => onPress(usuario)}>
        <ActionButtonText>VER HISTORIAL</ActionButtonText>
      </ActionButton>
    </BaseCard>
  );
};

export default UserDetailCard;
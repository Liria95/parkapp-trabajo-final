import React from 'react';
import styled from 'styled-components/native';
import BaseCard from './BaseCard';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing, breakpoints } from '../../utils/ResponsiveUtils';

interface User {
  id: string;
  name: string;
  plate?: string;
  email?: string;
  balance?: number;
  telefono?: string;
  currentLocation?: string;
  status: 'active' | 'inactive';
  fechaRegistro?: string;
  ultimaActividad?: string;
}

interface UserCardProps {
  user: User;
  onPress: (userId: string) => void;
  variant?: 'compact' | 'detailed'; // compact para AdminDashboard, detailed para GestionUsuarios
}

const UserContent = styled.View`
  flex: 1;
  gap: ${getDynamicSpacing(8)}px;
`;

const UserHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${getDynamicSpacing(8)}px;
`;

const UserName = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  flex: 1;
`;

const StatusBadge = styled.View<{ status: string }>`
  background-color: ${props => props.status === 'active' ? theme.colors.success : theme.colors.gray};
  padding: ${getResponsiveSize(4)}px ${getResponsiveSize(8)}px;
  border-radius: ${getResponsiveSize(12)}px;
  flex-shrink: 0;
`;

const StatusText = styled.Text`
  font-size: ${getResponsiveSize(9)}px;
  font-weight: bold;
  color: ${theme.colors.white};
  text-transform: uppercase;
`;

const UserInfo = styled.View`
  gap: ${getDynamicSpacing(4)}px;
`;

const InfoText = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.gray};
`;

const HighlightText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${theme.colors.primary};
`;

const LocationText = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: ${getDynamicSpacing(8)}px ${getDynamicSpacing(16)}px;
  border-radius: ${getResponsiveSize(4)}px;
  align-items: center;
  justify-content: center;
  min-width: ${getResponsiveSize(60)}px;
  min-height: ${getResponsiveSize(36)}px;
  margin-top: ${getDynamicSpacing(12)}px;
`;

const ActionButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
`;

const UserCard: React.FC<UserCardProps> = ({ user, onPress, variant = 'compact' }) => {
  return (
    <BaseCard backgroundColor={theme.colors.lightGray}>
      <UserContent>
        <UserHeader>
          <UserName>{user.name}</UserName>
          <StatusBadge status={user.status}>
            <StatusText>{user.status}</StatusText>
          </StatusBadge>
        </UserHeader>
        
        <UserInfo>
          {/* Información según el variant */}
          {variant === 'compact' ? (
            // Para AdminDashboard
            <>
              {user.plate && user.balance && (
                <HighlightText>{user.plate} | ${user.balance.toFixed(2)}</HighlightText>
              )}
              {user.status === 'active' && user.currentLocation ? (
                <LocationText>ACTUALMENTE: {user.currentLocation}</LocationText>
              ) : (
                <InfoText>SIN ACTIVIDAD</InfoText>
              )}
            </>
          ) : (
            // Para GestionUsuarios
            <>
              {user.plate && <InfoText>Patente: {user.plate}</InfoText>}
              {user.email && <InfoText>Email: {user.email}</InfoText>}
              {user.telefono && <InfoText>Teléfono: {user.telefono}</InfoText>}
              {user.balance !== undefined && (
                <HighlightText>Saldo: ${user.balance.toFixed(2)}</HighlightText>
              )}
              {user.fechaRegistro && <InfoText>Registro: {user.fechaRegistro}</InfoText>}
              {user.ultimaActividad && <InfoText>Última actividad: {user.ultimaActividad}</InfoText>}
            </>
          )}
        </UserInfo>

        <ActionButton onPress={() => onPress(user.id)}>
          <ActionButtonText>VER</ActionButtonText>
        </ActionButton>
      </UserContent>
    </BaseCard>
  );
};

export default UserCard;
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import BaseCard from '../cards/BaseCard';
import { colors } from '../../constants/colors';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface UsuarioEncontrado {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  saldo: number;
}

interface UserFoundCardProps {
  usuario: UsuarioEncontrado;
}

const UserFoundHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${getDynamicSpacing(10)}px;
  margin-bottom: ${getDynamicSpacing(8)}px;
`;

const UserFoundTitle = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${colors.dark};
`;

const UserFoundInfo = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${colors.gray};
  margin-bottom: ${getResponsiveSize(2)}px;
`;

const UserFoundCard: React.FC<UserFoundCardProps> = ({ usuario }) => {
  return (
    <BaseCard 
      backgroundColor="#E8F5E8" 
      borderLeftColor={colors.green}
      borderLeftWidth={getResponsiveSize(3)}
    >
      <UserFoundHeader>
        <Ionicons name="person-circle" size={getResponsiveSize(20)} color={colors.green} />
        <UserFoundTitle>Usuario Encontrado</UserFoundTitle>
      </UserFoundHeader>
      <UserFoundInfo>Nombre: {usuario.nombre}</UserFoundInfo>
      <UserFoundInfo>Email: {usuario.email}</UserFoundInfo>
      <UserFoundInfo>Teléfono: {usuario.telefono}</UserFoundInfo>
      <UserFoundInfo>Saldo: ${usuario.saldo.toFixed(2)}</UserFoundInfo>
    </BaseCard>
  );
};

export default UserFoundCard;
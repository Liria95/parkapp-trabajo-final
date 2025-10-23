import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface Usuario {
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

interface UserHistorialModalProps {
  usuario: Usuario;
}

const ModalSection = styled.View`
  margin-bottom: ${getDynamicSpacing(20)}px;
`;

const ModalSectionTitle = styled.Text`
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  margin-bottom: ${getDynamicSpacing(10)}px;
`;

const ModalText = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  color: ${theme.colors.gray};
  margin-bottom: ${getDynamicSpacing(5)}px;
  line-height: ${getResponsiveSize(20)}px;
`;

const UserHistorialModal: React.FC<UserHistorialModalProps> = ({ usuario }) => {
  return (
    <>
      <ModalSection>
        <ModalSectionTitle>Información General</ModalSectionTitle>
        <ModalText>Patente: {usuario.patente}</ModalText>
        <ModalText>Email: {usuario.email}</ModalText>
        <ModalText>Teléfono: {usuario.telefono}</ModalText>
        <ModalText>Fecha de registro: {usuario.fechaRegistro}</ModalText>
        <ModalText>Saldo actual: ${usuario.saldo.toFixed(2)}</ModalText>
      </ModalSection>

      <ModalSection>
        <ModalSectionTitle>Actividad Reciente</ModalSectionTitle>
        <ModalText>• Estacionamiento en AV. SAN MARTÍN - $50.00 (30/08/2025)</ModalText>
        <ModalText>• Recarga de saldo - +$500.00 (29/08/2025)</ModalText>
        <ModalText>• Estacionamiento en AV. BELGRANO - $75.00 (28/08/2025)</ModalText>
        <ModalText>• Multa pagada - -$2500.00 (27/08/2025)</ModalText>
      </ModalSection>
    </>
  );
};

export default UserHistorialModal;
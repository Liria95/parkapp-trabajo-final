import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import AppModal from '../common/AppModal';
import InputField from '../common/InputField';
import { colors } from '../../constants/colors';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface NuevaInfraccion {
  patente: string;
  motivo: string;
  monto: string;
  ubicacion: string;
}

interface CreateInfractionModalProps {
  visible: boolean;
  nuevaInfraccion: NuevaInfraccion;
  onClose: () => void;
  onFieldChange: (field: keyof NuevaInfraccion, value: string) => void;
  onCreate: () => void;
}

const ModalForm = styled.ScrollView`
  flex: 1;
  padding: ${getDynamicSpacing(24)}px;
`;

const FormSection = styled.View`
  gap: ${getDynamicSpacing(16)}px;
`;

const FieldDescription = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${colors.gray};
  margin-bottom: ${getDynamicSpacing(8)}px;
  line-height: ${getResponsiveSize(16)}px;
`;

const ButtonContainer = styled.View`
  padding: 0 ${getDynamicSpacing(24)}px ${getDynamicSpacing(24)}px;
  gap: ${getDynamicSpacing(12)}px;
`;

const ModalButton = styled.TouchableOpacity<{ primary?: boolean }>`
  background-color: ${props => props.primary ? colors.primary : colors.gray};
  padding: ${getDynamicSpacing(16)}px;
  border-radius: ${getResponsiveSize(12)}px;
  align-items: center;
  justify-content: center;
  min-height: ${getResponsiveSize(50)}px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
`;

const ModalButtonText = styled.Text`
  color: ${colors.white};
  font-size: ${getResponsiveSize(16)}px;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const CreateInfractionModal: React.FC<CreateInfractionModalProps> = ({
  visible,
  nuevaInfraccion,
  onClose,
  onFieldChange,
  onCreate,
}) => {
  return (
    <AppModal
      visible={visible}
      title="Nueva Infracción"
      onClose={onClose}
    >
      <ModalForm showsVerticalScrollIndicator={false}>
        <FormSection>
          <InputField
            label="Patente del Vehículo"
            iconName="car-outline"
            placeholder="ABC123"
            value={nuevaInfraccion.patente}
            onChangeText={(text) => onFieldChange('patente', text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={10}
          />
          <FieldDescription>
            Ingrese la patente del vehículo infractor (ej: ABC123)
          </FieldDescription>

          <InputField
            label="Motivo de la Infracción"
            iconName="alert-circle-outline"
            placeholder="TIEMPO EXCEDIDO"
            value={nuevaInfraccion.motivo}
            onChangeText={(text) => onFieldChange('motivo', text)}
            multiline={true}
            numberOfLines={2}
          />
          <FieldDescription>
            Describa el motivo de la infracción (ej: TIEMPO EXCEDIDO, SIN REGISTRO, etc.)
          </FieldDescription>

          <InputField
            label="Monto de la Multa"
            iconName="cash-outline"
            placeholder="2500"
            value={nuevaInfraccion.monto}
            onChangeText={(text) => onFieldChange('monto', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <FieldDescription>
            Ingrese el monto de la multa en pesos (solo números)
          </FieldDescription>

          <InputField
            label="Ubicación de la Infracción"
            iconName="location-outline"
            placeholder="AV. SAN MARTÍN 123"
            value={nuevaInfraccion.ubicacion}
            onChangeText={(text) => onFieldChange('ubicacion', text)}
            multiline={true}
            numberOfLines={2}
          />
          <FieldDescription>
            Indique la dirección exacta donde ocurrió la infracción
          </FieldDescription>
        </FormSection>
      </ModalForm>

      <ButtonContainer>
        <ModalButton primary onPress={onCreate}>
          <ModalButtonText>Crear Infracción</ModalButtonText>
        </ModalButton>
        <ModalButton onPress={onClose}>
          <ModalButtonText>Cancelar</ModalButtonText>
        </ModalButton>
      </ButtonContainer>
    </AppModal>
  );
};

export default CreateInfractionModal;
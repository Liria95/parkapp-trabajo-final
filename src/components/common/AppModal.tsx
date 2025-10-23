import React from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';
import { getResponsiveSize, getDynamicSpacing, breakpoints } from '../..//utils/ResponsiveUtils';

interface AppModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
  padding: ${getDynamicSpacing(20)}px;
`;

const ModalContent = styled.View`
  background-color: ${theme.colors.white};
  border-radius: ${getResponsiveSize(16)}px;
  width: ${
    breakpoints.isDesktop ? '50%' 
    : breakpoints.isLargeTablet ? '65%' 
    : breakpoints.isTablet ? '80%' 
    : breakpoints.isLargePhone ? '90%'
    : '95%'
  };
  max-width: ${getResponsiveSize(600)}px;
  max-height: 85%;
  elevation: 10;
  shadow-color: #000;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.3;
  shadow-radius: 20px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${getDynamicSpacing(20)}px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const ModalTitle = styled.Text`
  font-size: ${getResponsiveSize(18)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  flex: 1;
`;

const ModalBody = styled.ScrollView`
  padding: ${getDynamicSpacing(20)}px;
`;

const AppModal: React.FC<AppModalProps> = ({
  visible,
  title,
  onClose,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={getResponsiveSize(24)} color={theme.colors.gray} />
            </TouchableOpacity>
          </ModalHeader>
          <ModalBody>
            {children}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default AppModal;
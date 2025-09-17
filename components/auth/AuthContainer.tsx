import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';

interface AuthContainerProps {
  children: React.ReactNode;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${colors.lightGray};
`;

const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <Container>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default AuthContainer;
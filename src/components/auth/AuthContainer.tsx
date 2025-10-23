import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;

interface AuthContainerProps {
  children: React.ReactNode;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.lightGray};
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
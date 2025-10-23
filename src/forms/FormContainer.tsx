import React from 'react';
import styled from 'styled-components/native';

interface FormContainerProps {
  children: React.ReactNode;
  paddingHorizontal?: number;
}

const Container = styled.View<{ paddingHorizontal: number }>`
  padding: 0 ${props => props.paddingHorizontal}px;
  flex: 1;
`;

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  paddingHorizontal = 40,
}) => {
  return (
    <Container paddingHorizontal={paddingHorizontal}>
      {children}
    </Container>
  );
};

export default FormContainer;
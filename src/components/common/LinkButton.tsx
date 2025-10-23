import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme';

interface LinkButtonProps {
  normalText: string;
  linkText: string;
  onPress: () => void;
  style?: any;
}

const LinkContainer = styled.TouchableOpacity`
  align-items: center;
  margin-top: 30px;
`;

const NormalText = styled.Text`
  font-size: 14px;
  color: ${theme.colors.gray};
`;

const LinkText = styled.Text`
  font-weight: bold;
  color: ${theme.colors.primary};
`;

const LinkButton: React.FC<LinkButtonProps> = ({
  normalText,
  linkText,
  onPress,
  style,
}) => {
  return (
    <LinkContainer onPress={onPress} style={style}>
      <NormalText>
        {normalText} <LinkText>{linkText}</LinkText>
      </NormalText>
    </LinkContainer>
  );
};

export default LinkButton;
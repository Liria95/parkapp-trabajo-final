import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colors } from '../../constants/colors';
import { getResponsiveSize, getDynamicSpacing } from '../../utils/ResponsiveUtils';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: any;
}

const SearchContainer = styled.View`
  padding: 0 ${getDynamicSpacing(20)}px ${getDynamicSpacing(15)}px ${getDynamicSpacing(20)}px;
`;

const SearchBarWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.white};
  border-radius: ${getResponsiveSize(12)}px;
  padding: ${getDynamicSpacing(12)}px ${getDynamicSpacing(15)}px;
  border: 2px solid #E0E0E0;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: ${getDynamicSpacing(10)}px;
  font-size: ${getResponsiveSize(16)}px;
  color: ${colors.dark};
  min-height: ${getResponsiveSize(24)}px;
`;

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Buscar...",
  containerStyle,
}) => {
  return (
    <SearchContainer style={containerStyle}>
      <SearchBarWrapper>
        <Ionicons name="search" size={getResponsiveSize(20)} color={colors.gray} />
        <SearchInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={getResponsiveSize(20)} color={colors.gray} />
          </TouchableOpacity>
        )}
      </SearchBarWrapper>
    </SearchContainer>
  );
};

export default SearchBar;
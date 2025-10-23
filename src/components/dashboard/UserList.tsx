import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../config/theme' ;
import { getResponsiveSize, breakpoints } from '../../utils/ResponsiveUtils';

interface User {
  id: string;
  name: string;
  plate: string;
  balance: number;
  currentLocation?: string;
  status: 'active' | 'inactive';
}

interface UserListProps {
  users: User[];
  onUserAction: (userId: string) => void;
}

const UserItem = styled.View`
  flex-direction: ${breakpoints.isTablet ? 'row' : 'column'};
  justify-content: space-between;
  align-items: ${breakpoints.isTablet ? 'center' : 'stretch'};
  padding: ${getResponsiveSize(16)}px ${getResponsiveSize(20)}px;
  border-bottom-width: 1px;
  border-bottom-color: #F5F5F5;
  gap: ${getResponsiveSize(12)}px;
`;

const UserContent = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: ${getResponsiveSize(4)}px;
`;

const UserMainInfo = styled.Text`
  font-size: ${getResponsiveSize(14)}px;
  font-weight: bold;
  color: ${theme.colors.dark};
  margin-bottom: ${getResponsiveSize(4)}px;
`;

const UserLocation = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.primary};
  margin-bottom: ${getResponsiveSize(4)}px;
  flex-wrap: wrap;
`;

const UserName = styled.Text`
  font-size: ${getResponsiveSize(12)}px;
  color: ${theme.colors.gray};
`;

const UserActionButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: ${getResponsiveSize(8)}px ${getResponsiveSize(16)}px;
  border-radius: ${getResponsiveSize(4)}px;
  align-items: center;
  justify-content: center;
  min-width: ${getResponsiveSize(60)}px;
  min-height: ${getResponsiveSize(36)}px;
  align-self: ${breakpoints.isTablet ? 'center' : 'stretch'};
`;

const UserActionText = styled.Text`
  color: ${theme.colors.white};
  font-size: ${getResponsiveSize(12)}px;
  font-weight: bold;
`;

const UserList: React.FC<UserListProps> = ({ users, onUserAction }) => {
  return (
    <ScrollView nestedScrollEnabled={false}>
      {users.map((user) => (
        <UserItem key={user.id}>
          <UserContent>
            <UserMainInfo>
              {user.plate} | ${user.balance.toFixed(2)}
            </UserMainInfo>
            <UserLocation>
              {user.status === 'active' && user.currentLocation 
                ? `ACTUALMENTE: ${user.currentLocation}` 
                : 'SIN ACTIVIDAD'
              }
            </UserLocation>
            <UserName>{user.name}</UserName>
          </UserContent>
          <UserActionButton onPress={() => onUserAction(user.id)}>
            <UserActionText>VER</UserActionText>
          </UserActionButton>
        </UserItem>
      ))}
    </ScrollView>
  );
};

export default UserList;
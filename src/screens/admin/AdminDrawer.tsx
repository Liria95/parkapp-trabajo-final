import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import AdminPanel from './AdminPanel';
import ConfiguracionesScreen from './Configuraciones';
import { useContext } from 'react';
import { AUTH_ACTIONS, AuthContext } from '../../components/shared/Context/AuthContext/AuthContext';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    // Redirige a Login y reinicia la navegación
    props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };
  
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar sesión"
        onPress={handleLogout}
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color={color} />
        )}
      />
    </DrawerContentScrollView>
    );
} 

export default function AdminDrawer() {
  return (  
    <Drawer.Navigator
        initialRouteName="AdminPanel"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: true }}>

      <Drawer.Screen 
        name="AdminPanel" 
        component={AdminPanel} 
        options={{ title: "Admin Panel",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen 
        name="Configuraciones" 
        component={ConfiguracionesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
      }}
      />

    </Drawer.Navigator>
  );
}

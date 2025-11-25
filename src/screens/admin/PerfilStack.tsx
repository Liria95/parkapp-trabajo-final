import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import Historial from './Historial'; 
import ConfiguracionStack from './ConfiguracionStack';
import PerfilAdmin from './PerfilAdmin';

const Stack = createStackNavigator();

//No es una pantalla
//Establece el stack del perfil del admin

export default function Perfil() {
  return (  
    <Stack.Navigator
      initialRouteName="PerfilAdmin"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8f8f8',
        },
        headerTintColor: '#333',
      }}>

      <Stack.Screen 
        name="PerfilAdmin" 
        component={PerfilAdmin} 
        options={{ 
          title: "Mi Perfil", 
          headerShown: true
        }}
      />

      <Stack.Screen 
        name="Historial" 
        component={Historial} 
        options={{ 
          title: "Mi Perfil",
        }}
      />
      
      <Stack.Screen 
        name="ConfiguracionStack" 
        component={ConfiguracionStack}
        options={{
            headerShown: false, 
        }}
      />

    </Stack.Navigator>
  );
}
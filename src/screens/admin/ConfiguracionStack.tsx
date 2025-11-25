import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import ConfiguracionScreen from './ConfiguracionScreen';
import EditarPerfil from '../user/pantallas/perfilUser/EditarPerfil';

// Stack para editar o eliminar
export type ConfiguracionStackParamList = {
  ConfiguracionRoot: undefined; 
  EditarPerfil: undefined;     
};

const Stack = createStackNavigator<ConfiguracionStackParamList>();

//Defino el stack. 


export default function ConfiguracionStack() {
  return (
    <Stack.Navigator
      initialRouteName="ConfiguracionRoot"
      screenOptions={{
        headerShown: true, // Queremos el encabezado para la flecha de "Volver"
      }}
    >
      {/* pantalla raíz */}
      <Stack.Screen 
        name="ConfiguracionRoot" 
        component={ConfiguracionScreen}
        options={{ title: 'Volver' }} 
      />
      
      <Stack.Screen 
        name="EditarPerfil" 
        component={EditarPerfil}
        options={{ title: 'Editar Mi Perfil', headerShown: false}}
      />
    </Stack.Navigator>


    //Por ahora no está disponible eliminar la cuenta

  );
}
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavegadorTabs from "./NavegadorTabs";
import PantallaEstacionamientoActivo from "../pantallas/Estacionamiento/EstacionamientoActivo";
import InfraccionesPendientes from "../pantallas/perfilUser/infraccionesPendientes";
import NotificationsScreen from "../pantallas/perfilUser/NotificationsScreen";
import Configuracion from "../pantallas/perfilUser/Configuracion";
import EditarPerfil from "../pantallas/perfilUser/EditarPerfil";
import EliminarCuenta from "../pantallas/perfilUser/EliminarCuenta";

const Stack = createNativeStackNavigator();

export default function NavegadorPrincipal() {
  return (
    <Stack.Navigator>
      {/* Navegador principal */}
      <Stack.Screen
        name="Tabs"
        component={NavegadorTabs}
        options={{ headerShown: false }}
      />

      {/* Estacionamiento */}
      <Stack.Screen
        name="EstacionamientoActivo"
        component={PantallaEstacionamientoActivo}
      />

      {/* Pantallas de perfil */}
      <Stack.Screen
        name="InfraccionesPendientes"
        component={InfraccionesPendientes}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Configuracion"
        component={Configuracion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfil}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EliminarCuenta"
        component={EliminarCuenta}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

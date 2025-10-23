import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavegadorTabs from "./NavegadorTabs";
import PantallaEstacionamientoActivo from "../pantallas/Estacionamiento/EstacionamientoActivo";
import ModalExtender from "../componentes/modales/ModalExtender";
import ModalRecargar from "../componentes/modales/ModalRecargar";

const Stack = createNativeStackNavigator();

export default function NavegadorPrincipal() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={NavegadorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EstacionamientoActivo" component={PantallaEstacionamientoActivo} />
      <Stack.Screen name="ModalExtender" component={ModalExtender} />
      <Stack.Screen name="ModalRecargar" component={ModalRecargar} />
    </Stack.Navigator>
  );
}

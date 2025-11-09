import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PantallaPerfil from "../pantallas/perfilUser/Perfil";
import PantallaMetodosPago from "../pantallas/perfilUser/MetodosPago";
import PantallaInfraccionesPendientes from "../pantallas/perfilUser/infraccionesPendientes";

const Stack = createNativeStackNavigator();

export default function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilInicio" component={PantallaPerfil} />
      <Stack.Screen name="MetodosPago" component={PantallaMetodosPago} />
      <Stack.Screen
        name="InfraccionesPendientes"
        component={PantallaInfraccionesPendientes}
      />
    </Stack.Navigator>
  );
}
import React from "react";
import PantallaRegistrarVehiculo from "../pantallas/Estacionamiento/RegistrarVehiculo";
import PantallaEstacionamientoActivo from "../pantallas/Estacionamiento/EstacionamientoActivo";
import { RUTAS } from "../constantes/rutas";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useUsuario } from "../contexto/useUsuario";
import PantallaMapa from "../pantallas/Mapa/Mapa";
import PantallaRegistrar from "../pantallas/Estacionamiento/RegistrarVehiculo";
import PantallaSaldo from "../pantallas/Saldo/Saldo";
import PantallaPerfil from "../pantallas/perfilUser/Perfil";
import { theme } from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RutasStackParamList } from "../tipos/RutasStack";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const Tab = createBottomTabNavigator();

export default function NavegadorTabs() {
  const { estacionamiento } = useUsuario();
  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = "";

            switch (route.name) {
              case "Mapa":
                iconName = "map-outline";
                break;
              case "Registrar":
                iconName = "scan-outline";
                break;
              case "Saldo":
                iconName = "wallet-outline";
                break;
              case "Perfil":
                iconName = "person-outline";
                break;
              case "EstacionamientoActivo":
                iconName = "time-outline";
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.dark,
          tabBarLabelStyle: { fontSize: 12 },
        })}
      >
        <Tab.Screen name="Mapa" component={PantallaMapa} />
        <Tab.Screen name="Registrar" component={PantallaRegistrar} />
        <Tab.Screen name="Saldo" component={PantallaSaldo} />
        <Tab.Screen name="Perfil" component={PantallaPerfil} />

        {estacionamiento?.activo && (
          <Tab.Screen
            name="EstacionamientoActivo"
            component={PantallaEstacionamientoActivo}
            options={{
              tabBarLabel: ({ focused }) => (
                <Text
                  style={{
                    color: theme.colors.danger,
                    fontWeight: focused ? "bold" : "normal",
                    fontSize: 12,
                  }}
                >
                  ACTIVO
                </Text>
              ),
              tabBarIcon: ({ color, size }) => (
                <Animatable.View
                  animation="rubberBand"
                  iterationCount="infinite"
                  duration={1500}
                  easing="ease-out"
                >
                  <Ionicons 
                    name="car-sport-outline" 
                    size={size + 5} 
                    color={theme.colors.danger} 
                  />
                </Animatable.View>
              ),
            }}
          />
        )}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  botonFlotante: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
  },
  textoBoton: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});
import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colores from "../../constantes/colores";
import InfoUsuario from "./InfoUsuario";
import OpcionMenu from "./OpcionMenu";
import BotonCerrarSesion from "./BotonCerrarSesion";
import AuthContext from "../../../../components/shared/Context/AuthContext/auth-context";
import { AUTH_ACTIONS } from "../../../../components/shared/Context/AuthContext/enums";

export default function Perfil() {
  const { dispatch, state } = useContext(AuthContext);

  const usuario = {
    nombre: state.user?.nombre || "Usuario",
    email: state.user?.email || "usuario@email.com",
    avatar: state.user?.avatar || ""
  };

  const opcionesMenu = [
    { id: 1, titulo: "Mis vehículos", icono: "car-sport" as const },
    { id: 2, titulo: "Notificaciones", icono: "notifications" as const },
    { id: 3, titulo: "Métodos de pago", icono: "card" as const },
    { id: 4, titulo: "Infracciones pendientes", icono: "warning" as const },
    { id: 5, titulo: "Configuración", icono: "settings" as const },
  ];

  const handleOpcionPress = (titulo: string) => {
    console.log("Navegando a:", titulo);
  };

  const handleCerrarSesion = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.titulo}>MI PERFIL</Text>
      </View>

      <InfoUsuario 
        nombre={usuario.nombre}
        email={usuario.email}
        avatar={usuario.avatar}
      />

      <View style={styles.menuContainer}>
        {opcionesMenu.map((opcion) => (
          <OpcionMenu
            key={opcion.id}
            titulo={opcion.titulo}
            icono={opcion.icono}
            onPress={() => handleOpcionPress(opcion.titulo)}
          />
        ))}
      </View>

      <BotonCerrarSesion onPress={handleCerrarSesion} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colores.AZUL_PRINCIPAL,
    textAlign: "center",
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
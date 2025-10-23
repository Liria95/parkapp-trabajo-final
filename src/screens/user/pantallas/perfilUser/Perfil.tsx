import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { theme } from "../../../../config/theme";
import InfoUsuario from "./InfoUsuario";
import OpcionMenu from "./OpcionMenu";
import BotonCerrarSesion from "./BotonCerrarSesion";
import AuthContext from "../../../../components/shared/Context/AuthContext/auth-context";
import { AUTH_ACTIONS } from "../../../../components/shared/Context/AuthContext/enums";

export default function Perfil() {
  const { dispatch, state } = useContext(AuthContext);

  const usuario = {
    nombre: state.user?.name || "Usuario",
    apellido: state.user?.surname || "",
    email: state.user?.email || "usuario@email.com",
    avatar: state.user?.avatar || ""
  };

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();

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

  // SUBIR FOTO AL SERVIDOR
  const handleAvatarChange = async (uri: string) => {
    try {
      console.log('📷 Nueva foto seleccionada:', uri);

      // Crear FormData para subir la imagen
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      console.log('📤 Subiendo foto al servidor...');

      // Subir al servidor
      const response = await fetch('http://192.168.1.5:3000/api/user/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (data.success) {
        Alert.alert('Éxito', 'Foto de perfil actualizada');

        // Actualizar contexto con la URL de Cloudinary
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: {
            ...state.user,
            avatar: data.photoUrl,
          },
        });
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar la foto');
      }

    } catch (error) {
      console.error('❌ Error al subir foto:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor. Verifica que esté corriendo.');
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: () => dispatch({ type: AUTH_ACTIONS.LOGOUT })
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.titulo}>MI PERFIL</Text>
      </View>

      <InfoUsuario 
        nombre={nombreCompleto}
        email={usuario.email}
        avatar={usuario.avatar}
        onAvatarChange={handleAvatarChange}
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
    backgroundColor: theme.colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
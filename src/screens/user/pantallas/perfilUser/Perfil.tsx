import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { theme } from "../../../../config/theme";
import InfoUsuario from "./InfoUsuario";
import OpcionMenu from "./OpcionMenu";
import BotonCerrarSesion from "./BotonCerrarSesion";
import { AuthContext, AUTH_ACTIONS } from '../../../../components/shared/Context/AuthContext/AuthContext';
import { API_URLS } from '../../../../config/api.config';
import { useNavigation } from '@react-navigation/native';

export default function Perfil() {
  const { dispatch, state } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const usuario = {
    nombre: state.user?.name || "Usuario",
    apellido: state.user?.surname || "",
    email: state.user?.email || "usuario@email.com",
    avatar: state.user?.avatar || ""
  };

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();

  const opcionesMenu = [
    { id: 1, titulo: "Mis vehículos", icono: "car-sport" as const, screen: null },
    { id: 2, titulo: "Notificaciones", icono: "notifications" as const, screen: 'NotificationsScreen' },
    { id: 3, titulo: "Infracciones pendientes", icono: "warning" as const, screen: 'InfraccionesPendientes' },
    { id: 4, titulo: "Configuración", icono: "settings" as const, screen: 'Configuracion' },
  ];

  const handleOpcionPress = (titulo: string, screen: string | null) => {
    console.log("Navegando a:", titulo);
    if (screen) {
      navigation.navigate(screen);
    } else {
      Alert.alert('Próximamente', `La sección "${titulo}" estará disponible pronto`);
    }
  };

  const handleAvatarChange = async (uri: string) => {
    try {
      console.log('Nueva foto seleccionada:', uri);

      if (!state.token) {
        Alert.alert('Error', 'No hay token de autenticación');
        return;
      }

      const formData = new FormData();
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri,
        type: type,
        name: filename,
      } as any);

      const response = await fetch(`${API_URLS.USERS}/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Éxito', 'Foto de perfil actualizada');
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: {
            user: {
              ...state.user,
              avatar: data.photoUrl,
            }
          },
        });
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar la foto');
      }

    } catch (error) {
      console.error('Error al subir foto:', error);
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica:\n\n' +
        '1. Que el backend esté corriendo\n' +
        '2. Que tu celular y PC estén en la misma WiFi\n' +
        '3. Que la IP sea correcta'
      );
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
          onPress: () => {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            console.log('Sesión cerrada');
          }
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
            onPress={() => handleOpcionPress(opcion.titulo, opcion.screen)}
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

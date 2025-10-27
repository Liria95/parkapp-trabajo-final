import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { theme } from "../../../../config/theme";
import InfoUsuario from "./InfoUsuario";
import OpcionMenu from "./OpcionMenu";
import BotonCerrarSesion from "./BotonCerrarSesion";
import { AuthContext, AUTH_ACTIONS } from '../../../../components/shared/Context/AuthContext';
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

  // ========================================
  // SUBIR FOTO AL SERVIDOR (CORREGIDO)
  // ========================================
  const handleAvatarChange = async (uri: string) => {
    try {
      console.log('📷 Nueva foto seleccionada:', uri);

      // Validar que hay token
      if (!state.token) {
        Alert.alert('Error', 'No hay token de autenticación');
        return;
      }

      // Crear FormData para subir la imagen
      const formData = new FormData();
      
      // Extraer información del archivo
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri,
        type: type,
        name: filename,
      } as any);

      console.log('📤 Subiendo foto al servidor...');
      console.log('📦 Archivo:', { filename, type });
      console.log('🔗 URL:', 'http://192.168.1.7:3000/api/users/profile-photo');

      // ✅ CAMBIO 1: URL corregida con IP correcta y ruta correcta
      const response = await fetch('http://192.168.1.7:3000/api/users/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          // NO agregar Content-Type, FormData lo maneja automáticamente
        },
        body: formData,
      });

      console.log('🔵 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok && data.success) {
        Alert.alert('Éxito', 'Foto de perfil actualizada');

        // ✅ CAMBIO 2: Actualizar contexto correctamente con user anidado
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: {
            user: {
              ...state.user,
              avatar: data.photoUrl,
            }
          },
        });

        console.log('✅ Avatar actualizado en contexto:', data.photoUrl);
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar la foto');
      }

    } catch (error) {
      console.error('❌ Error al subir foto:', error);
      Alert.alert(
        'Error de conexión', 
        'No se pudo conectar con el servidor. Verifica:\n\n' +
        '1. Que el backend esté corriendo\n' +
        '2. Que tu celular y PC estén en la misma WiFi\n' +
        '3. Que la IP sea correcta (192.168.1.7)'
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
            console.log('🚪 Sesión cerrada');
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
import { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, AUTH_ACTIONS } from '../../components/shared/Context/AuthContext/AuthContext'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from "../../config/theme";
import InfoUsuario from "../user/pantallas/perfilUser/InfoUsuario";
import OpcionMenu from "../user/pantallas/perfilUser/OpcionMenu";

const BotonCerrarSesion = ({ onPress }: any) => (
  <TouchableOpacity style={botonCerrarStyles.container} onPress={onPress}>
    <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
    <Text style={botonCerrarStyles.texto}>Cerrar Sesión</Text>
  </TouchableOpacity>
);


// Stack del Admin
type AdminStackParamList = {
  PerfilAdmin: undefined;
  Historial: undefined;
  ConfiguracionStack: undefined;
  Login: undefined; // Para el reset
};
type PerfilAdminNavigationProp = StackNavigationProp<AdminStackParamList, 'PerfilAdmin'>;


export default function PerfilAdmin() {
  const { dispatch, state } = useContext(AuthContext);
  const navigation = useNavigation<PerfilAdminNavigationProp>();

  const usuario = {
    nombre: state.user?.name || "Admin",
    apellido: state.user?.surname || "",
    email: state.user?.email || "admin@sistema.com",
    avatar: state.user?.avatar || ""
  };

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim() || "Administrador";

  const opcionesMenu = [
    { id: 1, titulo: "Historial", icono: "briefcase" as const, screen: 'Historial' },
    { id: 2, titulo: "Configuración", icono: "settings" as const, screen: 'ConfiguracionStack' },
    // El logout se maneja aparte
  ];

  const handleOpcionPress = (titulo: string, screen: keyof AdminStackParamList) => {
    console.log("Navegando a:", titulo);
    navigation.navigate(screen as any);
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
            // Redirige a Login y reinicia la navegación (como lo hacía el Drawer)
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
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
        onAvatarChange={() => console.log('Cambio de avatar')}
      />

      <View style={styles.menuContainer}>
        {opcionesMenu.map((opcion) => (
          <OpcionMenu
            key={opcion.id}
            titulo={opcion.titulo}
            icono={opcion.icono}
            onPress={() => handleOpcionPress(opcion.titulo, opcion.screen as keyof AdminStackParamList)}
          />
        ))}
      </View>

      <BotonCerrarSesion onPress={handleCerrarSesion} />
      
      <View style={{ height: 50 }} />
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
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.dark,
    textAlign: "center",
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

// Estilos auxiliares
const infoUsuarioStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: theme.colors.lightGray,
        marginHorizontal: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: theme.colors.white,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.secondary,
        borderRadius: 15,
        padding: 5,
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.dark,
    },
    email: {
        fontSize: 14,
        color: theme.colors.gray,
        marginTop: 4,
    },
});

const opcionMenuStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    icon: {
        marginRight: 15,
    },
    titulo: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.dark,
        fontWeight: '500',
    },
});

const botonCerrarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.white,
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: theme.colors.danger,
        shadowColor: theme.colors.danger,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    texto: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.danger,
    },
});
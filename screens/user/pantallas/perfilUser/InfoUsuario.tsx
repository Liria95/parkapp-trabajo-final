import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import colores from "../../constantes/colores";

interface InfoUsuarioProps {
  nombre: string;
  email: string;
  avatar?: string;
}

export default function InfoUsuario({ nombre, email, avatar }: InfoUsuarioProps) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.iniciales}>
              {nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.nombre}>{nombre}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colores.AZUL_SECUNDARIO,
    justifyContent: "center",
    alignItems: "center",
  },
  iniciales: {
    fontSize: 36,
    fontWeight: "bold",
    color: colores.BLANCO,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: colores.GRIS_OSCURO,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
});
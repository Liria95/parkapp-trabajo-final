import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../../config/theme";

interface BotonCerrarSesionProps {
  onPress: () => void;
}

export default function BotonCerrarSesion({ onPress }: BotonCerrarSesionProps) {
  return (
    <TouchableOpacity style={styles.boton} onPress={onPress}>
      <Ionicons name="log-out-outline" size={20} color={theme.colors.primary} />
      <Text style={styles.texto}>Cerrar sesión</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  texto: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
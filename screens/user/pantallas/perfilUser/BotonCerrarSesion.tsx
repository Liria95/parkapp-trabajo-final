import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colores from "../../constantes/colores";

interface BotonCerrarSesionProps {
  onPress: () => void;
}

export default function BotonCerrarSesion({ onPress }: BotonCerrarSesionProps) {
  return (
    <TouchableOpacity style={styles.boton} onPress={onPress}>
      <Ionicons name="log-out-outline" size={20} color={colores.AZUL_PRINCIPAL} />
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
    borderColor: colores.AZUL_PRINCIPAL,
  },
  texto: {
    fontSize: 16,
    color: colores.AZUL_PRINCIPAL,
    fontWeight: "600",
  },
});
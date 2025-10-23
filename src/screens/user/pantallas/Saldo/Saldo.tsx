import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import { theme } from "../../../../config/theme";

export default function Saldo() {
  return (
    <View style={styles.contenedor}>
      <TarjetaGradiente colores={[theme.colors.primary, theme.colors.success]}>
        <Text style={styles.texto}>Vista SALDO en construcción 🚧</Text>
      </TarjetaGradiente>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  texto: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.white,
    textAlign: "center",
    padding: 20,
  },
});
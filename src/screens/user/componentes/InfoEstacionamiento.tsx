import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../config/theme";

type Props = {
  ubicacion: string;
  tarifa: string;
  limite: string;
};

export default function InfoEstacionamiento({ ubicacion, tarifa, limite }: Props) {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.titulo}>Detalles del estacionamiento</Text> */}

      <View style={styles.fila}>
        <Text style={styles.label}>UBICACION:</Text>
        <Text style={styles.valor}>{ubicacion}</Text>
      </View>

      <View style={styles.fila}>
        <Text style={styles.label}>TARIFA:</Text>
        <Text style={styles.valor}>{tarifa}</Text>
      </View>

      <View style={styles.fila}>
        <Text style={styles.label}>LIMITE:</Text>
        <Text style={styles.valor}>{limite}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    padding: 15,
    width: "80%",
    justifyContent: "center",
    // borderRadius: 12,
    // backgroundColor: "#f5f5f5",
    // borderWidth: 1,
    // borderColor: theme.colors.dark,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  fila: {
    // flexDirection: "row",
    marginBottom: 6,
    marginTop: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.dark,
  },
  valor: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.dark,
  },
});
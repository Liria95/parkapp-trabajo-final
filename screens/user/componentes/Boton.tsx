import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import colores from "../constantes/colores";

type Props = {
  titulo: string;
  tipo?: "relleno" | "borde";         // relleno = fondo sólido, borde = solo contorno punteado
  color?: string;                     // color base (default = azul principal)
  redondeado?: "alto" | "bajo";       // nivel de redondeo
  estiloBorde?: "solid"
  estilo?: ViewStyle;
  onPress: () => void;
};

export default function BotonPunteado({
  titulo,
  tipo = "borde",
  color = colores.AZUL_PRINCIPAL,
  redondeado = "alto",
  onPress,
  estilo
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.boton,
        {
          borderColor: color,
          backgroundColor: tipo === "relleno" ? color : "transparent",
          borderRadius: redondeado === "alto" ? 25 : 8, 
        },
        estilo,
      ]}
    >
      <Text
        style={[
          styles.texto,
          { color: tipo === "relleno" ? colores.BLANCO : color },
        ]}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    borderWidth: 2,
    borderStyle: "dashed",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    minWidth: 200,
    alignItems: "center",
  },
  texto: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

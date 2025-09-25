import React, { useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import BotonPrimSec from "../../componentes/Boton";
import colores from "../../constantes/colores";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (horas: number, minutos: number) => void;
};

export default function ModalExtender({ visible, onClose, onConfirm }: Props) {
  const [horas, setHoras] = useState(1);
  const [minutos, setMinutos] = useState(0);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>EXTENDER ESTACIONAMIENTO</Text>

          <View style={styles.controles}>
            <BotonPrimSec
              titulo="+1 hora"
              tipo="relleno"
              color={colores.AZUL_PRINCIPAL}
              estilo={styles.botonChico}
              onPress={() => setHoras(horas + 1)}
            />
            <BotonPrimSec
              titulo="+10 min"
              tipo="relleno"
              color={colores.VERDE_ACENTO}
              estilo={styles.botonChico}
              onPress={() => setMinutos(minutos + 10)}
            />
          </View>

          <Text style={styles.seleccionado}>
            Seleccionado: {horas}h {minutos}m
          </Text>

          <View style={styles.botones}>
            <BotonPrimSec
              titulo="Aceptar"
              tipo="relleno"
              color={colores.AZUL_PRINCIPAL}
            //   onPress={() => onConfirm?.(horas, minutos)}
            />
            <BotonPrimSec
              titulo="Cancelar"
              tipo="borde"
              color={colores.GRIS_OSCURO}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: colores.AZUL_PRINCIPAL,
    marginBottom: 20,
  },
  controles: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
  },
  botonChico: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  seleccionado: {
    fontSize: 16,
    fontWeight: "600",
    color: colores.GRIS_OSCURO,
    marginBottom: 25,
  },
  botones: {
    width: "100%",
    gap: 10,
  },
});

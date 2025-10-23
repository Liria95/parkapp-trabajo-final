import React from "react";
import { Modal, View, Text, FlatList, Button, StyleSheet } from "react-native";

type Movimiento = {
  id: string;
  descripcion: string;
  fecha: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  datos: Movimiento[];
};

export default function ModalHistorial({ visible, onClose, datos }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>Historial</Text>
          <FlatList
            data={datos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text>{item.fecha} - {item.descripcion}</Text>
            )}
          />
          <Button title="Cerrar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  contenido: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", maxHeight: "70%" },
  titulo: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});

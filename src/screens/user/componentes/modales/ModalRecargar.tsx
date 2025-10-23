import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ModalRecargar({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>Selecciona monto a recargar</Text> 
          {/* Aca deberia ir a la pasarela de pago o con API que permita agregar tarjeta para pago */}
          <Button title="$1000" onPress={() => {}} /> 
          <Button title="$2000" onPress={() => {}} />
          <Button title="$5000" onPress={() => {}} />
          <Button title="Cerrar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  contenido: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  titulo: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});

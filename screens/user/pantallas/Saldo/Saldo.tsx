// import React, { useContext, useState } from "react";
// import { View, Text, StyleSheet, Modal, TextInput } from "react-native";
// import TarjetaGradiente from "../../componentes/TarjetaGradiente";
// import BotonPrimSec from "../../componentes/Boton";
// import colores from "../../constantes/colores";
// import { UsuarioContext } from "../../contexto/UsuarioContext";

// export default function Saldo() {
//   const { saldo, movimientos, setSaldo, agregarMovimiento, ultimoCosto } = useContext(UsuarioContext);
//   const [mostrarRecarga, setMostrarRecarga] = useState(false);
//   const [mostrarHistorial, setMostrarHistorial] = useState(false);
//   const [monto, setMonto] = useState("");
//   const [tarjeta, setTarjeta] = useState({ numero: "", vencimiento: "", cvv: "" });

//   const realizarRecarga = () => {
//     const montoNum = parseFloat(monto);
//     if (isNaN(montoNum) || montoNum <= 0) return alert("Monto inválido");

//     // Simulación de pago
//     setSaldo((prev) => prev + montoNum);
//     agregarMovimiento({ tipo: "Recarga", monto: montoNum });
//     setMostrarRecarga(false);
//     setMonto("");
//     setTarjeta({ numero: "", vencimiento: "", cvv: "" });
//   };

//   return (
//     <View style={styles.contenedor}>
//       <Text style={styles.titulo}>MI SALDO</Text>

//       <TarjetaGradiente colores={[colores.AZUL_SECUNDARIO, colores.VERDE_ACENTO]}>
//         <Text style={styles.texto}>Saldo actual: ${saldo.toFixed(2)}</Text>
//         <Text style={styles.texto}>Último estacionamiento: ${ultimoCosto.toFixed(2)}</Text>
//         <Text style={styles.texto}>Último movimiento: {movimientos.length > 0 ? `$${movimientos[movimientos.length - 1].monto}` : "N/A"}</Text>
//       </TarjetaGradiente>

//       <View style={styles.botones}>
//         <BotonPrimSec
//           titulo="RECARGAR"
//           tipo="relleno"
//           color={colores.AZUL_PRINCIPAL}
//           onPress={() => setMostrarRecarga(true)}
//         />
//         <BotonPrimSec
//           titulo="HISTORIAL"
//           tipo="borde"
//           color={colores.GRIS_OSCURO}
//           onPress={() => setMostrarHistorial(true)}
//         />
//       </View>

//       {/* Modal Recarga */}
//       <Modal visible={mostrarRecarga} transparent animationType="slide">
//         <View style={styles.overlay}>
//           <View style={styles.modal}>
//             <Text style={styles.modalTitulo}>Recargar saldo</Text>
//             <TextInput
//               placeholder="Monto"
//               keyboardType="numeric"
//               style={styles.input}
//               value={monto}
//               onChangeText={setMonto}
//             />
//             <TextInput
//               placeholder="Número de tarjeta"
//               style={styles.input}
//               value={tarjeta.numero}
//               onChangeText={(text) => setTarjeta({ ...tarjeta, numero: text })}
//             />
//             <TextInput
//               placeholder="Vencimiento (MM/AA)"
//               style={styles.input}
//               value={tarjeta.vencimiento}
//               onChangeText={(text) => setTarjeta({ ...tarjeta, vencimiento: text })}
//             />
//             <TextInput
//               placeholder="CVV"
//               style={styles.input}
//               secureTextEntry
//               value={tarjeta.cvv}
//               onChangeText={(text) => setTarjeta({ ...tarjeta, cvv: text })}
//             />
//             <BotonPrimSec titulo="Confirmar" tipo="relleno" color={colores.AZUL_PRINCIPAL} onPress={realizarRecarga} />
//             <BotonPrimSec titulo="Cancelar" tipo="borde" color={colores.GRIS_OSCURO} onPress={() => setMostrarRecarga(false)} />
//           </View>
//         </View>
//       </Modal>

//       {/* Modal Historial */}
//       <Modal visible={mostrarHistorial} transparent animationType="fade">
//         <View style={styles.overlay}>
//           <View style={styles.modal}>
//             <Text style={styles.modalTitulo}>Últimos movimientos</Text>
//             {movimientos.map((mov, i) => (
//               <Text key={i} style={styles.textoHistorial}>
//                 {mov.tipo}: {mov.monto > 0 ? "+" : "-"}${Math.abs(mov.monto)}
//               </Text>
//             ))}
//             <BotonPrimSec titulo="Cerrar" tipo="borde" color={colores.GRIS_OSCURO} onPress={() => setMostrarHistorial(false)} />
//           </View>
//         </View>
//       </Modal>
//     </View>
//     );
// }

//     const styles = StyleSheet.create({
//         contenedor: {
//           flex: 1,
//           padding: 20,
//           backgroundColor: "#fff",
//         },
//         titulo: {
//           fontSize: 18,
//           fontWeight: "bold",
//           color: colores.AZUL_PRINCIPAL,
//           marginBottom: 15,
//           textAlign: "center",
//         },
//         texto: {
//           fontSize: 16,
//           color: "#fff",
//           marginVertical: 5,
//           textAlign: "center",
//           fontWeight: "600",
//         },
//         botones: {
//           marginTop: 30,
//           flexDirection: "row",
//           justifyContent: "space-around",
//         },
//         overlay: {
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.7)",
//           justifyContent: "center",
//           alignItems: "center",
//         },
//         modal: {
//           backgroundColor: "#fff",
//           padding: 20,
//           borderRadius: 25,
//           width: "85%",
//           alignItems: "center",
//           elevation: 5,
//         },
//         modalTitulo: {
//           fontSize: 20,
//           fontWeight: "bold",
//           color: colores.AZUL_PRINCIPAL,
//           marginBottom: 15,
//           textAlign: "center",
//         },
//         input: {
//           width: "100%",
//           borderWidth: 1,
//           borderColor: colores.GRIS_OSCURO,
//           borderRadius: 10,
//           padding: 10,
//           fontSize: 16,
//           marginBottom: 10,
//         },
//         textoHistorial: {
//           fontSize: 15,
//           color: colores.GRIS_OSCURO,
//           marginVertical: 4,
//           textAlign: "center",
//         },
//       });


import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import colores from "../../constantes/colores";

export default function Saldo() {
  return (
    <View style={styles.contenedor}>
      <TarjetaGradiente colores={[colores.AZUL_PRINCIPAL, colores.VERDE_ACENTO]}>
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
    backgroundColor: "#fff",
  },
  texto: {
    fontSize: 18,
    fontWeight: "bold",
    color: colores.BLANCO,
    textAlign: "center",
    padding: 20,
  },
});

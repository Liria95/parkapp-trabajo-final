// import React, { useState } from "react";
// import { View, Text, StyleSheet, TextInput, Modal } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import { useNavigation } from "@react-navigation/native";
// import TarjetaGradiente from "../../componentes/TarjetaGradiente";
// import BotonPrimSec from "../../componentes/Boton";
// import InfoEstacionamiento from "../../componentes/InfoEstacionamiento";
// import colores from "../../constantes/colores";

// export default function RegistrarVehiculo() {
//   const [patente, setPatente] = useState("");
//   const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);

//   const [permission, requestPermission] = useCameraPermissions();
//   const navigation = useNavigation();

//   // Simulación de datos que luego vendrán de BBDD
//   const tarifaHora = 100; //Viene de API
//   const saldoDisponible = 1250; // Viene de Api buscando la patente que detecta la aplicacion y que debe guardar o actualizar en la base de datos
//   const ubicacion="AVENIDA SAN MARTIN 583, CIUDAD DE MENDOZA" //Info viene del gps

//   const validarPatente = (texto: string) => {
//     const regex = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
//     return regex.test(texto);
//   };

//   if (!permission) {
//     return <View />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.centered}>
//         <Text>Necesitamos acceso a la cámara</Text>
//         <BotonPrimSec
//           titulo="Permitir cámara"
//           tipo="relleno"
//           color={colores.AZUL_PRINCIPAL}
//           onPress={requestPermission}
//         />
//       </View>
//     );
//   }

//   const handleIniciar = () => {
//     if (!validarPatente(patente)) {
//       alert("Patente inválida");
//       return;
//     }

//     if (saldoDisponible < tarifaHora) {
//       setMostrarModalRecarga(true);
//       return;
//     }

//     const horasDisponibles = Math.floor(saldoDisponible / tarifaHora);

//     navigation.navigate("EstacionamientoActivo" as never, {
//       patente,
//       horasDisponibles,
//     } as never);
//   };

//   return (
//     <View style={styles.contenedor}>
//       {/* Título */}
//       <Text style={styles.titulo}>REGISTRAR VEHÍCULO</Text>

//       <View style={styles.contenedorCards}>
//         {/* Tarjeta simulando cámara */}
//         <View style= {styles.tarjetaCamara}
//         >
//           <CameraView style={styles.camera} facing="back" />
//           <Text style={styles.textoCamara}>
//             (Simulación de cámara - OCR pendiente)
//           </Text>
//         </View>

//         {/* Input de patente: la debe detectar automaticamente mediante la camara, pero permite digitalizarla manualmente si no funciona la camara */}
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Patente detectada:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Ej: ABC123"
//             value={patente}
//             onChangeText={setPatente}
//           />
//         </View>

//         {/* Info del estacionamiento: Aca tener en cuenta que la ubicacion la trae de los datos del GPS al estacionar, y el limite no se que sera mas conveniente  */} 
//         <InfoEstacionamiento
//           ubicacion={`${ubicacion}`}
//           tarifa={`$${tarifaHora} POR HORA`}
//           limite="2 HORAS"
//         />

//         {/* Botón iniciar */}
//         <BotonPrimSec
//           titulo="Iniciar estacionamiento"
//           tipo="relleno"
//           redondeado="alto"
//           color={colores.AZUL_PRINCIPAL}
//           onPress={handleIniciar}
//         />
//       </View>

//       {/* Modal de recarga por si no es suficiente el saldo*/}
//       <Modal visible={mostrarModalRecarga} transparent animationType="slide">
//         <View style={styles.overlay}>
//           <View style={styles.modal}>
//             <Text style={styles.modalTitulo}>No tienes saldo suficiente</Text>
//             <Text style={styles.modalTexto}>
//               Recarga para poder estacionar tu vehículo
//             </Text>
//             <BotonPrimSec
//               titulo="Ir a recargar"
//               tipo="relleno"
//               color={colores.AZUL_PRINCIPAL}
//               onPress={() => {
//                 setMostrarModalRecarga(false);
//                 navigation.navigate("MiSaldo" as never);
//               }}
//             />
//             <BotonPrimSec
//               titulo="Cancelar"
//               tipo="relleno"
//               color={colores.GRIS_OSCURO}
//               onPress={() => setMostrarModalRecarga(false)}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   contenedor: {
//     flex: 1,
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   titulo: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: colores.AZUL_PRINCIPAL,
//     marginBottom: 15,
//   },
//   contenedorCards: {
//     flex: 1,
//     width: "100%",
//     marginTop: 20,
//     justifyContent: "flex-start",
//   },
//   tarjetaCamara: {
//     height: "30%",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 15,
//     marginBottom: 25,
//   },
//   camera: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 15,
//   },
//   textoCamara: {
//     position: "absolute",
//     bottom: 10,
//     fontSize: 14,
//     color: "#fff",
//     fontWeight: "bold",
//     backgroundColor: "rgba(0,0,0,0.5)",
//     paddingHorizontal: 10,
//     borderRadius: 8,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: colores.GRIS_OSCURO,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colores.GRIS_OSCURO,
//     borderRadius: 10,
//     borderStyle: "dashed",
//     borderBottomWidth: 2,
//     borderTopWidth: 2,
//     borderLeftWidth: 2,
//     borderRightWidth: 2,
//     padding: 10,
//     fontSize: 16,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modal: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 25,
//     width: "80%",
//     alignItems: "center",
//   },
//   modalTitulo: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: colores.ROJO_PELIGRO,
//     marginBottom: 10,
//   },
//   modalTexto: {
//     fontSize: 14,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });


import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TextInput, Modal } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import InfoEstacionamiento from "../../componentes/InfoEstacionamiento";
import colores from "../../constantes/colores";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { RutasStackParamList } from "../../tipos/RutasStack";

export default function RegistrarVehiculo() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");

  const {
    saldo,
    patente,
    setPatente,
    iniciarEstacionamiento,
    configEstacionamiento,
  } = context;

  const { ubicacion, tarifaHora, limite } = configEstacionamiento;

  const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  const validarPatente = (texto: string) => {
    const regex = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
    return regex.test(texto);
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Necesitamos acceso a la cámara</Text>
        <BotonPrimSec
          titulo="Permitir cámara"
          tipo="relleno"
          color={colores.AZUL_PRINCIPAL}
          onPress={requestPermission}
        />
      </View>
    );
  }

  const handleIniciar = () => {
    if (!validarPatente(patente)) {
      alert("Patente inválida");
      return;
    }

    if (saldo < tarifaHora) {
      setMostrarModalRecarga(true);
      return;
    }

    iniciarEstacionamiento({
      patente,
      ubicacion,
      tarifaHora,
      limite,
    });

    navigation.navigate("EstacionamientoActivo");
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>REGISTRAR VEHÍCULO</Text>

      <View style={styles.contenedorCards}>
        <View style={styles.tarjetaCamara}>
          <CameraView style={styles.camera} facing="back" />
          <Text style={styles.textoCamara}>(Simulación de cámara - OCR pendiente)</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Patente detectada:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: ABC123"
            value={patente}
            onChangeText={setPatente}
          />
        </View>

        <InfoEstacionamiento
          ubicacion={ubicacion}
          tarifa={`$${tarifaHora} POR HORA`}
          limite={`${limite} HORAS`}
        />

        <BotonPrimSec
          titulo="Iniciar estacionamiento"
          tipo="relleno"
          redondeado="alto"
          color={colores.AZUL_PRINCIPAL}
          onPress={handleIniciar}
        />
      </View>

      <Modal visible={mostrarModalRecarga} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>No tienes saldo suficiente</Text>
            <Text style={styles.modalTexto}>Recarga para poder estacionar tu vehículo</Text>
            <BotonPrimSec
              titulo="Ir a recargar"
              tipo="relleno"
              color={colores.AZUL_PRINCIPAL}
              onPress={() => {
                setMostrarModalRecarga(false);
                navigation.navigate("MiSaldo" as never);
              }}
            />
            <BotonPrimSec
              titulo="Cancelar"
              tipo="relleno"
              color={colores.GRIS_OSCURO}
              onPress={() => setMostrarModalRecarga(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "900",
    color: colores.AZUL_PRINCIPAL,
    marginBottom: 15,
  },
  contenedorCards: {
    flex: 1,
    width: "100%",
    marginTop: 20,
    justifyContent: "flex-start",
  },
  tarjetaCamara: {
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 25,
  },
  camera: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  textoCamara: {
    position: "absolute",
    bottom: 10,
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: colores.GRIS_OSCURO,
  },
  input: {
    borderWidth: 1,
    borderColor: colores.GRIS_OSCURO,
    borderRadius: 10,
    borderStyle: "dashed",
    padding: 10,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: colores.ROJO_PELIGRO,
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

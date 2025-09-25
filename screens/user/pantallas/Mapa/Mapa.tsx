import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import colores from "../../constantes/colores";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { UsuarioContext } from "../../contexto/UsuarioContext";

export default function Mapa() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");

  const {
    saldo,
    estacionamiento,
    configEstacionamiento,
    actualizarSaldoEstacionamiento,
  } = context;

  let saldoRestante = saldo;

  if (estacionamiento?.activo) {
    const tiempoTranscurrido = Math.floor(
      (Date.now() - new Date(estacionamiento.inicio).getTime()) / 1000
    );
    const costoActual = (tiempoTranscurrido / 3600) * estacionamiento.tarifaHora;
    saldoRestante = Math.max(saldo - costoActual, 0);
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>MAPA DE ESTACIONAMIENTO</Text>

      <View style={styles.contenedorCards}>
        {/* Tarjeta de saldo */}
        <TarjetaGradiente colores={[colores.AZUL_SECUNDARIO, colores.VERDE_ACENTO]}>
          <View style={styles.cardSaldo}>
            <Text style={styles.textoSaldo}>
                SALDO DISPONIBLE:
            </Text>
            <Text style ={styles.saldoActual}>
                ${saldoRestante.toFixed(2)}
            </Text>

            {estacionamiento?.activo && (
              <TouchableOpacity
                style={styles.botonActualizar}
                onPress={actualizarSaldoEstacionamiento}
              >
                <Ionicons name="refresh-outline" size={20} color={colores.AZUL_PRINCIPAL} />
                <Text style={styles.textoActualizar}>Actualizar saldo</Text>
              </TouchableOpacity>
            )}
          </View>
        </TarjetaGradiente>

        {/* Tarjeta del mapa interactivo */}
        <LinearGradient
          colors={[colores.AZUL_SECUNDARIO, colores.VERDE_ACENTO]}
          style={styles.contCardMapa}
        >
          <Image
            source={require("../../../../assets/map.png")}
            style={styles.imagenMapa}
            resizeMode="cover"
          />
          <Text style={styles.textoTarjetaTitulo}>MAPA INTERACTIVO</Text>
          <Text style={styles.textoMapaSimulado}>
            Estacionamientos libres en la zona
          </Text>
        </LinearGradient>

        {/* Botón buscar zona */}
        <BotonPrimSec
          titulo="Buscar zona"
          tipo="borde"
          redondeado="bajo"
          color={colores.GRIS_OSCURO}
          onPress={() => console.log("Buscando zona... Actualizando el mapa")}
        />
      </View>
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
    fontWeight: "600",
    color: colores.AZUL_PRINCIPAL,
    marginBottom: 15,
  },
  contenedorCards: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: 20,
    justifyContent: "space-between",
  },
  contCardMapa: {
    height: "50%",
    alignItems: "center",
    borderRadius: 15,
  },
  imagenMapa: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  textoTarjetaTitulo: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "bold",
    paddingTop: 15,
  },
  textoMapaSimulado: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    padding: 15,
  },
  cardSaldo: {
    padding: 15,
    margin: 10,
    alignItems: "center",
  },
  textoSaldo: {
    fontSize: 16,
    fontWeight: 800,
    color: colores.BLANCO,
  },
  saldoActual: {
    marginTop: 10,
    fontWeight: 900,
    fontSize: 30,
    color: colores.BLANCO,
  },
  botonActualizar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textoActualizar: {
    marginLeft: 5,
    color: colores.AZUL_PRINCIPAL,
    fontWeight: "bold",
  },
});

import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import { theme } from "../../../../config/theme";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { AuthContext } from "../../../../components/shared/Context/AuthContext";
import { NotificationService } from "../../../../services/NotificationService";
import Ionicons from "@expo/vector-icons/Ionicons";

type RutasStackParamList = {
  Tabs: undefined;
};

export default function Saldo() {
  const usuarioContext = useContext(UsuarioContext);
  const authContext = useContext(AuthContext);
  
  if (!usuarioContext) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");
  if (!authContext) throw new Error("AuthContext debe estar dentro del AuthProvider");

  const { saldo, setSaldo, movimientos, agregarMovimiento } = usuarioContext;
  const { state } = authContext;
  const userId = state.user?.id;

  const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);
  const [montoRecarga, setMontoRecarga] = useState("");

  const navigation = useNavigation<NativeStackNavigationProp<RutasStackParamList>>();

  // Obtener último movimiento
  const ultimoMovimiento = movimientos.length > 0 
    ? movimientos[movimientos.length - 1] 
    : null;

  // Montos predefinidos para recarga rápida
  const montosRapidos = [100, 500, 1000, 2000];

  const handleRecarga = async (monto: number) => {
    const nuevoSaldo = saldo + monto;
    
    // Actualizar saldo
    setSaldo(nuevoSaldo);
    
    // Agregar movimiento
    agregarMovimiento({ tipo: "Recarga", monto });

    // Enviar notificación
    if (userId) {
      await NotificationService.notifyBalanceRecharged(
        userId,
        monto,
        nuevoSaldo
      );
    }

    setMostrarModalRecarga(false);
    setMontoRecarga("");
  };

  const formatearFecha = (index: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (movimientos.length - index) * 30);
    return now.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>MI SALDO</Text>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de saldo actual con gradiente */}
        <TarjetaGradiente 
          style={styles.tarjetaSaldo}
          colores={[theme.colors.secondary, theme.colors.success]}
        >
          <Text style={styles.tituloSaldo}>SALDO ACTUAL</Text>
          <Text style={styles.montoSaldo}>${saldo.toFixed(2)}</Text>
          
          {ultimoMovimiento && (
            <Text style={styles.ultimoMovimiento}>
              ÚLTIMO MOVIMIENTO: {ultimoMovimiento.monto > 0 ? '+' : ''}${ultimoMovimiento.monto.toFixed(2)}
            </Text>
          )}
        </TarjetaGradiente>

        {/* Botones de acción */}
        <View style={styles.botones}>
          <BotonPrimSec
            titulo="RECARGAR"
            tipo="relleno"
            color={theme.colors.primary}
            estilo={{
              paddingHorizontal: 30,
              minWidth: 120,
              marginTop: 20,
            }}
            onPress={() => setMostrarModalRecarga(true)}
          />
          <BotonPrimSec
            titulo="HISTORIAL"
            tipo="relleno"
            color={theme.colors.primary}
            estilo={{
              paddingHorizontal: 30,
              minWidth: 120,
              marginTop: 20,
            }}
            onPress={() => {/* Navegar a historial */}}
          />
        </View>

        {/* Opciones */}
        <View style={styles.seccionOpciones}>
          <TouchableOpacity style={styles.opcion}>
            <Ionicons name="card-outline" size={24} color={theme.colors.dark} />
            <Text style={styles.textoOpcion}>Métodos de pago</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.opcion}>
            <Ionicons name="refresh-outline" size={24} color={theme.colors.dark} />
            <Text style={styles.textoOpcion}>Recarga automática: OFF</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Últimos movimientos */}
        <View style={styles.seccionMovimientos}>
          <Text style={styles.subtitulo}>Últimos movimientos</Text>
          
          {movimientos.length === 0 ? (
            <View style={styles.sinMovimientos}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.gray} />
              <Text style={styles.textoSinMovimientos}>No hay movimientos aún</Text>
            </View>
          ) : (
            movimientos.slice().reverse().slice(0, 10).map((mov, index) => (
              <View key={index} style={styles.itemMovimiento}>
                <View style={styles.iconoMovimiento}>
                  <Ionicons 
                    name={mov.tipo === "Recarga" ? "add-circle" : "remove-circle"} 
                    size={32} 
                    color={mov.tipo === "Recarga" ? theme.colors.success : theme.colors.danger} 
                  />
                </View>
                <View style={styles.infoMovimiento}>
                  <Text style={styles.tipoMovimiento}>{mov.tipo}</Text>
                  <Text style={styles.fechaMovimiento}>
                    {formatearFecha(movimientos.length - index - 1)}
                  </Text>
                </View>
                <Text style={[
                  styles.montoMovimiento,
                  { color: mov.monto > 0 ? theme.colors.success : theme.colors.danger }
                ]}>
                  {mov.monto > 0 ? '+' : ''}${Math.abs(mov.monto).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de Recarga */}
      <Modal
        visible={mostrarModalRecarga}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalRecarga(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Recargar Saldo</Text>
            
            <Text style={styles.modalSubtitulo}>Selecciona un monto:</Text>
            
            <View style={styles.gridMontos}>
              {montosRapidos.map((monto) => (
                <TouchableOpacity
                  key={monto}
                  style={styles.botonMonto}
                  onPress={() => handleRecarga(monto)}
                >
                  <Text style={styles.textoMonto}>${monto}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSubtitulo}>O ingresa un monto:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.signo}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={montoRecarga}
                onChangeText={setMontoRecarga}
                keyboardType="numeric"
              />
            </View>

            <BotonPrimSec
              titulo="Confirmar Recarga"
              tipo="relleno"
              color={theme.colors.success}
              onPress={() => {
                const monto = parseFloat(montoRecarga);
                if (!isNaN(monto) && monto > 0) {
                  handleRecarga(monto);
                }
              }}
            />

            <BotonPrimSec
              titulo="Cancelar"
              tipo="relleno"
              color={theme.colors.gray}
              estilo={{ marginTop: 10 }}
              onPress={() => {
                setMostrarModalRecarga(false);
                setMontoRecarga("");
              }}
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
    backgroundColor: theme.colors.white,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  //TARJETA CON GRADIENTE
  tarjetaSaldo: {
    padding: 30,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  tituloSaldo: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 10,
  },
  montoSaldo: {
    fontSize: 48,
    fontWeight: "900",
    color: theme.colors.white,
    marginBottom: 10,
  },
  ultimoMovimiento: {
    fontSize: 12,
    color: theme.colors.white,
    opacity: 0.8,
  },
  //BOTONES
  botones: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  seccionOpciones: {
    marginBottom: 30,
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 12,
    marginBottom: 10,
  },
  textoOpcion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.dark,
    marginLeft: 15,
  },
  seccionMovimientos: {
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: 15,
  },
  sinMovimientos: {
    alignItems: "center",
    padding: 40,
  },
  textoSinMovimientos: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 10,
  },
  itemMovimiento: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconoMovimiento: {
    marginRight: 15,
  },
  infoMovimiento: {
    flex: 1,
  },
  tipoMovimiento: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.dark,
    marginBottom: 2,
  },
  fechaMovimiento: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  montoMovimiento: {
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: theme.colors.white,
    padding: 25,
    borderRadius: 25,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalSubtitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.dark,
    marginTop: 15,
    marginBottom: 10,
  },
  gridMontos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  botonMonto: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.primary,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  textoMonto: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.gray,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  signo: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 18,
    padding: 15,
    color: theme.colors.dark,
  },
});
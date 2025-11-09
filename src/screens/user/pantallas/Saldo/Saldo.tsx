import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import { theme } from "../../../../config/theme";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { AuthContext } from "../../../../components/shared/Context/AuthContext/AuthContext";
import { NotificationService } from "../../../../services/NotificationService";
import { PaymentService } from "../../../../services/PaymentService";
import { BalanceService } from "../../../../services/BalanceService";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Saldo() {
  const usuarioContext = useContext(UsuarioContext);
  const authContext = useContext(AuthContext);
  
  if (!usuarioContext) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");
  if (!authContext) throw new Error("AuthContext debe estar dentro del AuthProvider");

  const { saldo, setSaldo, movimientos, agregarMovimiento } = usuarioContext;
  const { state } = authContext;

  const [mostrarModalRecarga, setMostrarModalRecarga] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [cargandoSaldo, setCargandoSaldo] = useState(true);

  const ultimoMovimiento = movimientos.length > 0 
    ? movimientos[movimientos.length - 1] 
    : null;

  const montosRapidos = [100, 500, 1000, 2000];

  // Cargar saldo desde Firebase al montar el componente
  useEffect(() => {
    cargarSaldoDesdeServidor();
  }, []);

  const cargarSaldoDesdeServidor = async () => {
    const token = state.token;
    
    if (!token) {
      console.log('No hay token disponible');
      setCargandoSaldo(false);
      return;
    }

    try {
      console.log('Cargando saldo desde Firebase...');
      const result = await BalanceService.getBalance(token);
      
      if (result.success && result.balance !== undefined) {
        console.log('Saldo cargado desde Firebase:', result.balance);
        setSaldo(result.balance);
      } else {
        console.error('Error al cargar saldo:', result.message);
      }
    } catch (error) {
      console.error('Error al cargar saldo:', error);
    } finally {
      setCargandoSaldo(false);
    }
  };

  const handleRecarga = async (monto: number) => {
    const userId = state.user?.id;
    const userName = state.user?.name;
    const token = state.token;
    
    console.log('Verificando autenticación:');
    console.log('  - userId:', userId);
    console.log('  - userName:', userName);
    console.log('  - token:', token ? 'Presente' : 'FALTANTE');
    
    if (!userId || !userName || !token) {
      Alert.alert('Error', 'Sesión no válida. Inicia sesión nuevamente.');
      return;
    }

    try {
      setProcesandoPago(true);
      console.log('Procesando pago simulado...');

      const result = await PaymentService.simulatePayment(
        monto,
        userId,
        userName,
        token
      );

      if (result.success) {
        // Recargar saldo desde el servidor para asegurar sincronización
        await cargarSaldoDesdeServidor();
        
        agregarMovimiento({ tipo: "Recarga", monto });

        await NotificationService.notifyBalanceRecharged(userId, monto, saldo + monto);

        setMostrarModalRecarga(false);

        Alert.alert(
          'Recarga exitosa',
          `Se agregaron $${monto} a tu cuenta.\n\nNuevo saldo: $${(saldo + monto).toFixed(2)}`
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo procesar');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Ocurrió un error');
    } finally {
      setProcesandoPago(false);
    }
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
        {/* Tarjeta de saldo actual */}
        <TarjetaGradiente 
          style={styles.tarjetaSaldo}
          colores={[theme.colors.secondary, theme.colors.success]}
        >
          <Text style={styles.tituloSaldo}>SALDO ACTUAL</Text>
          {cargandoSaldo ? (
            <Text style={styles.montoSaldo}>Cargando...</Text>
          ) : (
            <Text style={styles.montoSaldo}>${saldo.toFixed(2)}</Text>
          )}
          
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
                  style={[
                    styles.botonMonto,
                    procesandoPago && styles.botonMontoDisabled
                  ]}
                  onPress={() => handleRecarga(monto)}
                  disabled={procesandoPago}
                >
                  <Text style={styles.textoMonto}>${monto}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoPago}>
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
              <Text style={styles.textoInfoPago}>
                Pago procesado de forma segura
              </Text>
            </View>

            {procesandoPago && (
              <View style={styles.containerProcesando}>
                <Text style={styles.textoProcesando}>
                  Procesando pago...
                </Text>
              </View>
            )}

            <BotonPrimSec
              titulo="Cancelar"
              tipo="relleno"
              color={theme.colors.gray}
              estilo={{ marginTop: 15 }}
              onPress={() => {
                if (!procesandoPago) {
                  setMostrarModalRecarga(false);
                }
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
    marginBottom: 15,
  },
  botonMonto: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.primary,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  botonMontoDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  textoMonto: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  infoPago: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
  },
  textoInfoPago: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.success,
    marginLeft: 8,
  },
  containerProcesando: {
    backgroundColor: theme.colors.lightGray,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  textoProcesando: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
  },
});
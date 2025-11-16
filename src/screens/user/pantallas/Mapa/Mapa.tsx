import { useContext, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import TarjetaGradiente from "../../componentes/TarjetaGradiente";
import BotonPrimSec from "../../componentes/Boton";
import { theme } from "../../../../config/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Mapa() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("UsuarioContext debe estar dentro del UsuarioProvider");

  const {
    saldo,
    estacionamiento,
    configEstacionamiento,
    actualizarSaldoEstacionamiento,
    setParkingLocationAddress, 
  } = context;

  //rferencia para controlar el MapView (para animación)
  const mapRef = useRef(null);

  //definición de tipos
  type locationType = {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number,
};

  const [region, setRegion] = useState({
    //región por defecto CABA
    latitude: -34.6067,
    longitude: -58.33816,
    latitudeDelta: 0.05, // zoom inicial 
    longitudeDelta: 0.05,
  });

  const [userLocation, setUserLocation] = useState<locationType>();
  const [currentAddress, setCurrentAddress] = useState("Obteniendo dirección...");


  //Traduce coordenadas a dirección 
  const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const addressArray = await Location.reverseGeocodeAsync({ latitude, longitude });
    
      if (addressArray.length > 0) {
        const addr = addressArray[0];
        //dirección legible con calle, número (si existe) y ciudad/país
        const formattedAddress = `${addr.street} ${addr.streetNumber || ''}, ${addr.city}, ${addr.country}`;
        setCurrentAddress(formattedAddress);

        if (setParkingLocationAddress) {
            setParkingLocationAddress(formattedAddress);
        }
        
      } else {
        setCurrentAddress("Dirección no encontrada.");
      }
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      setCurrentAddress("Error de servicio de Geocodificación.");
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      let {status} = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.error('El permiso para acceder a la ubicación fue denegada.')
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005, // mayor zoom para centrar al usuario
          longitudeDelta: 0.005,
        };

        setUserLocation(newRegion);
        setRegion(newRegion); //centrar el mapa en la nueva ubicación

        fetchAddressFromCoords(location.coords.latitude, location.coords.longitude);

      } catch (error) {
        console.error("Error al obtener la ubicación:", error);
      }
    };

    fetchLocation();
  }, []);

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
        <TarjetaGradiente colores={[theme.colors.secondary, theme.colors.success]}>
          <View style={styles.cardSaldo}>
            <Text style={styles.textoSaldo}>
              SALDO DISPONIBLE:
            </Text>
            <Text style={styles.saldoActual}>
              ${saldoRestante.toFixed(2)}
            </Text>

            {estacionamiento?.activo && (
              <TouchableOpacity
                style={styles.botonActualizar}
                onPress={actualizarSaldoEstacionamiento}
              >
                <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.textoActualizar}>Actualizar saldo</Text>
              </TouchableOpacity>
            )}
          </View>
        </TarjetaGradiente>

        {/* Tarjeta del mapa interactivo */}
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.success]}
          style={styles.contCardMapa}
        >
          <MapView 
            style={styles.mapa} 
            region={region}
            onRegionChangeComplete={setRegion} //actualiza region al arrastrar el mapa
            showsUserLocation={true} // muestra el punto azul de ubicación
            showsMyLocationButton={true} // Muestra el botón de centrar en la ubicación
            toolbarEnabled={false}
            >
              
              {userLocation && (
                <Marker coordinate = {{
                  latitude:region.latitude,
                  longitude: region.longitude
                }}
                title="Estás Aquí"
                description="Tu ubicación actual"
                pinColor={theme.colors.primary}

                />
              )}  

              { /*{
                <Marker coordinate=
                  {{
                    latitude:-31.8500,
                    longitude:-59.0167 
                  }}
                  title="Villaguay"
                  description="Tu ubicación actual"
                  pinColor={theme.colors.primary}
                />
              }  */}

          </MapView>

          <Text style={styles.textoTarjetaTitulo}>Ubicación</Text>
          <Text style={styles.textoMapaSimulado}>
            {currentAddress}
          </Text>
        </LinearGradient>

        {/* Botón buscar zona */}
        <BotonPrimSec
          titulo="Buscar zona"
          tipo="borde"
          redondeado="bajo"
          color={theme.colors.dark}
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
    backgroundColor: theme.colors.white,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
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
    overflow:'hidden',
  },
  mapa: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  textoTarjetaTitulo: {
    fontSize: 17,
    color: theme.colors.white,
    fontWeight: "bold",
    paddingTop: 15,
  },
  textoMapaSimulado: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.white,
    padding: 15,
  },
  cardSaldo: {
    padding: 15,
    margin: 10,
    alignItems: "center",
  },
  textoSaldo: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.white,
  },
  saldoActual: {
    marginTop: 10,
    fontWeight: "900",
    fontSize: 30,
    color: theme.colors.white,
  },
  botonActualizar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textoActualizar: {
    marginLeft: 5,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});
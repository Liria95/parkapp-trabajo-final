import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { AuthContext } from "../../../../components/shared/Context/AuthContext/AuthContext";
import { getVehicles } from "../../../../services/vehiclesService";
import { theme } from "../../../../config/theme";

export default function MisVehiculos() {
  const { state } = useContext(AuthContext);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      if (!state.token) return;
      
      const data = await getVehicles(state.token);

      if (data.success) {
        setVehiculos(data.vehicles);
      } else {
        console.log("No se pudieron cargar vehículos");
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Vehículos</Text>

      {vehiculos.length === 0 ? (
        <Text style={styles.empty}>No tienes vehículos cargados.</Text>
      ) : (
        vehiculos.map((v) => (
          <View key={v.id} style={styles.card}>
            <Text style={styles.plate}>{v.licensePlate}</Text>
            <Text style={styles.text}>Marca: {v.brand || "N/A"}</Text>
            <Text style={styles.text}>Modelo: {v.model || "N/A"}</Text>
            <Text style={styles.text}>
              Fecha: {v.createdAt?.toDate?.().toLocaleString?.() || "—"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  plate: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 18,
    color: "#666",
  },
});

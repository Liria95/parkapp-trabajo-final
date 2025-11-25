import React, { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { theme } from "../../../../config/theme";
import { AuthContext } from "../../../../components/shared/Context/AuthContext/AuthContext";
import { NotificationService } from "../../../../services/NotificationService";

export default function NotificationsScreen() {
  const { state } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    const obtener = async () => {
      if (state.user?.id) {
        const notis = await NotificationService.getUserNotifications(state.user.id);
        setNotifications(notis);
      }
    };
    obtener();
  }, [state.user?.id]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No tienes notificaciones pendientes</Text>
      ) : (
        notifications.map(n => (
          <View key={n.id} style={styles.card}>
            <Text style={styles.cardTitle}>{n.title}</Text>
            <Text style={styles.cardMsg}>{n.message}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white, padding: 16, marginTop:20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: theme.colors.primary },
  empty: { textAlign: "center", marginTop: 40, color: theme.colors.gray },
  card: { backgroundColor: "#FAF3E3", padding: 15, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
  cardMsg: { color: theme.colors.dark, fontSize: 13 }
});

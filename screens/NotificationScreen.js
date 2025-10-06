// screens/NotificationsScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const sampleNotifications = [
  { id: "1", title: "Appointment Confirmed", message: "Ang iyong schedule para sa May 20 ay kumpirmado.", date: "May 18, 2024", read: false },
  { id: "2", title: "System Update", message: "A new app update is available.", date: "May 17, 2024", read: true },
  { id: "3", title: "New Message", message: "May bago kang mensahe mula kay Juan.", date: "May 16, 2024", read: false },
  { id: "4", title: "Promotions", message: "50% off sa lahat ng coffee drinks ngayong linggo!", date: "May 15, 2024", read: true },
  { id: "5", title: "Payment Received", message: "Natanggap na namin ang iyong bayad para sa order #12345.", date: "May 14, 2024", read: false },
];

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationPress = (id) => {
    // Example: Mark as read when tapped
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // You can also navigate to a detail screen here
  };

  return (
    <View style={styles.container}>
      {/* Header na may back button, title, at mark all button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.header}>Mga Notipikasyon</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
          <Ionicons name="checkmark-done-circle" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Wala pang notipikasyon.</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.item, !n.read && styles.unread]}
              onPress={() => handleNotificationPress(n.id)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={!n.read ? "#3B82F6" : "#9CA3AF"}
                />
              </View>
              <View style={styles.texts}>
                <Text style={[styles.title, n.read && styles.readText]}>{n.title}</Text>
                <Text style={[styles.msg, n.read && styles.readText]}>{n.message}</Text>
                <Text style={[styles.date, n.read && styles.readText]}>{n.date}</Text>
              </View>
              {!n.read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  markAllButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unread: {
    backgroundColor: "#EBF5FF",
    borderColor: "#3B82F6",
  },
  iconContainer: {
    marginRight: 15,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  msg: {
    fontSize: 14,
    marginTop: 4,
    color: "#4B5563",
  },
  date: {
    fontSize: 12,
    marginTop: 6,
    color: "#9CA3AF",
  },
  readText: {
    color: "#9CA3AF",
    fontWeight: "normal",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 10,
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { height } = Dimensions.get("window");

const COLORS = {
  primary: "#007AFF",
  secondary: "#1F7A8C",
  background: "#F0F2F5",
  cardBackground: "#FFFFFF",
  textDark: "#1E293B",
  textGray: "#64748B",
  success: "#22C55E",
};

const settingOptions = {
  account: [
    { name: "Full Name", key: "fullName", icon: "person-circle-outline" },
    { name: "Email", key: "email", icon: "mail-outline" },
    { name: "Address", key: "address", icon: "home-outline" },
    { name: "Contact", key: "contact", icon: "call-outline" },
    { name: "Role", key: "role", icon: "people-outline" },
  ],
  security: [{ name: "Change Password", icon: "lock-closed-outline" }],
};

const InfoRow = ({ label, value, icon, isClickable = false, onPress }) => (
  <TouchableOpacity
    style={styles.optionRow}
    onPress={onPress}
    disabled={!isClickable}
  >
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionValue}>{value}</Text>
    </View>
    {isClickable && (
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={COLORS.textGray}
      />
    )}
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          console.error("❌ No user found in storage");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userEmail = parsedUser.email;

        const API_URL = `http://192.168.100.199:5000/api/profile/${userEmail}`;
        const res = await axios.get(API_URL);

        setUser(res.data);
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response ? err.response.data : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("user");
              console.log("Logged out!");
              navigation.replace("Login");
            } catch (err) {
              console.error("Error logging out:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textGray }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>Failed to load user profile.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#007AFF", "#00C6FF"]}
          style={styles.headerBackground}
          start={{ x: 0.1, y: 0.2 }}
          end={{ x: 0.9, y: 0.8 }}
        >
          <View style={styles.headerContent}>
           <Image
  source={
    user.profileImage
      ? { uri: user.profileImage }
      : require("../assets/userprofile.png") // 👈 gamit require
  }
  style={styles.profileImage}
/>

            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons
                name="create-outline"
                size={16}
                color={COLORS.textDark}
              />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Account Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {settingOptions.account.map((option, index) => (
            <InfoRow
              key={index}
              label={option.name}
              value={user[option.key] || "N/A"}
              icon={option.icon}
            />
          ))}
        </View>

        {/* Security */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Security & Settings</Text>
          {settingOptions.security.map((option, index) => (
            <InfoRow
              key={index}
              label={option.name}
              value={"Manage"}
              icon={option.icon}
              isClickable={true}
              onPress={() => setModalVisible(true)}
            />
          ))}
          <InfoRow
            label={"Log Out"}
            value={"Exit"}
            icon={"log-out-outline"}
            isClickable={true}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.navItem}
        >
          <Ionicons name="home-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Navigate", "Request Schedule screen is not yet implemented.")
          }
          style={styles.navItem}
        >
          <Ionicons name="calendar-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Request Sched</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.navItem}
        >
          <Ionicons name="person" size={24} color="#22C55E" />
          <Text style={styles.navTextActive}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalText}>
              This feature is coming soon! Thank you for your patience.
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBackground: {
    width: "100%",
    height: height * 0.3,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    marginBottom: 20,
  },
  headerContent: { alignItems: "center", paddingTop: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.cardBackground,
    marginBottom: 8,
  },
  userName: { fontSize: 24, fontWeight: "800", color: COLORS.cardBackground },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    elevation: 2,
  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    justifyContent: "space-between",
  },
  iconContainer: { width: 30, alignItems: "center" },
  textContainer: { flex: 1, marginLeft: 15 },
  optionLabel: { fontSize: 13, color: COLORS.textGray, fontWeight: "500" },
  optionValue: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "600",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "100%",
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalText: { fontSize: 15, textAlign: "center", marginBottom: 20 },
  closeButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: COLORS.cardBackground,
    fontSize: 16,
    fontWeight: "600",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navItem: { alignItems: "center", width: "30%" },
  navText: { fontSize: 10, marginTop: 4, color: "#6B7280", fontWeight: "600" },
  navTextActive: {
    fontSize: 10,
    marginTop: 4,
    color: "#22C55E",
    fontWeight: "800",
  },
});

export default ProfileScreen;

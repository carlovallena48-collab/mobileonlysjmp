import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Get screen height for modal animation
const { height } = Dimensions.get("window");

const settingOptions = {
  account: [
    { name: "Personal Information", icon: "person-circle-outline", key: "accountInfo" },
    { name: "Change Password", icon: "lock-closed-outline", key: "changePassword" },
    { name: "Notification Settings", icon: "notifications-outline", key: "notifications" },
  ],
  general: [
    { name: "Language", icon: "globe-outline", key: "language" },
    { name: "Theme", icon: "color-palette-outline", key: "theme" },
  ],
  appInfo: [
    { name: "About App", icon: "information-circle-outline", key: "about" },
    { name: "Help & Support", icon: "help-circle-outline", key: "help" },
  ],
};

const SettingsSection = ({ title, options, onSelect }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>
      {options.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.item, index < options.length - 1 && styles.itemBorder]}
          onPress={() => onSelect(item)}
        >
          <Ionicons name={item.icon} size={22} color="#4B5563" />
          <Text style={styles.itemText}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function SettingsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const messageAnim = useState(new Animated.Value(height))[0];

  // States for sample forms
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    Animated.timing(messageAnim, {
      toValue: height - 100, // Position above the bottom edge
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        hideMessage();
      }, 3000); // Hide after 3 seconds
    });
  };

  const hideMessage = () => {
    Animated.timing(messageAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMessage(''));
  };

  const handleSelect = (item) => {
    setSelectedSetting(item);
    setModalVisible(true);
    setMessage('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSetting(null);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = () => {
    if (selectedSetting.key === 'changePassword') {
      if (!oldPassword || !newPassword || !confirmPassword) {
        showMessage('All password fields are required.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match.', 'error');
        return;
      }
      showMessage('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showMessage(`${selectedSetting.name} updated successfully!`, 'success');
    }

    setTimeout(() => {
      closeModal();
    }, 1500);
  };

  const renderModalContent = () => {
    switch (selectedSetting?.key) {
      case "accountInfo":
        return (
          <>
            <Text style={styles.modalTitle}>Personal Information</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </>
        );

      case "changePassword":
        return (
          <>
            <Text style={styles.modalTitle}>Change Password</Text>
            {messageType === 'error' && (
              <Text style={styles.errorMessage}>{message}</Text>
            )}
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Old Password"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
            />
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Update Password</Text>
            </Pressable>
          </>
        );

      default:
        return (
          <>
            <Text style={styles.modalTitle}>{selectedSetting?.name}</Text>
            <Text style={styles.modalBody}>
              📌 This is a placeholder for {selectedSetting?.name}.
            </Text>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.header}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      {/* List of Settings */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsSection title="Account" options={settingOptions.account} onSelect={handleSelect} />
        <SettingsSection title="General" options={settingOptions.general} onSelect={handleSelect} />
        <SettingsSection title="About" options={settingOptions.appInfo} onSelect={handleSelect} />
      </ScrollView>

      {/* Popup Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            {renderModalContent()}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Message Popup */}
      {message ? (
        <Animated.View style={[
          styles.messageContainer,
          messageType === 'success' ? styles.successMessageBg : styles.errorMessageBg,
          { transform: [{ translateY: messageAnim }] }
        ]}>
          <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
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
  backButton: { padding: 5, width: 30 }, // Fixed width for alignment
  header: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
  scrollContent: { paddingVertical: 20, paddingHorizontal: 15 },
  sectionContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#4B5563", marginBottom: 10 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: "500", color: "#374151" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#1F2937", textAlign: 'center' },
  modalBody: { fontSize: 16, color: "#4B5563", textAlign: "center", marginBottom: 20 },
  input: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeButton: {
    backgroundColor: "#D1D5DB",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: { color: "#4B5563", fontWeight: "bold", fontSize: 14 },
  
  // Message styles
  messageContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  successMessageBg: {
    backgroundColor: "#10B981", // Emerald 500
  },
  errorMessageBg: {
    backgroundColor: "#EF4444", // Red 500
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorMessage: {
    color: "#EF4444", // Red 500
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  }
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView, // Import Safe Area View
} from "react-native";
// Import ang Feather Icons at Ionicons
import { Feather, Ionicons } from "@expo/vector-icons"; 

// Tiyakin na ang component ay tumatanggap ng 'navigation' prop
const RequestCertificateScreen = ({ navigation }) => { 
  // --- PALITAN ANG KULAY SA GREEN THEME ---
  const PRIMARY_COLOR = "#047857"; // Emerald Green (Pro, Calm)
  const SECONDARY_COLOR = "#34d399"; // Light Green (Accent)
  const BACKGROUND_COLOR = "#f0fdfa"; // Very light mint background

  const [certificateType, setCertificateType] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfSacrament, setDateOfSacrament] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleSubmit = () => {
    if (!certificateType || !fullName || !dateOfSacrament || !purpose) {
      Alert.alert("Kinakailangan", "Punan lahat ng impormasyong hinihingi.", [{ text: "OK" }]);
      return;
    }

    Alert.alert(
      "Ang Iyong Kahilingan ay Naisumite",
      `Uri: ${certificateType}\nPangalan: ${fullName}\nPetsa: ${dateOfSacramento}\nLayunin: ${purpose}`,
      [{ text: "Tapos na", style: "default" }]
    );

    // clear fields after submit
    setCertificateType("");
    setFullName("");
    setDateOfSacrament("");
    setPurpose("");
  };

  // Modern Card Input Component (Pareho pa rin)
  const CardInput = ({ iconName, label, placeholder, value, onChangeText, keyboardType = "default" }) => (
    <View style={styles.inputCard}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Feather name={iconName} size={18} color={PRIMARY_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor="#9ca3af" 
        />
      </View>
    </View>
  );

  // FUNCTION para bumalik sa nakaraang screen
  const handleGoBack = () => {
    navigation.goBack(); 
  };


  return (
    // Gumamit ng SafeAreaView para iwasan ang notch/status bar
    <SafeAreaView style={{ flex: 1, backgroundColor: PRIMARY_COLOR }}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* PROFESSIONAL HEADER with Back Arrow */}
      <View style={[styles.headerContainer, { backgroundColor: PRIMARY_COLOR }]}>
        
        {/* HEADER BAR (Row) */}
        <View style={styles.headerBar}>
            {/* BACK BUTTON - Left-aligned */}
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Ionicons name="arrow-back-sharp" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.pageTitle}>Request Certificate</Text>

            {/* Empty space para ma-align sa kanan ang button */}
            <View style={{ width: 26 }} /> 
        </View>

        {/* HEADER MAIN CONTENT (Below the bar) */}
        <View style={styles.headerTitleGroup}>
            <Ionicons name="documents-outline" size={40} color="#fff" style={{ marginBottom: 5 }} />
            <Text style={styles.headerSubtitle}>Isumite ang iyong kahilingan nang madali.</Text>
        </View>

      </View>

      {/* FORM AREA (White Background) */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: BACKGROUND_COLOR }]}>
        
        {/* Main Form Content - Gamit ang CardInput */}
        <CardInput
          iconName="file-text"
          label="Uri ng Sertipiko"
          placeholder="e.g., Binyag, Kumpil, Kasal"
          value={certificateType}
          onChangeText={setCertificateType}
        />

        <CardInput
          iconName="user"
          label="Buong Pangalan ng Humihiling"
          placeholder="Ilagay ang Buong Pangalan"
          value={fullName}
          onChangeText={setFullName}
        />

        <CardInput
          iconName="calendar"
          label="Petsa ng Sakramento (Kung Naaalala)"
          placeholder="Hal. 2000-01-15"
          value={dateOfSacrament}
          onChangeText={setDateOfSacrament}
          keyboardType="default"
        />

        <CardInput
          iconName="mail"
          label="Layunin ng Kahilingan"
          placeholder="Para saan gagamitin ang sertipiko?"
          value={purpose}
          onChangeText={setPurpose}
        />

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: PRIMARY_COLOR }]} 
          onPress={handleSubmit}
        >
          <Feather name="send" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.submitText}>Isumite ang Kahilingan</Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
            Ang pagproseso ay inaasahang matatapos sa loob ng 3-5 araw ng trabaho. Makakatanggap ka ng notipikasyon.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestCertificateScreen;

const styles = StyleSheet.create({
  // --- Styling Constants (Para mas madali i-edit) ---
  PRIMARY_COLOR: "#047857", // Emerald Green
  SECONDARY_COLOR: "#34d399", 
  BACKGROUND_COLOR: "#f0fdfa", 
  CARD_BACKGROUND: "#ffffff",

  // --- Header Styling ---
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25, 
    backgroundColor: "#047857", 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  
  // NEW STYLES for Header Bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 5,
  },

  pageTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
  },
  
  // Tinanggal ang absolute position sa backButton, ginamit ang Flex
  backButton: {
      padding: 5,
  },
  
  headerTitleGroup: {
      alignItems: 'center', 
  },
  
  // Tinanggal ang Header Title, inilipat sa pageTitle
  headerSubtitle: {
    fontSize: 14,
    color: "#d1fae5", // Lighter green text
    fontWeight: '500',
    marginTop: 5,
  },
  
  // --- Scroll/Body Styling ---
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    marginTop: -20, // Itinaas ang scroll content para "mag-overlap" sa rounded header
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#f0fdfa", 
  },
  
  // --- Card Input Styling ---
  inputCard: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 15, 
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
    color: "#1f2937", 
    textTransform: 'uppercase', 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb',
    paddingVertical: 5,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1f2937",
    fontWeight: '500',
  },
  
  // --- Button and Footer Styling ---
  submitButton: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    shadowColor: "#047857", // Green shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5, 
  },
  infoText: {
      marginTop: 25,
      fontSize: 13,
      color: '#6b7280',
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 18,
  }
});
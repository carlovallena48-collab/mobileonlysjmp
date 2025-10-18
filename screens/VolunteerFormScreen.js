import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// --- COLOR PALETTE (Consistent) ---
const PRIMARY_COLOR = "#047857"; // Deep Green
const SECONDARY_COLOR = "#34d399"; // Light Green
const BACKGROUND_COLOR = "#f0fdfa"; // Very Light Mint/Background
const CARD_BACKGROUND = "#ffffff"; // Pure White

// --- MINISTRY DATA ---
const VOLUNTEER_SERVERS = [
  "Mother Butler Guild",
  "Knights of the Altar",
  "Eucharistic Ministers of the Holy Communion",
  "Ministry of Lectors, Commentators and Psalmist",
  "Ministry of Ushers and Greeters",
  "Liturgical Music Ministry Cathechist",
  "Catholic Womens League",
  "Social Communication Ministry",
  "Social Service Ministry",
  "Ministry of Marshals"
];

const SERVER_ICONS = {
  "Mother Butler Guild": "flower-outline",
  "Knights of the Altar": "shield-outline",
  "Eucharistic Ministers of the Holy Communion": "wine-outline",
  "Ministry of Lectors, Commentators and Psalmist": "mic-outline",
  "Ministry of Ushers and Greeters": "people-outline",
  "Liturgical Music Ministry Cathechist": "musical-notes-outline",
  "Catholic Womens League": "heart-outline",
  "Social Communication Ministry": "megaphone-outline",
  "Social Service Ministry": "hand-left-outline",
  "Ministry of Marshals": "walk-outline"
};

// Your API base URL
const API_BASE_URL = "http://192.168.100.199:5000";

const VolunteerFormScreen = ({ navigation, route }) => {
  const [selectedServer, setSelectedServer] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get user data from navigation params
  const userEmail = route.params?.userEmail || "";

  // Animation for content entry
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedServer) {
      Alert.alert("Selection Required", "Please choose a ministry to serve in.");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.contactNumber) {
      Alert.alert("Incomplete Information", "Please fill in all required fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare volunteer data for database
      const volunteerData = {
        ministry: selectedServer,
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        submittedByEmail: userEmail || formData.email, // Use logged-in user's email if available
        status: "pending",
        applicationDate: new Date().toISOString(),
        requestNumber: `VOL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      console.log('📤 Submitting volunteer application:', volunteerData);

      // Send to your backend API
      const response = await fetch(`${API_BASE_URL}/api/volunteer-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(volunteerData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Volunteer application saved to database');
        setIsSubmitting(false);
        setSuccessModalVisible(true);
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }

    } catch (error) {
      console.error('❌ Error submitting volunteer application:', error);
      setIsSubmitting(false);
      Alert.alert(
        "Submission Failed", 
        "There was an error submitting your application. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    // Reset form fields
    setSelectedServer("");
    setFormData({
      fullName: "",
      email: "",
      contactNumber: ""
    });
    // Navigate back to the previous screen
    navigation.goBack();
  };

  const SuccessModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={successModalVisible}
      onRequestClose={handleSuccessClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.successModal, { opacity: fadeAnim, transform: [{ scale: 1 }] }]}> 
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={PRIMARY_COLOR} />
          </View>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successMessage}>
            Thank you {formData.fullName} for your interest in serving as {selectedServer}. 
            We will contact you soon at {formData.email}.
          </Text>
          <TouchableOpacity style={styles.successButton} onPress={handleSuccessClose}>
            <Text style={styles.successButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PRIMARY_COLOR }}>
      {/* Status Bar: Ensures color matches the header */}
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* Header: Fixed to the top */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Volunteer Registration</Text>
          <Text style={styles.headerSubtitle}>Serve the Church Community</Text>
        </View>
      </View>

      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Ministry Selection Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Choose Your Ministry</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Select the ministry where you would like to serve and share your gifts.
            </Text>

            <View style={styles.serverGrid}>
              {VOLUNTEER_SERVERS.map((server, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.serverCard,
                    selectedServer === server && styles.serverCardSelected
                  ]}
                  onPress={() => setSelectedServer(server)}
                >
                  <View style={[
                    styles.serverIconContainer,
                    selectedServer === server && styles.serverIconContainerSelected
                  ]}>
                    <Ionicons 
                      name={SERVER_ICONS[server]} 
                      size={24} 
                      color={selectedServer === server ? CARD_BACKGROUND : PRIMARY_COLOR} 
                    />
                  </View>
                  <Text style={[
                    styles.serverName,
                    selectedServer === server && styles.serverNameSelected
                  ]}>
                    {server}
                  </Text>
                  {selectedServer === server && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={16} color={CARD_BACKGROUND} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={PRIMARY_COLOR} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChangeText={(text) => handleInputChange('fullName', text)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={PRIMARY_COLOR} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={PRIMARY_COLOR} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChangeText={(text) => handleInputChange('contactNumber', text)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedServer || !formData.fullName || !formData.email || !formData.contactNumber) && 
              styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedServer || !formData.fullName || !formData.email || !formData.contactNumber || isSubmitting}
          >
            <View style={styles.submitContent}>
              <Ionicons 
                name={isSubmitting ? "reload" : "send"} 
                size={20} 
                color={CARD_BACKGROUND} 
                style={isSubmitting ? { transform: [{ rotate: '360deg' }] } : {}} 
              />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ height: 40 }}/>
        </ScrollView>
      </Animated.View>

      <SuccessModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // 1. SAFE AREA & HEADER (Sagad sa Screen)
  safeArea: {
    flex: 1,
    // Note: The SafeAreaView's background is set to PRIMARY_COLOR in the component
    // to ensure the status bar area is filled correctly.
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 15, // Ensure some padding below the status bar
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24, // Made title a bit bigger
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: SECONDARY_COLOR, // Highlight subtitle
    fontWeight: '600',
  },
  // 2. CONTENT CONTAINER
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // Removed marginTop: 10 as it's cleaner without it, letting the header border naturally
    // meet the curved top of the content area.
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
    paddingBottom: 40,
  },
  // 3. SECTION STYLES
  section: {
    marginBottom: 30,
    paddingHorizontal: 5, // Slight padding to push grid from edge
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22, // Made title bigger
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  // 4. MINISTRY GRID (3 Columns for better fit)
  serverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serverCard: {
    width: (width - 60) / 3.2, // Adjusted for 3 columns (60 is padding + margin)
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb', // Light border for default
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  serverCardSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#ecfdf5', // Lighter shade of mint
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  serverIconContainer: {
    width: 40, // Smaller icon container for 3 columns
    height: 40,
    borderRadius: 20,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serverIconContainerSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  serverName: {
    fontSize: 10, // Smaller font for 3 columns
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 14,
  },
  serverNameSelected: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 5. FORM STYLES
  form: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    paddingVertical: 0, // Ensure no extra padding from RN default
  },
  // 6. SUBMIT BUTTON
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
    marginHorizontal: 25, // Aligned with the content (25 padding)
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: CARD_BACKGROUND,
    marginLeft: 10,
  },
  // 7. MODAL STYLES (Minor tweaks)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  successModal: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: CARD_BACKGROUND,
  },
});

export default VolunteerFormScreen;
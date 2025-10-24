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
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons"; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define constants OUTSIDE the component
const API_URL = "http://192.168.1.42:5000/api";
const PRIMARY_COLOR = "#047857";
const SECONDARY_COLOR = "#34d399";
const BACKGROUND_COLOR = "#f0fdfa";
const CARD_BACKGROUND = "#ffffff";
const USER_STORAGE_KEY = '@userData';

const RequestCertificateScreen = ({ navigation, route }) => { 
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    certificateType: "",
    fullName: "",
    dateOfSacrament: "",
    purpose: "",
    contactNumber: "",
    address: "",
    requestedCopies: "1"
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ CRITICAL FIX: Load user data on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 CURRENT LOGGED-IN USER for Certificate Request:', user.email);
          setUserEmail(user.email);
        } else {
          console.log('❌ No user data found in storage');
          Alert.alert('Error', 'Please login to request certificates');
          navigation.goBack();
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserData();
  }, [navigation]);

  const handleSubmit = async () => {
    // ✅ CRITICAL: Check if user email is available
    if (!userEmail) {
      Alert.alert("Error", "User email not found. Please login again.", [{ text: "OK" }]);
      return;
    }

    const { certificateType, fullName, purpose } = formData;

    if (!certificateType.trim() || !fullName.trim() || !purpose.trim()) {
      Alert.alert("Kinakailangan", "Punan ang mga pangunahing impormasyong hinihingi.", [{ text: "OK" }]);
      return;
    }

    setIsLoading(true);

    try {
      const certificateData = {
        certificateType: certificateType.trim(),
        fullName: fullName.trim(),
        dateOfSacrament: formData.dateOfSacrament.trim() || null,
        purpose: purpose.trim(),
        contactNumber: formData.contactNumber.trim() || "",
        address: formData.address.trim() || "",
        requestedCopies: parseInt(formData.requestedCopies) || 1,
        submittedByEmail: userEmail, // ✅ CRITICAL: Use the actual logged-in user email
        status: 'Pending' // ✅ ADDED: Ensure status is set
      };

      console.log('📤 Submitting certificate request for user:', userEmail);
      console.log('📝 Request data:', certificateData);

      // ✅ ENHANCED: Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_URL}/certificate-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // ✅ BETTER ERROR HANDLING: Check response status
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorText;
          }
        } catch (e) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Server response:', result);

      if (result.success) {
        Alert.alert(
          "Tagumpay!",
          "Ang iyong kahilingan sa sertipiko ay naisumite na.\n\nSalamat sa iyong paghihintay, aabisuhan ka namin sa status ng iyong request.",
          [
            { 
              text: "Tingnan ang mga Kahilingan", 
              onPress: () => navigation.navigate('ViewRequestCertificate', { userEmail })
            },
            { 
              text: "Magsumite Pa", 
              onPress: () => clearForm(),
              style: "cancel" 
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('❌ Error submitting certificate request:', error);
      
      let errorMessage = "May problema sa pagsusumite ng iyong kahilingan.";
      
      if (error.name === 'AbortError') {
        errorMessage = "Timeout: Ang server ay hindi sumagot. Pakisubukan muli.";
      } else if (error.message.includes('Network request failed')) {
        errorMessage = "Network Error: Hindi makakonekta sa server. Pakisuri ang iyong internet connection.";
      } else if (error.message.includes('certificaterequests is not a function')) {
        errorMessage = "Server Error: May problema sa database connection. Pakikuha ang administrator.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert(
        "Error", 
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ TEST FUNCTION: Check if server is reachable
  const testServerConnection = async () => {
    try {
      console.log('🔍 Testing server connection to:', API_URL);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}/`, { 
        method: 'GET',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        Alert.alert('✅ Server Connection', 'Server is reachable and responding!');
        return true;
      }
    } catch (error) {
      console.error('❌ Server connection test failed:', error);
      Alert.alert('❌ Server Connection', 'Cannot connect to server. Please check your connection.');
    }
    return false;
  };

  const clearForm = () => {
    setFormData({
      certificateType: "",
      fullName: "",
      dateOfSacrament: "",
      purpose: "",
      contactNumber: "",
      address: "",
      requestedCopies: "1"
    });
  };

  const handleGoBack = () => {
    navigation.goBack(); 
  };

  // ✅ ENHANCED: Add connection test before submitting
  const handleSubmitWithCheck = async () => {
    // Test connection first
    const isServerReachable = await testServerConnection();
    
    if (!isServerReachable) {
      Alert.alert(
        "Connection Error",
        "Hindi makakonekta sa server. Pakisuri:\n\n1. Ang iyong internet connection\n2. Kung naka-on ang server\n3. Kung tama ang IP address",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: handleSubmit }
        ]
      );
      return;
    }
    
    // If server is reachable, proceed with submission
    await handleSubmit();
  };

  const certificateTypes = [
    "Baptismal Certificate",
    "Marriage Certificate", 
    "Confirmation Certificate",
    "Birth Certificate",
    "Death Certificate",
    "Kumpil Certificate",
    "Kumpisal Certificate",
    "Other Certificate"
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PRIMARY_COLOR }}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      <View style={[styles.headerContainer, { backgroundColor: PRIMARY_COLOR }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back-sharp" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Request Certificate</Text>
          <TouchableOpacity 
            onPress={testServerConnection} 
            style={styles.testButton}
          >
            <Ionicons name="wifi-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleGroup}>
          <Ionicons name="documents-outline" size={40} color="#fff" style={{ marginBottom: 5 }} />
          <Text style={styles.headerSubtitle}>Isumite ang iyong kahilingan nang madali.</Text>
          <Text style={styles.userInfo}>User: {userEmail || 'Loading...'}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { backgroundColor: BACKGROUND_COLOR }]}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Certificate Type Picker */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Uri ng Sertipiko <Text style={styles.requiredStar}>*</Text>
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.typeScrollView}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.typeContainer}>
              {certificateTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.certificateType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, certificateType: type }))}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.certificateType === type && styles.typeButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {formData.certificateType ? (
            <Text style={styles.selectedType}>Selected: {formData.certificateType}</Text>
          ) : null}
        </View>

        {/* Full Name Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Buong Pangalan <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={18} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ilagay ang Buong Pangalan"
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Date of Sacrament Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Petsa ng Sakramento (Opsiyonal)
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="calendar" size={18} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (Hal. 2000-01-15)"
              value={formData.dateOfSacrament}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfSacrament: text }))}
              placeholderTextColor="#9ca3af"
              keyboardType="default"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Contact Number Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Numero ng Telepono (Opsiyonal)
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="phone" size={18} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="09XXXXXXXXX"
              value={formData.contactNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, contactNumber: text }))}
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Address Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Address (Opsiyonal)
          </Text>
          <View style={[styles.inputContainer, styles.multilineContainer]}>
            <Feather name="map-pin" size={18} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Kompleto at tamang address"
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholderTextColor="#9ca3af"
              multiline={true}
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Requested Copies Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Bilang ng Kopya
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="copy" size={18} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="1"
              value={formData.requestedCopies}
              onChangeText={(text) => setFormData(prev => ({ ...prev, requestedCopies: text }))}
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Purpose Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            Layunin ng Kahilingan <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[styles.inputContainer, styles.multilineContainer]}>
            <Feather name="mail" size={18} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Para saan gagamitin ang sertipiko?"
              value={formData.purpose}
              onChangeText={(text) => setFormData(prev => ({ ...prev, purpose: text }))}
              placeholderTextColor="#9ca3af"
              multiline={true}
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: PRIMARY_COLOR },
            isLoading && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmitWithCheck} 
          disabled={isLoading || !userEmail}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="send" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.submitText}>
                {isLoading ? "Isinusumite..." : "Isumite ang Kahilingan"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          Ang pagproseso ay inaasahang matatapos sa loob ng 3-5 araw ng trabaho. 
          Makakatanggap ka ng notipikasyon sa status ng iyong request.
        </Text>

        <Text style={styles.requiredText}>
          <Text style={styles.requiredStar}>*</Text> Kinakailangang punan
        </Text>

    
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
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
  backButton: {
    padding: 5,
  },
  testButton: {
    padding: 5,
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#d1fae5",
    fontWeight: '500',
    marginTop: 5,
  },
  userInfo: {
    fontSize: 10,
    color: "#a7f3d0",
    marginTop: 2,
    fontFamily: 'monospace',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  inputCard: {
    marginBottom: 15,
    backgroundColor: CARD_BACKGROUND,
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
    marginBottom: 8,
    color: "#1f2937",
    textTransform: 'uppercase',
  },
  requiredStar: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    fontWeight: '500',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 60,
    paddingTop: 8,
  },
  typeScrollView: {
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeButtonActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  selectedType: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginTop: 5,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
  },
  requiredText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  debugInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_COLOR,
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 2,
  }
});

export default RequestCertificateScreen;
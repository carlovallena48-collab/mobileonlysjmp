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

  // Define constants OUTSIDE the component
  const API_URL = "http://10.173.231.17:5000/api";
  const PRIMARY_COLOR = "#047857";
  const SECONDARY_COLOR = "#34d399";
  const BACKGROUND_COLOR = "#f0fdfa";
  const CARD_BACKGROUND = "#ffffff";

  const RequestCertificateScreen = ({ navigation, route }) => { 
    const userEmail = route.params?.userEmail || "guest@example.com";
    
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

    const handleSubmit = async () => {
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
          submittedByEmail: userEmail
        };

        console.log('Submitting certificate request:', certificateData);

        const response = await fetch(`${API_URL}/certificate-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(certificateData)
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();

        console.log('Server response:', result);

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
        console.error('Error submitting certificate request:', error);
        Alert.alert(
          "Error", 
          `May problema sa pagsusumite ng iyong kahilingan: ${error.message}`,
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
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
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.headerTitleGroup}>
            <Ionicons name="documents-outline" size={40} color="#fff" style={{ marginBottom: 5 }} />
            <Text style={styles.headerSubtitle}>Isumite ang iyong kahilingan nang madali.</Text>
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
            onPress={handleSubmit}
            disabled={isLoading}
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
    headerTitleGroup: {
      alignItems: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: "#d1fae5",
      fontWeight: '500',
      marginTop: 5,
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
      includeFontPadding: false, // IMPORTANT FIX
    },
    multilineInput: {
      textAlignVertical: 'top',
      minHeight: 60,
      paddingTop: 8,
    },
    // Certificate Type Styles
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
    }
  });

  export default RequestCertificateScreen;
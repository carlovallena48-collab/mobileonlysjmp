import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const HolyOrderForm = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    contactNumber: false
  });

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.name = 'Name should contain only letters and spaces';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'contactNumber':
        const phoneRegex = /^(09|\+639)\d{9}$/;
        const cleanNumber = value.replace(/\s/g, '');
        if (!value) {
          newErrors.contactNumber = 'Contact number is required';
        } else if (!phoneRegex.test(cleanNumber)) {
          newErrors.contactNumber = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
        } else {
          delete newErrors.contactNumber;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    validateField('name', formData.name);
    validateField('email', formData.email);
    validateField('contactNumber', formData.contactNumber);
    
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation when user types
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };

  const formatPhoneNumber = (value) => {
    // Format as 09XX XXX XXXX
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('contactNumber', formatted);
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      contactNumber: true
    });

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userEmail = formData.email.trim().toLowerCase();
      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.replace(/\s/g, ''),
        submittedByEmail: userEmail,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Submitting Holy Orders request:', submissionData);
      
      const response = await fetch('http://10.69.226.17:5000/api/holy_orders_requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
        timeout: 10000, // 10 second timeout
      });

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid data submitted. Please check your information.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Network error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('✅ Submission successful:', result);

      Alert.alert(
        '✅ Application Submitted!',
        'Your Holy Orders application has been submitted successfully. We will contact you soon for further instructions.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                contactNumber: ''
              });
              setTouched({
                name: false,
                email: false,
                contactNumber: false
              });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Submission error:', error);
      
      let errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message;
      }

      Alert.alert(
        'Submission Failed', 
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.contactNumber.replace(/\s/g, '').length >= 11 &&
           Object.keys(errors).length === 0;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1a4d2a" barStyle="light-content" />
      <ImageBackground
        source={require('../assets/parish.jpg')}
        style={styles.background}
        blurRadius={2}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (formData.name || formData.email || formData.contactNumber) {
                Alert.alert(
                  'Discard Changes?',
                  'You have unsaved changes. Are you sure you want to go back?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', onPress: () => navigation.goBack() }
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Holy Orders</Text>
          <View style={styles.headerIcon}>
            <Icon name="church" size={24} color="#FFF" />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              {/* Form Header */}
              <View style={styles.formHeader}>
                <View style={styles.iconContainer}>
                  <Icon name="account_circle" size={50} color="#1a4d2a" />
                </View>
                <Text style={styles.title}>Vocational Calling</Text>
                <Text style={styles.subtitle}>
                  Answer God's call to serve in priestly ministry. Fill out this form to begin your journey.
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Name Field */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Icon name="person" size={20} color="#1a4d2a" style={styles.inputIcon} />
                    <Text style={styles.label}>Full Name *</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      errors.name && styles.inputError,
                      touched.name && !errors.name && styles.inputSuccess
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    onBlur={() => handleInputBlur('name')}
                    editable={!isSubmitting}
                  />
                  {errors.name ? (
                    <View style={styles.errorContainer}>
                      <Icon name="error-outline" size={16} color="#E74C3C" />
                      <Text style={styles.errorText}>{errors.name}</Text>
                    </View>
                  ) : touched.name && formData.name && (
                    <View style={styles.successContainer}>
                      <Icon name="check-circle" size={16} color="#27AE60" />
                      <Text style={styles.successText}>Name looks good</Text>
                    </View>
                  )}
                </View>

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Icon name="email" size={20} color="#1a4d2a" style={styles.inputIcon} />
                    <Text style={styles.label}>Email Address *</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && styles.inputError,
                      touched.email && !errors.email && styles.inputSuccess
                    ]}
                    placeholder="Enter your email address"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    onBlur={() => handleInputBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                  {errors.email ? (
                    <View style={styles.errorContainer}>
                      <Icon name="error-outline" size={16} color="#E74C3C" />
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                  ) : touched.email && formData.email && (
                    <View style={styles.successContainer}>
                      <Icon name="check-circle" size={16} color="#27AE60" />
                      <Text style={styles.successText}>Valid email</Text>
                    </View>
                  )}
                </View>

                {/* Contact Number Field */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Icon name="phone" size={20} color="#1a4d2a" style={styles.inputIcon} />
                    <Text style={styles.label}>Contact Number *</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      errors.contactNumber && styles.inputError,
                      touched.contactNumber && !errors.contactNumber && styles.inputSuccess
                    ]}
                    placeholder="09XX XXX XXXX"
                    placeholderTextColor="#999"
                    value={formData.contactNumber}
                    onChangeText={handlePhoneChange}
                    onBlur={() => handleInputBlur('contactNumber')}
                    keyboardType="phone-pad"
                    maxLength={13} // 09XX XXX XXXX
                    editable={!isSubmitting}
                  />
                  {errors.contactNumber ? (
                    <View style={styles.errorContainer}>
                      <Icon name="error-outline" size={16} color="#E74C3C" />
                      <Text style={styles.errorText}>{errors.contactNumber}</Text>
                    </View>
                  ) : touched.contactNumber && formData.contactNumber && (
                    <View style={styles.successContainer}>
                      <Icon name="check-circle" size={16} color="#27AE60" />
                      <Text style={styles.successText}>Valid phone number</Text>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton, 
                    (!isFormValid() || isSubmitting) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFF" />
                      <Text style={styles.submitButtonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Icon name="send" size={20} color="#FFF" />
                      <Text style={styles.submitButtonText}>Submit Application</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Form Instructions */}
                <View style={styles.instructions}>
                  <Text style={styles.instructionsText}>
                    * Required fields. After submission, you can track your application in the Schedule History section.
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  "The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart." - 1 Samuel 16:7
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a4d2a',
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  // Header Styles
  header: {
    backgroundColor: '#1a4d2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d6a3a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  headerIcon: {
    padding: 8,
  },
  // Card Styles
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(26, 77, 42, 0.2)',
    marginTop: 10,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    backgroundColor: 'rgba(26, 77, 42, 0.1)',
    padding: 15,
    borderRadius: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a4d2a',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#2d6a3a',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a4d2a',
    marginLeft: 8,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDEDED',
  },
  inputSuccess: {
    borderColor: '#27AE60',
    backgroundColor: '#F0F9F0',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 4,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginLeft: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 4,
  },
  successText: {
    color: '#27AE60',
    fontSize: 14,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#1a4d2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: '#1a4d2a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#95d5b2',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  instructions: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d2a',
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default HolyOrderForm;
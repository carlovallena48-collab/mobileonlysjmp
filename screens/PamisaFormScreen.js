import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const USER_STORAGE_KEY = '@userData';

const PamisaFormScreen = () => {
  const [selectedIntention, setSelectedIntention] = useState('');
  const [names, setNames] = useState(['', '', '']);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [massSponsor, setMassSponsor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // DateTime Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  // Load user data on component mount
  React.useEffect(() => {
      const loadUserData = async () => {
          try {
              const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
              if (userData) {
                  const user = JSON.parse(userData);
                  setUserEmail(user.email);
                  console.log('👤 Current user for Pamisa:', user.email);
              }
          } catch (error) {
              console.error('Error loading user data:', error);
          }
      };

      loadUserData();
  }, []);

  const intentions = [
    { id: 1, name: 'Thanksgiving', icon: '🙏', color: '#4CAF50' },
    { id: 2, name: 'Birthday', icon: '🎂', color: '#FF9800' },
    { id: 3, name: 'Wedding Anniversary', icon: '💍', color: '#E91E63' },
    { id: 4, name: 'Special Intention', icon: '⭐', color: '#9C27B0' },
    { id: 5, name: 'Speedy Recovery', icon: '🏥', color: '#2196F3' },
    { id: 6, name: 'Safe Travel', icon: '✈️', color: '#009688' },
    { id: 7, name: 'Soul', icon: '😇', color: '#795548' }
  ];

  const handleNameChange = (text, index) => {
    const newNames = [...names];
    newNames[index] = text;
    setNames(newNames);
  };

  // Date Picker Functions
  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      setDateInput(formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Time Picker Functions
  const onTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      const formattedTime = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setTimeInput(formattedTime);
    }
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  // Format date and time for submission
  const formatDateTimeForSubmission = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const timeStr = selectedTime.toTimeString().split(' ')[0];
    return {
      date: dateStr,
      time: timeStr,
      displayDate: dateInput,
      displayTime: timeInput
    };
  };

  const handleSubmit = async () => {
    if (!selectedIntention) {
      Alert.alert('Missing Information', 'Please select an intention for the Mass');
      return;
    }

    if (names.every(name => name.trim() === '')) {
      Alert.alert('Missing Information', 'Please enter at least one name');
      return;
    }

    if (!dateInput || !timeInput) {
      Alert.alert('Missing Information', 'Please select date and time');
      return;
    }

    // Check if user is logged in
    if (!userEmail) {
      Alert.alert('Login Required', 'Please login first before submitting a mass request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const datetime = formatDateTimeForSubmission();
      
      const formData = {
        sacrament: "Pamisa",
        intention: selectedIntention,
        names: names.filter(name => name.trim() !== ''),
        date: datetime.date,
        time: datetime.time,
        displayDate: datetime.displayDate,
        displayTime: datetime.displayTime,
        massSponsor: massSponsor || "",
        donation: "0",
        status: "pending",
        submittedByEmail: userEmail, // CRITICAL: Add user email
        createdAt: new Date().toISOString(),
        requestNumber: `MASS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      };

      console.log('📤 Submitting Pamisa request:', formData);

      const response = await fetch('http://10.69.226.17:5000/api/pamisa_requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      Alert.alert(
        'Success! 🎉',
        `Your Pamisa request has been submitted successfully.\n\n📋 Request Number: ${result.requestNumber}\n📅 Date: ${datetime.displayDate}\n⏰ Time: ${datetime.displayTime}\n\n💵 Donation: Please bring cash to the parish office when your schedule is confirmed.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedIntention('');
              setNames(['', '', '']);
              setDateInput('');
              setTimeInput('');
              setSelectedDate(new Date());
              setSelectedTime(new Date());
              setMassSponsor('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Connection Error', 
        'Cannot connect to server. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIntentionOption = (intention) => (
    <TouchableOpacity
      key={intention.id}
      style={[
        styles.optionButton,
        selectedIntention === intention.name && [
          styles.selectedOption,
          { borderColor: intention.color, backgroundColor: `${intention.color}15` }
        ]
      ]}
      onPress={() => setSelectedIntention(intention.name)}
    >
      <Text style={styles.optionIcon}>{intention.icon}</Text>
      <Text style={[
        styles.optionText,
        selectedIntention === intention.name && [
          styles.selectedOptionText,
          { color: intention.color }
        ]
      ]}>
        {intention.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Background */}
        <View style={styles.header}>
          <View style={styles.churchIcon}>
            <Text style={styles.churchIconText}>⛪</Text>
          </View>
          <Text style={styles.dioceseText}>Diocese of Antipolo</Text>
          <Text style={styles.parishText}>SAN JOSE MANGGAGAWA PARISH</Text>
          <Text style={styles.addressText}>
            E. Rodriguez Highway, San Jose, Rodriguez, Rizal
          </Text>
        </View>

        {/* Main Form Card */}
        <View style={styles.formCard}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Pamisa Request</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>Schedule Your Mass Intention</Text>
          </View>

          {/* User Info */}
          {userEmail && (
            <View style={styles.userInfo}>
              <Text style={styles.userInfoText}>Submitting as: {userEmail}</Text>
            </View>
          )}

          {/* Intention Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mass Intention</Text>
            <Text style={styles.sectionSubtitle}>Select the purpose of this Mass</Text>
            
            <View style={styles.intentionsGrid}>
              {intentions.map((intention) => (
                <View key={intention.id} style={styles.intentionItem}>
                  {renderIntentionOption(intention)}
                </View>
              ))}
            </View>
          </View>

          {/* Names Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Names for Intention</Text>
              <Text style={styles.counterText}>
                {names.filter(name => name.trim() !== '').length}/3
              </Text>
            </View>
            
            {names.map((name, index) => (
              <View key={index} style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    name.trim() !== '' && styles.filledInput
                  ]}
                  placeholder={`Name of person ${index + 1}${selectedIntention === 'Soul' ? ' (First name only)' : ''}`}
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => handleNameChange(text, index)}
                />
                {name.trim() !== '' && (
                  <View style={styles.inputCheckmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Date and Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Date</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.dateTimeButton, dateInput && styles.filledInput]}
                  onPress={showDatepicker}
                >
                  <Text style={[styles.dateTimeText, !dateInput && styles.placeholderText]}>
                    {dateInput || 'Select Date'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.halfInputContainer}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Time</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.dateTimeButton, timeInput && styles.filledInput]}
                  onPress={showTimepicker}
                >
                  <Text style={[styles.dateTimeText, !timeInput && styles.placeholderText]}>
                    {timeInput || 'Select Time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mass Sponsor */}
          <View style={styles.section}>
            <View style={styles.inputLabel}>
              <Text style={styles.labelText}>Mass Sponsor (Optional)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter sponsor's name"
              placeholderTextColor="#999"
              value={massSponsor}
              onChangeText={setMassSponsor}
            />
          </View>

          {/* Donation Information */}
          <View style={styles.section}>
            <View style={styles.donationInfoCard}>
              <Text style={styles.donationIcon}>💵</Text>
              <View style={styles.donationTextContainer}>
                <Text style={styles.donationTitle}>Donation</Text>
                <Text style={styles.donationDescription}>
                  Cash donations will be collected at the parish office when your mass schedule is confirmed.
                </Text>
              </View>
            </View>
          </View>

          {/* DateTime Pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedIntention || names.every(name => name.trim() === '') || !dateInput || !timeInput || isSubmitting) && 
              styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!selectedIntention || names.every(name => name.trim() === '') || !dateInput || !timeInput || isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Pamisa Request</Text>
                <Text style={styles.submitButtonSubtext}>
                  {dateInput && timeInput ? 
                    `Scheduled for ${dateInput} at ${timeInput}` : 
                    'We\'ll contact you for confirmation'
                  }
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Important Notes:</Text>
            <Text style={styles.instructionItem}>• Mass schedules are subject to availability</Text>
            <Text style={styles.instructionItem}>• You will receive a confirmation call</Text>
            <Text style={styles.instructionItem}>• Bring your donation to the parish office</Text>
            <Text style={styles.instructionItem}>• Arrive 15 minutes before your scheduled mass</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>San Jose Manggagawa Parish • Serving with Faith</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  churchIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  churchIconText: {
    fontSize: 30,
  },
  dioceseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 5,
  },
  parishText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginTop: -40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  userInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  counterText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  intentionItem: {
    width: '48%',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  filledInput: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  inputCheckmark: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputLabel: {
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateTimeButton: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#999',
  },
  donationInfoCard: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donationIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  donationTextContainer: {
    flex: 1,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  donationDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 6,
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submitButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#fff9e6',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default PamisaFormScreen;
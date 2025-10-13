import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
// Note: You must have @react-native-community/datetimepicker installed
import DateTimePicker from '@react-native-community/datetimepicker'; 
// Note: You must have @react-native-async-storage/async-storage installed
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width } = Dimensions.get('window');
const USER_STORAGE_KEY = '@userData';

const FuneralFormScreen = () => {
  const [formData, setFormData] = useState({
    nameOfDeceased: '',
    birthday: '',
    civilStatus: '', // New field from image
    nameOfHusbandOrWife: '',
    informant: '', // New field from image
    relationship: '', // New field from image
    residence: '', // Renamed from 'address' 
    dateDied: '',
    age: '', // New field from image
    causeOfDeath: '', // Corrected field from image
    receivedLastSacrament: 'No', // New field from image, default to No
    placeOfBurialCemetery: '', // New field from image
    scheduleDate: '', // Date of the service
    scheduleTime: '', // Time of the service
    contactNumber: '', // Contact No.
  });

  // State for Date Pickers
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showDateDiedPicker, setShowDateDiedPicker] = useState(false);
  const [showScheduleDatePicker, setShowScheduleDatePicker] = useState(false);
  const [showScheduleTimePicker, setShowScheduleTimePicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Helper function to format date
  const formatDate = (date) => {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Helper function to format time
  const formatTime = (time) => {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Load user data on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generic Date Change Handler for Deceased Dates
  const onDateChange = (field, dateType) => (event, selectedDate) => {
    if (dateType === 'birthday') setShowBirthdayPicker(false);
    if (dateType === 'dateDied') setShowDateDiedPicker(false);
    if (dateType === 'scheduleDate') setShowScheduleDatePicker(false);

    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      handleInputChange(field, formattedDate);
    }
  };

  // Time Change Handler
  const onTimeChange = (event, selectedTime) => {
    setShowScheduleTimePicker(false);
    if (selectedTime) {
      const formattedTime = formatTime(selectedTime);
      handleInputChange('scheduleTime', formattedTime);
    }
  };

  const handleSubmit = async () => {
    // Check required fields (based on common sense for a funeral form)
    if (!formData.nameOfDeceased || !formData.birthday || !formData.dateDied || 
        !formData.causeOfDeath || !formData.informant || !formData.relationship || 
        !formData.residence || !formData.placeOfBurialCemetery || 
        !formData.scheduleDate || !formData.scheduleTime || !formData.contactNumber) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!userEmail) {
      Alert.alert('Login Required', 'Please login first before submitting a funeral request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        sacrament: "Funeral Service",
        ...formData,
        status: 'pending',
        submittedByEmail: userEmail,
        createdAt: new Date().toISOString(),
        requestNumber: `FUNERAL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      };

      console.log('📤 Submitting Funeral Service request:', submissionData);

      // Replace with your actual API endpoint
      const response = await fetch('http://10.173.231.17:5000/api/funeral_requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();

      Alert.alert(
        'Success! 🎉',
        `Funeral Service request submitted successfully!\n\n📋 Request Number: ${result.requestNumber}\n📅 Date: ${formData.scheduleDate}\n⏰ Time: ${formData.scheduleTime}\n\nWe will contact you for confirmation.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form (keeping a simple reset for brevity)
              setFormData({
                nameOfDeceased: '',
                birthday: '',
                civilStatus: '',
                nameOfHusbandOrWife: '',
                informant: '',
                relationship: '',
                residence: '',
                dateDied: '',
                age: '',
                causeOfDeath: '',
                receivedLastSacrament: 'No',
                placeOfBurialCemetery: '',
                scheduleDate: '',
                scheduleTime: '',
                contactNumber: '',
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Connection Error', 
        `An error occurred. Please try again later. Details: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPickerButton = (onPress, value, placeholder) => (
    <TouchableOpacity 
      style={[styles.textInput, styles.pickerButton, value && styles.pickerButtonFilled]} 
      onPress={onPress}
    >
      <Text style={value ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
        {value || placeholder}
      </Text>
    </TouchableOpacity>
  );

  const renderRadioButtons = () => (
    <View style={styles.radioGroup}>
      <Text style={styles.label}>Received Last Sacrament?</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity 
          style={styles.radioButton}
          onPress={() => handleInputChange('receivedLastSacrament', 'Yes')}
        >
          <View style={styles.radioCircle}>
            {formData.receivedLastSacrament === 'Yes' && <View style={styles.selectedRadioCircle} />}
          </View>
          <Text style={styles.radioText}>( ) Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.radioButton}
          onPress={() => handleInputChange('receivedLastSacrament', 'No')}
        >
          <View style={styles.radioCircle}>
            {formData.receivedLastSacrament === 'No' && <View style={styles.selectedRadioCircle} />}
          </View>
          <Text style={styles.radioText}>( ) No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section - EXACTLY LIKE THE IMAGE */}
      <View style={styles.header}>
        <Text style={styles.dioceseText}>DIOCESE OF ANTIPOLO</Text>
        <Text style={styles.parishText}>SAN JOSE MANGGAGAWA PARISH</Text>
        <Text style={styles.addressText}>E. Rodriguez Highway, Cor. E. Manuel St., San Jose, Rodriguez, Rizal</Text>
        <Text style={styles.addressText}>Cellphone No. 0907-3314992</Text>
        <Text style={styles.formTitle}>FUNERAL FORM</Text>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        
        {/* Deceased Information Section */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name of Deceased:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.nameOfDeceased}
              onChangeText={(text) => handleInputChange('nameOfDeceased', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Birthday:</Text>
              {renderPickerButton(() => setShowBirthdayPicker(true), formData.birthday, 'Select Date')}
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Date Died:</Text>
              {renderPickerButton(() => setShowDateDiedPicker(true), formData.dateDied, 'Select Date')}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Civil Status:</Text>
              <TextInput
                style={styles.textInput}
                value={formData.civilStatus}
                onChangeText={(text) => handleInputChange('civilStatus', text)}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Age:</Text>
              <TextInput
                style={styles.textInput}
                value={formData.age}
                onChangeText={(text) => handleInputChange('age', text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name of Husband or Wife:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.nameOfHusbandOrWife}
              onChangeText={(text) => handleInputChange('nameOfHusbandOrWife', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Informant:</Text>
              <TextInput
                style={styles.textInput}
                value={formData.informant}
                onChangeText={(text) => handleInputChange('informant', text)}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Relationship:</Text>
              <TextInput
                style={styles.textInput}
                value={formData.relationship}
                onChangeText={(text) => handleInputChange('relationship', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Residence:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.residence}
              onChangeText={(text) => handleInputChange('residence', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cause of Death:</Text>
            <TextInput
              style={[styles.textInput, {minHeight: 50}]}
              value={formData.causeOfDeath}
              onChangeText={(text) => handleInputChange('causeOfDeath', text)}
              multiline
            />
          </View>
        </View>
        
        {/* Sacrament and Burial Section */}
        <View style={styles.section}>
          {renderRadioButtons()}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Place of Burial/Cemetery:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.placeOfBurialCemetery}
              onChangeText={(text) => handleInputChange('placeOfBurialCemetery', text)}
            />
          </View>
        </View>

        {/* Schedule and Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Schedule & Contact</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Date (Service):</Text>
              {renderPickerButton(() => setShowScheduleDatePicker(true), formData.scheduleDate, 'Select Service Date')}
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Time (Service):</Text>
              {renderPickerButton(() => setShowScheduleTimePicker(true), formData.scheduleTime, 'Select Service Time')}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact No.:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactNumber}
              onChangeText={(text) => handleInputChange('contactNumber', text.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        </View>

        {/* --- Date/Time Pickers --- */}
        {showBirthdayPicker && (
          <DateTimePicker
            value={new Date(formData.birthday || '2000-01-01')}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange('birthday', 'birthday')}
            maximumDate={new Date()}
          />
        )}

        {showDateDiedPicker && (
          <DateTimePicker
            value={new Date(formData.dateDied || new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange('dateDied', 'dateDied')}
            maximumDate={new Date()}
          />
        )}
        
        {showScheduleDatePicker && (
          <DateTimePicker
            value={new Date(formData.scheduleDate || new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange('scheduleDate', 'scheduleDate')}
            minimumDate={new Date()}
          />
        )}

        {showScheduleTimePicker && (
          <DateTimePicker
            value={new Date()} // Current time is fine for initial time picker value
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FUNERAL FORM'}
          </Text>
        </TouchableOpacity>

        {/* User Info */}
        {userEmail && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>Submitting as: {userEmail}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#086b2bff',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
  },
  dioceseText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  parishText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 15,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    width: '80%',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    marginTop: -20,
    elevation: 6,
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#23bd82ff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  pickerButton: {
    justifyContent: 'center',
    minHeight: 48,
  },
  pickerButtonFilled: {
    borderColor: '#20b99bff',
    backgroundColor: '#eff6ff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2cc491ff',
  },
  pickerButtonPlaceholder: {
    fontSize: 16,
    color: '#086626ff',
  },
  // Radio Button Styles
  radioGroup: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#097e38ff',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#06b43dff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
});

export default FuneralFormScreen;
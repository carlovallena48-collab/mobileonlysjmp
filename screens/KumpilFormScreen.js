import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Platform, Alert,
  Image, ActivityIndicator, Modal, Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

// 💡 NEW: Ginamit na ang iyong API URL
const API_URL = "http://192.168.100.199:5000/api/kumpil_requests"; 

const Colors = {
  // 🎨 Church-Themed Palette (Mas pinaganda at mas pormal)
  churchGreenPrimary: '#2E7D32', // Darker, richer green
  churchGreenLightBg: '#F1F8E9', // Very light, subtle green background
  churchGreenDarkText: '#1B5E20',
  churchGrayText: '#616161', // Darker gray for better readability
  pureWhite: '#FFFFFF',
  pureBlack: '#000000',
  inputBg: '#FFFFFF', // Clean white background for inputs
  inputBorder: '#E0E0E0', // Subtle light border
  shadowColor: '#000',
  datePickerText: '#212121',
  datePickerPlaceholder: '#9E9E9E',
  datePickerBorderHighlight: '#4CAF50', // Brighter green highlight
  redError: '#C62828', // Richer red
  headerBg: '#FFFFFF',
  headerText: '#212121',
  modalBg: 'rgba(0,0,0,0.7)',
  cancelButton: '#B0BEC5', // Subtle blue-gray for cancel
  cancelButtonText: '#424242',
  cardBg: '#FFFFFF',
};

// --- Komponent ng Porma ---

export default function KumpilFormScreen({ navigation, onAddRequest }) {
  const [form, setForm] = useState({
    confirmandName: '',
    birthPlace: '',
    age: '',
    baptismDate: null,
    baptismChurch: '',
    fatherName: '',
    motherName: '',
    currentAddress: '',
    godfatherName: '',
    godmotherName: '',
    kumpilDate: null,
    kumpilTime: null,
    contactNo: '',
  });

  const [showBapPicker, setShowBapPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCalendarOverlay, setShowCalendarOverlay] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState(null);

  // 💡 Check if user already has a pending schedule
  useEffect(() => {
    // Aalamin lang ang schedule kung may contact number na
    if (!form.contactNo || form.contactNo.length < 5) {
        setExistingSchedule(null); // I-reset kung kulang pa ang number
        return; 
    }

    const fetchExistingSchedule = async () => {
      try {
        // Assume API endpoint supports filtering by contactNo or user auth
        const response = await fetch(`${API_URL}?contactNo=${form.contactNo}`);
        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter: Find a schedule matching contactNo and is a future date
        const userSchedule = data.find(
          r => r.contactNo === form.contactNo && new Date(r.kumpilDate) >= today
        );
        
        if (userSchedule) {
          setExistingSchedule(userSchedule);
        } else {
            setExistingSchedule(null); // I-reset kung wala
        }
      } catch (error) {
        console.error("Error fetching existing schedule:", error);
      }
    };

    fetchExistingSchedule();
  }, [form.contactNo]); // Na-trigger kapag nagbago ang contactNo

  const handleChange = (field, value) => {
    // Basic capitalization logic for names and places
    if (field.includes('Name') || field.includes('Place') || field.includes('Church') || field.includes('Address')) {
      value = value.replace(/\b\w/g, char => char.toUpperCase());
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate, field) => {
    if (Platform.OS === 'android') {
      if (field === 'baptismDate') setShowBapPicker(false);
      if (field === 'kumpilTime') setShowTimePicker(false);
    }
    if (event.type === 'set') {
      handleChange(field, selectedDate || form[field]);
    }
  };

  const handleInitialKumpilDateSelection = (day) => {
    handleChange('kumpilDate', new Date(day.dateString));
  };

  const confirmInitialDate = () => {
    if (form.kumpilDate) {
      if (!form.kumpilTime) {
         const defaultTime = new Date(form.kumpilDate);
         defaultTime.setHours(10, 0, 0, 0); // Default to 10:00 AM
         handleChange('kumpilTime', defaultTime);
      }
      setShowCalendarOverlay(false);
    } else {
      Alert.alert('Select Date', 'Please select a Kumpil Date before proceeding.');
    }
  };

  const handleSubmit = () => {
    const requiredFields = {
      confirmandName: 'Confirmand Name',
      contactNo: 'Contact Number',
      fatherName: 'Father\'s Name',
      motherName: 'Mother\'s Name',
      kumpilDate: 'Kumpil Date',
      kumpilTime: 'Kumpil Time',
    };

    for (const field in requiredFields) {
      if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
        Alert.alert('Missing Information', `Please fill in the '${requiredFields[field]}' field.`);
        return;
      }
    }

    if (form.age && (isNaN(parseInt(form.age)) || parseInt(form.age) <= 0 || parseInt(form.age) > 100)) {
      Alert.alert('Invalid Age', 'Please enter a valid age (must be a positive number).');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (form.kumpilDate && form.kumpilDate < today) {
      Alert.alert('Invalid Date', 'The Kumpil date cannot be in the past. Please select a future date.');
      return;
    }

    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowModal(false); // Isara ang confirmation modal habang nagsu-submit

    const kumpilRequestData = {
      sacrament: 'Kumpil',
      kumpilDate: fmtDateRaw(form.kumpilDate),
      kumpilTime: fmtTimeRaw(form.kumpilTime),
      confirmandName: form.confirmandName,
      contactNo: form.contactNo,
      birthPlace: form.birthPlace,
      age: form.age,
      baptismDate: form.baptismDate ? fmtDateRaw(form.baptismDate) : null,
      baptismChurch: form.baptismChurch,
      fatherName: form.fatherName,
      motherName: form.motherName,
      currentAddress: form.currentAddress,
      godfatherName: form.godfatherName,
      godmotherName: form.godmotherName,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kumpilRequestData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit request to the server.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server Error: Status ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      // Matagumpay na submission
      setShowSuccessModal(true);
      setExistingSchedule(kumpilRequestData); // store scheduled details
      
      setTimeout(() => {
        setShowSuccessModal(false);
        resetForm();
        // navigation.navigate('Dashboard', { screen: 'MyRequests' }); 
      }, 2000);

    } catch (error) {
      console.error("Error submitting Kumpil request:", error);
      Alert.alert('Submission Failed', `An error occurred: ${error.message || 'Please check if your server is running and accessible.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      confirmandName: '', birthPlace: '', age: '',
      baptismDate: null, baptismChurch: '', fatherName: '',
      motherName: '', currentAddress: '', godfatherName: '',
      godmotherName: '', kumpilDate: null, kumpilTime: null, contactNo: '',
    });
    // Pinanatili ang calendar overlay para sa susunod na request
    setShowCalendarOverlay(true); 
  };

  const cancelSchedule = () => {
    Alert.alert(
      'Cancel Schedule',
      'Are you sure you want to cancel your scheduled Kumpil?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            // 💡 Sa totoong app, dapat may API call dito para i-DELETE ang schedule sa server.
            setExistingSchedule(null); 
            resetForm();
            Alert.alert('Cancelled', 'Your Kumpil schedule has been cancelled locally. You may now submit a new request.');
          },
        },
      ]
    );
  };

  // --- Utility Functions for Formatting ---
  const fmtDateRaw = d => d instanceof Date ? d.toLocaleDateString('en-US') : 'N/A';
  const fmtTimeRaw = t => t instanceof Date ? t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
  const fmtDate = d => d instanceof Date ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date';
  const fmtTime = t => t instanceof Date ? t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Select Time';

  // --- UI Components ---
  const renderSection = (title, iconName, children) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Feather name={iconName} size={24} color={Colors.churchGreenPrimary} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderInput = (placeholder, value, onChangeText, keyboardType = 'default', icon, autoCapitalize = 'words', isRequired = false) => (
    <View style={styles.inputContainer}>
      {icon && <Feather name={icon} size={20} color={Colors.churchGrayText} style={styles.inputIcon} />}
      <TextInput
        style={styles.textInput}
        placeholder={placeholder + (isRequired ? ' *' : '')} 
        placeholderTextColor={Colors.churchGrayText}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  const renderDatePickerButton = (label, dateValue, onPress, showPicker, onDateChange, mode = 'date', icon = 'calendar', minDate = undefined, isRequired = false) => (
    <View style={styles.datePickerWrapper}>
      <Text style={styles.dateLabel}>
        {label}
        {isRequired && <Text style={{ color: Colors.redError }}> *</Text>}:
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.datePickerButton, { 
          borderColor: showPicker ? Colors.datePickerBorderHighlight : Colors.inputBorder,
          borderWidth: showPicker ? 2 : 1, 
        }]}
      >
        <Feather name={icon} size={20} color={Colors.churchGreenPrimary} style={styles.inputIcon} />
        <Text style={[styles.datePickerText, dateValue instanceof Date ? { color: Colors.datePickerText } : { color: Colors.datePickerPlaceholder }]}>{mode === 'date' ? fmtDate(dateValue) : fmtTime(dateValue)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dateValue || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={minDate}
        />
      )}
    </View>
  );

  const DetailRow = ({ label, value }) => (
    <View style={styles.modalDetailRow}>
      <Text style={[styles.modalDetailLabel, { color: Colors.churchGreenDarkText }]}>{label}:</Text>
      <Text style={[styles.modalDetailValue, { color: Colors.churchGrayText }]}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSmallText}>Diocese of Antipolo</Text>
            <Text style={styles.headerParishName}>San Jose Manggagawa Parish</Text>
            <Text style={styles.headerAddress}>
              {"E. Rodriguez Highway, Cor. E. Manuel St., Brgy. San Jose, Rodriguez, Rizal"}
            </Text>
            <Text style={styles.headerContact}>Cellphone#: 0967-431-6482</Text>
          </View>
        </View>
        <Text style={styles.headerMemorandumTitle}>SACRAMENT OF CONFIRMATION (KUMPIL) REGISTRATION</Text>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>

      {/* 💡 BINAGONG LOGIC DITO: Check muna kung may Existing Schedule */}
      {existingSchedule ? (
        // --- A. Existing Schedule View ---
        <View style={styles.scheduledCard}>
          <Feather name="check-circle" size={40} color={Colors.churchGreenPrimary} style={{marginBottom: 10}}/>
          <Text style={styles.scheduledTitle}>You Already Have a Pending Kumpil Schedule!</Text>
          <Text style={styles.scheduledMessage}>
            Please wait for the Parish Office to process your request. 
            You can view details in your 'My Requests' section.
          </Text>
          <DetailRow label="Confirmand" value={existingSchedule.confirmandName} />
          <DetailRow label="Date" value={existingSchedule.kumpilDate} />
          <DetailRow label="Time" value={existingSchedule.kumpilTime} />
          
          <TouchableOpacity 
            style={[styles.cancelButton, { marginTop: 20, backgroundColor: Colors.redError }]} 
            onPress={cancelSchedule}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel Schedule</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- B. Form / Calendar Area (Kung Walang Existing Schedule) ---
        <>
          {showCalendarOverlay ? (
            // 1. Calendar Selection Overlay (Step 1)
            <View style={styles.calendarOverlay}>
              <Text style={styles.calendarOverlayTitle}>Step 1: Select Kumpil Date</Text>
              <Text style={styles.calendarInstruction}>Choose your desired date for the Sacrament of Confirmation.</Text>
              <Calendar
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={handleInitialKumpilDateSelection}
                markedDates={{
                  [form.kumpilDate ? form.kumpilDate.toISOString().split('T')[0] : '']: {
                    selected: true,
                    selectedColor: Colors.churchGreenPrimary,
                    dotColor: Colors.pureWhite,
                    textColor: Colors.pureWhite,
                  },
                }}
                theme={{
                  todayTextColor: Colors.redError, 
                  arrowColor: Colors.churchGreenPrimary,
                  monthTextColor: Colors.churchGreenDarkText,
                  textDayFontWeight: '600',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '700',
                  selectedDayBackgroundColor: Colors.churchGreenPrimary,
                  selectedDayTextColor: Colors.pureWhite,
                  'stylesheet.calendar.header': {
                    week: {
                      marginTop: 5, flexDirection: 'row', justifyContent: 'space-around',
                      backgroundColor: Colors.churchGreenLightBg, borderRadius: 8, paddingVertical: 5,
                    },
                    dayHeader: { color: Colors.churchGreenDarkText },
                  },
                }}
                style={styles.calendarStyle}
              />
              {form.kumpilDate && (
                <View style={styles.selectedDateDisplay}>
                  <Feather name="calendar" size={20} color={Colors.churchGreenDarkText} style={styles.inputIcon} />
                  <Text style={[styles.datePickerText, { color: Colors.churchGreenDarkText, fontWeight: 'bold' }]}>
                    Selected Date: {fmtDate(form.kumpilDate)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={confirmInitialDate}
                style={[styles.submitButton, !form.kumpilDate && { backgroundColor: Colors.cancelButton }]}
                disabled={!form.kumpilDate}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>Confirm Date & Proceed to Form</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 2. The Main Form (Step 2)
            <View>
              <Text style={styles.formInstruction}>
                Step 2: Please fill out the form completely. Fields marked with <Text style={{color: Colors.redError}}>*</Text> are required.
              </Text>

              {/* Personal Information */}
              {renderSection('Confirmand Information', 'user', <>
                {renderInput('Confirmand Name', form.confirmandName, v => handleChange('confirmandName', v), 'default', 'user', 'words', true)}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    {renderInput('Birth Place', form.birthPlace, v => handleChange('birthPlace', v), 'default', 'map-pin', 'words')}
                  </View>
                  <View style={styles.halfWidth}>
                    {renderInput('Age (Optional)', form.age, v => handleChange('age', v.replace(/[^0-9]/g, '')), 'numeric', 'hash', 'none')}
                  </View>
                </View>
                {renderInput('Church of Baptism', form.baptismChurch, v => handleChange('baptismChurch', v), 'default', 'church', 'words')}
                {renderDatePickerButton('Date of Baptism', form.baptismDate, () => setShowBapPicker(true), showBapPicker, (e, d) => handleDateChange(e, d, 'baptismDate'), 'date', 'calendar')}
              </>)}

              {/* Parents Information */}
              {renderSection('Parents & Address', 'home', <>
                {renderInput('Father\'s Name', form.fatherName, v => handleChange('fatherName', v), 'default', 'male', 'words', true)}
                {renderInput('Mother\'s Name', form.motherName, v => handleChange('motherName', v), 'default', 'female', 'words', true)}
                {renderInput('Current Address', form.currentAddress, v => handleChange('currentAddress', v), 'default', 'map', 'words')}
                {renderInput('Contact Number', form.contactNo, v => handleChange('contactNo', v.replace(/[^0-9]/g, '')), 'phone-pad', 'phone', 'none', true)}
              </>)}

              {/* Godparents & Kumpil Details */}
              {renderSection('Godparents & Schedule', 'cross', <>
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    {renderInput('Godfather\'s Name (Optional)', form.godfatherName, v => handleChange('godfatherName', v), 'default', 'user-plus', 'words')}
                  </View>
                  <View style={styles.halfWidth}>
                    {renderInput('Godmother\'s Name (Optional)', form.godmotherName, v => handleChange('godmotherName', v), 'default', 'user-plus', 'words')}
                  </View>
                </View>
                {/* Kumpil Date Display (Galing sa calendar) */}
                <View style={styles.datePickerWrapper}>
                  <Text style={styles.dateLabel}>Kumpil Date (Confirmed):</Text>
                  <TouchableOpacity
                    style={[styles.datePickerButton, { 
                      backgroundColor: Colors.churchGreenLightBg, 
                      borderColor: Colors.churchGreenPrimary, 
                      borderWidth: 2,
                    }]}
                    onPress={() => setShowCalendarOverlay(true)} // Option to change date
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={20} color={Colors.churchGreenDarkText} style={styles.inputIcon} />
                    <Text style={[styles.datePickerText, { color: Colors.churchGreenDarkText, fontWeight: '600' }]}>{fmtDate(form.kumpilDate)}</Text>
                    <Feather name="edit" size={18} color={Colors.churchGreenPrimary} />
                  </TouchableOpacity>
                </View>
                {/* Kumpil Time Picker */}
                {renderDatePickerButton('Kumpil Time', form.kumpilTime, () => setShowTimePicker(true), showTimePicker, (e, t) => handleDateChange(e, t, 'kumpilTime'), 'time', 'clock', undefined, true)}
              </>)}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.pureWhite} />
                ) : (
                  <Text style={styles.submitButtonText}>Review & Submit Registration</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Registration Details 📝</Text>
            <Text style={styles.modalSubTitle}>Please verify all information before submitting.</Text>
            <ScrollView style={styles.modalScrollContent}>
              <DetailRow label="Sacrament" value="Confirmation (Kumpil)" />
              <DetailRow label="Confirmand Name" value={form.confirmandName} />
              <DetailRow label="Birth Place" value={form.birthPlace} />
              <DetailRow label="Age" value={form.age} />
              <DetailRow label="Baptism Date" value={fmtDate(form.baptismDate)} />
              <DetailRow label="Baptism Church" value={form.baptismChurch} />
              <DetailRow label="Father's Name" value={form.fatherName} />
              <DetailRow label="Mother's Name" value={form.motherName} />
              <DetailRow label="Current Address" value={form.currentAddress} />
              <DetailRow label="Godfather's Name" value={form.godfatherName} />
              <DetailRow label="Godmother's Name" value={form.godmotherName} />
              <DetailRow label="Kumpil Date" value={fmtDate(form.kumpilDate)} />
              <DetailRow label="Kumpil Time" value={fmtTime(form.kumpilTime)} />
              <DetailRow label="Contact Number" value={form.contactNo} />
            </ScrollView>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.cancelButton }]} 
                onPress={() => setShowModal(false)}
                disabled={isSubmitting} // Disable during submission
              >
                <Text style={[styles.modalButtonText, { color: Colors.cancelButtonText }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary }]} 
                onPress={confirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.pureWhite} />
                ) : (
                  <Text style={styles.modalButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
            <Feather name="check-circle" size={50} color={Colors.churchGreenPrimary} style={{marginBottom: 15}}/>
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Registration Successful!</Text>
            <Text style={styles.modalSubTitle}>Your request has been sent to the Parish Office.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.churchGreenLightBg },
    header: {
      padding: 15, paddingTop: Platform.OS === 'android' ? 40 : 15,
      borderBottomLeftRadius: 0, borderBottomRightRadius: 0, 
      shadowColor: Colors.shadowColor, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 3, elevation: 5,
      alignItems: 'center', backgroundColor: Colors.headerBg,
      paddingBottom: 20, 
    },
    backButton: {
      position: 'absolute', left: 15, top: Platform.OS === 'android' ? 40 : 15, zIndex: 1,
    },
    headerContent: {
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      width: '100%', marginBottom: 10,
    },
    headerTextContainer: { flex: 1, alignItems: 'center', marginHorizontal: 0 },
    headerSmallText: { fontSize: 13, fontWeight: '500', textAlign: 'center', color: Colors.churchGrayText },
    headerParishName: { fontSize: 19, fontWeight: '900', textAlign: 'center', marginTop: 2, color: Colors.churchGreenDarkText },
    headerAddress: { fontSize: 11, textAlign: 'center', marginTop: 2, lineHeight: 14, color: Colors.churchGrayText },
    headerContact: { fontSize: 11, textAlign: 'center', marginTop: 2, color: Colors.churchGrayText },
    headerMemorandumTitle: {
      fontSize: 16, fontWeight: 'bold', marginTop: 15, borderBottomWidth: 3,
      borderBottomColor: Colors.churchGreenPrimary, paddingBottom: 5, color: Colors.churchGreenPrimary,
    },
    scrollViewContent: { padding: 15, paddingBottom: 50 },
    formInstruction: {
      fontSize: 14,
      color: Colors.churchGrayText,
      textAlign: 'center',
      marginBottom: 20,
      backgroundColor: Colors.pureWhite,
      padding: 10,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: Colors.churchGreenPrimary,
    },
    sectionCard: {
      borderRadius: 12,
      padding: 15, marginBottom: 20, shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
      backgroundColor: Colors.cardBg,
      borderLeftWidth: 5, 
      borderLeftColor: Colors.churchGreenPrimary,
    },
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center', marginBottom: 10,
      borderBottomWidth: 1, borderBottomColor: Colors.inputBorder, paddingBottom: 10,
    },
    sectionIcon: { marginRight: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.churchGreenDarkText },
    inputContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg,
      borderColor: Colors.inputBorder, borderWidth: 1, borderRadius: 10, height: 50, 
      marginBottom: 10, paddingHorizontal: 12, shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    inputIcon: { marginRight: 10 },
    textInput: { flex: 1, height: '100%', fontSize: 15, color: Colors.churchGreenDarkText },
    rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 },
    halfWidth: { width: '48%' },
    datePickerWrapper: { marginBottom: 15 },
    dateLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginLeft: 2, color: Colors.churchGreenDarkText },
    datePickerButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
      height: 50, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1,
      backgroundColor: Colors.inputBg, shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    datePickerText: { flex: 1, fontSize: 15, marginLeft: 5, color: Colors.datePickerText },
    submitButton: {
      padding: 15, alignItems: 'center', borderRadius: 10, shadowColor: Colors.churchGreenPrimary,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
      marginTop: 25, backgroundColor: Colors.churchGreenPrimary,
    },
    submitButtonText: { fontSize: 17, fontWeight: 'bold', color: Colors.pureWhite },
    calendarOverlay: { 
      padding: 20, 
      backgroundColor: Colors.pureWhite, 
      borderRadius: 15, 
      marginHorizontal: 5, 
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5,
    },
    calendarOverlayTitle: {
      fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center', color: Colors.churchGreenPrimary,
    },
    calendarInstruction: {
      fontSize: 14, color: Colors.churchGrayText, textAlign: 'center', marginBottom: 15,
    },
    calendarStyle: {
      borderRadius: 10, borderWidth: 1, borderColor: Colors.inputBorder, paddingBottom: 10,
    },
    selectedDateDisplay: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginTop: 20,
      backgroundColor: Colors.churchGreenLightBg,
      borderColor: Colors.churchGreenPrimary,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
    },
    modalOverlay: {
      flex: 1, backgroundColor: Colors.modalBg, justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
      backgroundColor: Colors.cardBg, padding: 25, borderRadius: 15, width: '90%',
      maxHeight: '85%', shadowColor: Colors.shadowColor, shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: Colors.churchGreenPrimary },
    modalSubTitle: { fontSize: 14, textAlign: 'center', marginBottom: 15, color: Colors.churchGrayText },
    modalScrollContent: { maxHeight: Dimensions.get('window').height * 0.45, paddingRight: 5, marginTop: 10 },
    modalDetailRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.inputBorder,
    },
    modalDetailLabel: { fontSize: 14, fontWeight: '600', flex: 1.5 },
    modalDetailValue: { fontSize: 14, flex: 2, textAlign: 'right' },
    modalButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 25 },
    modalButton: {
      paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: 8,
      shadowColor: Colors.shadowColor, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    modalButtonText: { fontSize: 16, fontWeight: 'bold' },
    scheduledCard: {
      padding: 20, 
      borderRadius: 15, 
      backgroundColor: Colors.pureWhite, 
      alignItems: 'center',
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 5,
      marginVertical: 10,
    },
    scheduledTitle: {
      fontSize: 20, 
      fontWeight: 'bold', 
      marginBottom: 5, 
      color: Colors.churchGreenPrimary,
      textAlign: 'center',
    },
    scheduledMessage: {
      fontSize: 14, 
      color: Colors.churchGrayText, 
      textAlign: 'center', 
      marginBottom: 20,
    },
    cancelButton: {
      padding: 15, alignItems: 'center', borderRadius: 10, 
      shadowColor: Colors.redError, shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
    },
    cancelButtonText: {
      fontSize: 16, fontWeight: 'bold', color: Colors.pureWhite,
    }
  });
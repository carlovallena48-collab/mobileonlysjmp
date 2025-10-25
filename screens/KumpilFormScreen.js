import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Platform, Alert,
  Image, ActivityIndicator, Modal, Dimensions, FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_URL = "https://mobileonlysjmp.onrender.com/api/kumpil_requests"; 

const Colors = {
  churchGreenPrimary: '#2E7D32',
  churchGreenLightBg: '#F1F8E9',
  churchGreenDarkText: '#1B5E20',
  churchGrayText: '#616161',
  pureWhite: '#FFFFFF',
  pureBlack: '#000000',
  inputBg: '#FFFFFF',
  inputBorder: '#E0E0E0',
  shadowColor: '#000',
  datePickerText: '#212121',
  datePickerPlaceholder: '#9E9E9E',
  datePickerBorderHighlight: '#4CAF50',
  redError: '#C62828',
  headerBg: '#FFFFFF',
  headerText: '#212121',
  modalBg: 'rgba(0,0,0,0.7)',
  cancelButton: '#B0BEC5',
  cancelButtonText: '#424242',
  cardBg: '#FFFFFF',
  statusPending: '#FFA000',
  statusApproved: '#2E7D32',
  statusRejected: '#C62828',
  statusCompleted: '#1565C0',
  paymentPaid: '#2E7D32',
  paymentUnpaid: '#757575',
};

const REGISTRATION_FEE = 300.00;

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
    godparents: [],
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
  const [userEmail, setUserEmail] = useState('');
  const [showGodparentModal, setShowGodparentModal] = useState(false);
  const [newGodparent, setNewGodparent] = useState({ name: '', type: 'godfather' });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@userData');
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

  useEffect(() => {
    const fetchExistingSchedule = async () => {
      try {
        if (!userEmail) return;

        const response = await fetch(API_URL);
        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const userSchedule = data.find(
          r => r.submittedByEmail === userEmail && 
               new Date(r.kumpilDate) >= today &&
               (r.status === 'pending' || r.status === 'approved' || !r.status)
        );
        
        if (userSchedule) {
          setExistingSchedule(userSchedule);
        } else {
          setExistingSchedule(null);
        }
      } catch (error) {
        console.error("Error fetching existing schedule:", error);
        setExistingSchedule(null);
      }
    };

    fetchExistingSchedule();
  }, [userEmail, form.contactNo]);

  const handleChange = (field, value) => {
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
         defaultTime.setHours(10, 0, 0, 0);
         handleChange('kumpilTime', defaultTime);
      }
      setShowCalendarOverlay(false);
    } else {
      Alert.alert('Select Date', 'Please select a Kumpil Date before proceeding.');
    }
  };

  // 💡 BAGO: Godparents Management
  const addGodparent = () => {
    if (newGodparent.name.trim()) {
      const godparent = {
        id: Date.now().toString(),
        name: newGodparent.name.trim().replace(/\b\w/g, char => char.toUpperCase()),
        type: newGodparent.type,
        addedAt: new Date().toISOString()
      };
      
      setForm(prev => ({
        ...prev,
        godparents: [...prev.godparents, godparent]
      }));
      
      setNewGodparent({ name: '', type: 'godfather' });
      setShowGodparentModal(false);
    } else {
      Alert.alert('Missing Information', 'Please enter the godparent\'s name.');
    }
  };

  const removeGodparent = (id) => {
    setForm(prev => ({
      ...prev,
      godparents: prev.godparents.filter(gp => gp.id !== id)
    }));
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
    setShowModal(false);

    try {
      if (!userEmail) {
        throw new Error('User not logged in. Please login first.');
      }

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
        godparents: form.godparents,
        registrationFee: REGISTRATION_FEE,
        submittedByEmail: userEmail,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      };

      console.log('Submitting Kumpil request:', kumpilRequestData);

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
      
      setShowSuccessModal(true);
      setExistingSchedule(kumpilRequestData);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        resetForm();
      }, 2000);

    } catch (error) {
      console.error("Error submitting Kumpil request:", error);
      Alert.alert('Submission Failed', error.message || 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      confirmandName: '', birthPlace: '', age: '',
      baptismDate: null, baptismChurch: '', fatherName: '',
      motherName: '', currentAddress: '', godparents: [],
      kumpilDate: null, kumpilTime: null, contactNo: '',
    });
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
            setExistingSchedule(null); 
            resetForm();
            Alert.alert('Cancelled', 'Your Kumpil schedule has been cancelled locally. You may now submit a new request.');
          },
        },
      ]
    );
  };

  const fmtDateRaw = d => d instanceof Date ? d.toLocaleDateString('en-US') : 'N/A';
  const fmtTimeRaw = t => t instanceof Date ? t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
  const fmtDate = d => d instanceof Date ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date';
  const fmtTime = t => t instanceof Date ? t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Select Time';

  // 💡 BAGO: Status Display Component
  const StatusBadge = ({ status, paymentStatus, rejectReason }) => (
    <View style={styles.statusContainer}>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
        <Text style={styles.statusText}>{status?.toUpperCase()}</Text>
      </View>
      
      <View style={[styles.paymentBadge, { backgroundColor: getPaymentColor(paymentStatus) }]}>
        <Text style={styles.paymentText}>{paymentStatus?.toUpperCase()}</Text>
      </View>

      {status === 'rejected' && rejectReason && (
        <View style={styles.rejectReasonContainer}>
          <Text style={styles.rejectReasonLabel}>Reason for Rejection:</Text>
          <Text style={styles.rejectReasonText}>{rejectReason}</Text>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return Colors.statusPending;
      case 'approved': return Colors.statusApproved;
      case 'rejected': return Colors.statusRejected;
      case 'completed': return Colors.statusCompleted;
      default: return Colors.churchGrayText;
    }
  };

  const getPaymentColor = (paymentStatus) => {
    switch(paymentStatus) {
      case 'paid': return Colors.paymentPaid;
      case 'unpaid': return Colors.paymentUnpaid;
      default: return Colors.churchGrayText;
    }
  };

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
      {/* 💡 BAGONG HEADER: Mas organized at professional */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        
        <View style={styles.headerMain}>
          <View style={styles.headerDiocese}>
            <Feather name="cross" size={20} color={Colors.churchGreenPrimary} />
            <Text style={styles.headerDioceseText}>Diocese of Antipolo</Text>
          </View>
          
          <Text style={styles.headerParishName}>San Jose Manggagawa Parish</Text>
          
          <View style={styles.headerDetails}>
            <View style={styles.headerDetailItem}>
              <Feather name="map-pin" size={12} color={Colors.churchGrayText} />
              <Text style={styles.headerDetailText}>
                E. Rodriguez Highway, Brgy. San Jose, Rodriguez, Rizal
              </Text>
            </View>
            
            <View style={styles.headerDetailItem}>
              <Feather name="phone" size={12} color={Colors.churchGrayText} />
              <Text style={styles.headerDetailText}>0967-431-6482</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerSacrament}>
          <Text style={styles.headerSacramentText}>CONFIRMATION (KUMPIL)</Text>
          <View style={styles.feeBadge}>
            <Feather name="credit-card" size={14} color={Colors.pureWhite} />
            <Text style={styles.feeBadgeText}>Fee: ₱{REGISTRATION_FEE.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>

      {existingSchedule ? (
        <View style={styles.scheduledCard}>
          {/* 💡 BAGO: Status Display */}
          <StatusBadge 
            status={existingSchedule.status} 
            paymentStatus={existingSchedule.paymentStatus}
            rejectReason={existingSchedule.rejectReason}
          />

          <Feather name="check-circle" size={40} color={Colors.churchGreenPrimary} style={{marginBottom: 10}}/>
          <Text style={styles.scheduledTitle}>
            {existingSchedule.status === 'pending' ? 'Pending Kumpil Schedule' :
             existingSchedule.status === 'approved' ? 'Approved Kumpil Schedule' :
             existingSchedule.status === 'rejected' ? 'Schedule Rejected' :
             'Kumpil Completed'}
          </Text>
          
          <Text style={styles.scheduledMessage}>
            {existingSchedule.status === 'pending' ? 
              'Please wait for the Parish Office to process your request.' :
             existingSchedule.status === 'approved' ? 
              'Your Kumpil schedule has been approved! Please proceed with payment.' :
             existingSchedule.status === 'rejected' ? 
              'Your schedule request has been rejected. Please see reason above.' :
              'Congratulations! Your Confirmation has been completed.'}
          </Text>
          
          <View style={styles.feeDisplay}>
            <Text style={styles.feeLabel}>Registration Fee:</Text>
            <Text style={styles.feeAmount}>₱{REGISTRATION_FEE.toFixed(2)}</Text>
          </View>
          
          <DetailRow label="Confirmand" value={existingSchedule.confirmandName} />
          <DetailRow label="Date" value={fmtDate(new Date(existingSchedule.kumpilDate))} />
          <DetailRow label="Time" value={existingSchedule.kumpilTime} />
          <DetailRow label="Contact" value={existingSchedule.contactNo} />

          {/* 💡 BAGO: Godparents List */}
          {existingSchedule.godparents && existingSchedule.godparents.length > 0 && (
            <View style={styles.godparentsSection}>
              <Text style={styles.godparentsTitle}>Godparents:</Text>
              {existingSchedule.godparents.map((godparent, index) => (
                <View key={godparent.id || index} style={styles.godparentItem}>
                  <Feather 
                    name={godparent.type === 'godfather' ? 'male' : 'female'} 
                    size={16} 
                    color={Colors.churchGreenPrimary} 
                  />
                  <Text style={styles.godparentText}>{godparent.name}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.cancelButton, { 
              marginTop: 20, 
              backgroundColor: existingSchedule.status === 'approved' ? Colors.churchGreenPrimary : Colors.redError 
            }]} 
            onPress={cancelSchedule}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>
              {existingSchedule.status === 'approved' ? 'Mark as Completed' : 'Cancel Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {showCalendarOverlay ? (
            <View style={styles.calendarOverlay}>
              <Text style={styles.calendarOverlayTitle}>Step 1: Select Kumpil Date</Text>
              <Text style={styles.calendarInstruction}>Choose your desired date for the Sacrament of Confirmation.</Text>
              
              <View style={styles.feeReminder}>
                <Feather name="info" size={16} color={Colors.churchGreenPrimary} />
                <Text style={styles.feeReminderText}>
                  Registration Fee: ₱{REGISTRATION_FEE.toFixed(2)}
                </Text>
              </View>
              
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

              {/* 💡 BAGO: Godparents Section with Add Button */}
              {renderSection('Godparents (Optional)', 'users', <>
                {/* Godparents List */}
                {form.godparents.length > 0 && (
                  <View style={styles.godparentsList}>
                    <Text style={styles.godparentsListTitle}>Added Godparents:</Text>
                    {form.godparents.map((godparent, index) => (
                      <View key={godparent.id} style={styles.godparentListItem}>
                        <View style={styles.godparentInfo}>
                          <Feather 
                            name={godparent.type === 'godfather' ? 'male' : 'female'} 
                            size={16} 
                            color={Colors.churchGreenPrimary} 
                          />
                          <Text style={styles.godparentName}>{godparent.name}</Text>
                          <Text style={styles.godparentType}>
                            ({godparent.type === 'godfather' ? 'Godfather' : 'Godmother'})
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => removeGodparent(godparent.id)}
                          style={styles.removeGodparentButton}
                        >
                          <Feather name="x" size={16} color={Colors.redError} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Godparent Button */}
                <TouchableOpacity 
                  style={styles.addGodparentButton}
                  onPress={() => setShowGodparentModal(true)}
                >
                  <Feather name="user-plus" size={20} color={Colors.churchGreenPrimary} />
                  <Text style={styles.addGodparentText}>Add Godparent</Text>
                </TouchableOpacity>
              </>)}

              {/* Kumpil Schedule */}
              {renderSection('Kumpil Schedule', 'calendar', <>
                <View style={styles.datePickerWrapper}>
                  <Text style={styles.dateLabel}>Kumpil Date (Confirmed):</Text>
                  <TouchableOpacity
                    style={[styles.datePickerButton, { 
                      backgroundColor: Colors.churchGreenLightBg, 
                      borderColor: Colors.churchGreenPrimary, 
                      borderWidth: 2,
                    }]}
                    onPress={() => setShowCalendarOverlay(true)}
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={20} color={Colors.churchGreenDarkText} style={styles.inputIcon} />
                    <Text style={[styles.datePickerText, { color: Colors.churchGreenDarkText, fontWeight: '600' }]}>{fmtDate(form.kumpilDate)}</Text>
                    <Feather name="edit" size={18} color={Colors.churchGreenPrimary} />
                  </TouchableOpacity>
                </View>
                {renderDatePickerButton('Kumpil Time', form.kumpilTime, () => setShowTimePicker(true), showTimePicker, (e, t) => handleDateChange(e, t, 'kumpilTime'), 'time', 'clock', undefined, true)}
                
                <View style={styles.feeNotice}>
                  <Feather name="credit-card" size={18} color={Colors.churchGreenPrimary} />
                  <Text style={styles.feeNoticeText}>
                    Registration Fee: ₱{REGISTRATION_FEE.toFixed(2)}
                  </Text>
                </View>
              </>)}

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

      {/* 💡 BAGO: Add Godparent Modal */}
      <Modal transparent visible={showGodparentModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Godparent</Text>
            
            <View style={styles.godparentForm}>
              <TextInput
                style={styles.godparentInput}
                placeholder="Godparent's Full Name"
                value={newGodparent.name}
                onChangeText={(text) => setNewGodparent(prev => ({ ...prev, name: text }))}
                autoCapitalize="words"
              />
              
              <View style={styles.godparentTypeContainer}>
                <Text style={styles.godparentTypeLabel}>Type:</Text>
                <TouchableOpacity 
                  style={[styles.godparentTypeButton, newGodparent.type === 'godfather' && styles.godparentTypeSelected]}
                  onPress={() => setNewGodparent(prev => ({ ...prev, type: 'godfather' }))}
                >
                  <Feather name="male" size={16} color={newGodparent.type === 'godfather' ? Colors.pureWhite : Colors.churchGreenPrimary} />
                  <Text style={[styles.godparentTypeText, newGodparent.type === 'godfather' && styles.godparentTypeTextSelected]}>
                    Godfather
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.godparentTypeButton, newGodparent.type === 'godmother' && styles.godparentTypeSelected]}
                  onPress={() => setNewGodparent(prev => ({ ...prev, type: 'godmother' }))}
                >
                  <Feather name="female" size={16} color={newGodparent.type === 'godmother' ? Colors.pureWhite : Colors.churchGreenPrimary} />
                  <Text style={[styles.godparentTypeText, newGodparent.type === 'godmother' && styles.godparentTypeTextSelected]}>
                    Godmother
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.cancelButton }]} 
                onPress={() => setShowGodparentModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: Colors.cancelButtonText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary }]} 
                onPress={addGodparent}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              
              {/* Godparents in Confirmation Modal */}
              {form.godparents.length > 0 ? (
                <View style={styles.confirmationGodparents}>
                  <Text style={styles.confirmationGodparentsLabel}>Godparents:</Text>
                  {form.godparents.map((godparent, index) => (
                    <Text key={godparent.id} style={styles.confirmationGodparentText}>
                      • {godparent.name} ({godparent.type === 'godfather' ? 'Godfather' : 'Godmother'})
                    </Text>
                  ))}
                </View>
              ) : (
                <DetailRow label="Godparents" value="None added" />
              )}
              
              <DetailRow label="Kumpil Date" value={fmtDate(form.kumpilDate)} />
              <DetailRow label="Kumpil Time" value={fmtTime(form.kumpilTime)} />
              <DetailRow label="Contact Number" value={form.contactNo} />
              
              <View style={styles.feeHighlight}>
                <DetailRow label="Registration Fee" value={`₱${REGISTRATION_FEE.toFixed(2)}`} />
              </View>
            </ScrollView>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.cancelButton }]} 
                onPress={() => setShowModal(false)}
                disabled={isSubmitting}
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
            
            <View style={styles.successFee}>
              <Text style={styles.successFeeText}>Registration Fee: ₱{REGISTRATION_FEE.toFixed(2)}</Text>
            </View>
            
            <Text style={[styles.modalSubTitle, { marginTop: 10, fontStyle: 'italic' }]}>
              Please wait for confirmation from the parish.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.churchGreenLightBg },
    // 💡 BAGONG HEADER STYLES
    header: {
      padding: 15, 
      paddingTop: Platform.OS === 'android' ? 40 : 15,
      backgroundColor: Colors.headerBg,
      borderBottomWidth: 3,
      borderBottomColor: Colors.churchGreenPrimary,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 4,
    },
    backButton: {
      position: 'absolute', 
      left: 15, 
      top: Platform.OS === 'android' ? 40 : 15, 
      zIndex: 1,
      backgroundColor: Colors.churchGreenLightBg,
      borderRadius: 20,
      padding: 5,
    },
    headerMain: {
      alignItems: 'center',
      marginBottom: 10,
    },
    headerDiocese: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    headerDioceseText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.churchGreenPrimary,
      marginLeft: 5,
    },
    headerParishName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors.churchGreenDarkText,
      textAlign: 'center',
      marginBottom: 8,
    },
    headerDetails: {
      alignItems: 'center',
    },
    headerDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    headerDetailText: {
      fontSize: 11,
      color: Colors.churchGrayText,
      marginLeft: 4,
    },
    headerSacrament: {
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: Colors.inputBorder,
      paddingTop: 10,
    },
    headerSacramentText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.churchGreenPrimary,
      marginBottom: 5,
    },
    feeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.churchGreenPrimary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
    },
    feeBadgeText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: Colors.pureWhite,
      marginLeft: 4,
    },
    // 💡 BAGO: Status Styles
    statusContainer: {
      marginBottom: 15,
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 8,
    },
    statusText: {
      color: Colors.pureWhite,
      fontWeight: 'bold',
      fontSize: 12,
    },
    paymentBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginBottom: 8,
    },
    paymentText: {
      color: Colors.pureWhite,
      fontWeight: 'bold',
      fontSize: 10,
    },
    rejectReasonContainer: {
      backgroundColor: Colors.churchGreenLightBg,
      padding: 10,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: Colors.redError,
      marginTop: 5,
    },
    rejectReasonLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: Colors.redError,
      marginBottom: 4,
    },
    rejectReasonText: {
      fontSize: 12,
      color: Colors.churchGrayText,
    },
    // 💡 BAGO: Godparents Styles
    godparentsList: {
      marginBottom: 15,
    },
    godparentsListTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.churchGreenDarkText,
      marginBottom: 8,
    },
    godparentListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.churchGreenLightBg,
      padding: 10,
      borderRadius: 8,
      marginBottom: 5,
    },
    godparentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    godparentName: {
      fontSize: 14,
      color: Colors.churchGreenDarkText,
      marginLeft: 8,
      marginRight: 5,
    },
    godparentType: {
      fontSize: 12,
      color: Colors.churchGrayText,
    },
    removeGodparentButton: {
      padding: 5,
    },
    addGodparentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.pureWhite,
      borderWidth: 2,
      borderColor: Colors.churchGreenPrimary,
      borderStyle: 'dashed',
      padding: 15,
      borderRadius: 10,
    },
    addGodparentText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.churchGreenPrimary,
      marginLeft: 8,
    },
    godparentsSection: {
      width: '100%',
      marginBottom: 15,
    },
    godparentsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: Colors.churchGreenDarkText,
      marginBottom: 8,
    },
    godparentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.churchGreenLightBg,
      padding: 8,
      borderRadius: 6,
      marginBottom: 5,
    },
    godparentText: {
      fontSize: 14,
      color: Colors.churchGrayText,
      marginLeft: 8,
    },
    // 💡 BAGO: Godparent Modal Styles
    godparentForm: {
      marginVertical: 15,
    },
    godparentInput: {
      backgroundColor: Colors.inputBg,
      borderWidth: 1,
      borderColor: Colors.inputBorder,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      marginBottom: 15,
    },
    godparentTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    godparentTypeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.churchGreenDarkText,
    },
    godparentTypeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: Colors.churchGreenPrimary,
    },
    godparentTypeSelected: {
      backgroundColor: Colors.churchGreenPrimary,
    },
    godparentTypeText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.churchGreenPrimary,
      marginLeft: 5,
    },
    godparentTypeTextSelected: {
      color: Colors.pureWhite,
    },
    confirmationGodparents: {
      marginBottom: 10,
    },
    confirmationGodparentsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.churchGreenDarkText,
      marginBottom: 5,
    },
    confirmationGodparentText: {
      fontSize: 14,
      color: Colors.churchGrayText,
      marginLeft: 10,
      marginBottom: 2,
    },
    // ... (keep all your existing styles from previous code)
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
      padding: 15, 
      marginBottom: 20, 
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 5, 
      elevation: 3,
      backgroundColor: Colors.cardBg,
      borderLeftWidth: 5, 
      borderLeftColor: Colors.churchGreenPrimary,
    },
    sectionHeader: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 10,
      borderBottomWidth: 1, 
      borderBottomColor: Colors.inputBorder, 
      paddingBottom: 10,
    },
    sectionIcon: { marginRight: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.churchGreenDarkText },
    inputContainer: {
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: Colors.inputBg,
      borderColor: Colors.inputBorder, 
      borderWidth: 1, 
      borderRadius: 10, 
      height: 50, 
      marginBottom: 10, 
      paddingHorizontal: 12, 
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.05, 
      shadowRadius: 3, 
      elevation: 1,
    },
    inputIcon: { marginRight: 10 },
    textInput: { flex: 1, height: '100%', fontSize: 15, color: Colors.churchGreenDarkText },
    rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 },
    halfWidth: { width: '48%' },
    datePickerWrapper: { marginBottom: 15 },
    dateLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginLeft: 2, color: Colors.churchGreenDarkText },
    datePickerButton: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'flex-start',
      height: 50, 
      borderRadius: 10, 
      paddingHorizontal: 12, 
      borderWidth: 1,
      backgroundColor: Colors.inputBg, 
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.05, 
      shadowRadius: 3, 
      elevation: 1,
    },
    datePickerText: { flex: 1, fontSize: 15, marginLeft: 5, color: Colors.datePickerText },
    submitButton: {
      padding: 15, 
      alignItems: 'center', 
      borderRadius: 10, 
      shadowColor: Colors.churchGreenPrimary,
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      shadowRadius: 6, 
      elevation: 6,
      marginTop: 25, 
      backgroundColor: Colors.churchGreenPrimary,
    },
    submitButtonText: { fontSize: 17, fontWeight: 'bold', color: Colors.pureWhite },
    calendarOverlay: { 
      padding: 20, 
      backgroundColor: Colors.pureWhite, 
      borderRadius: 15, 
      marginHorizontal: 5, 
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 5, 
      elevation: 5,
    },
    calendarOverlayTitle: {
      fontSize: 20, 
      fontWeight: 'bold', 
      marginBottom: 5, 
      textAlign: 'center', 
      color: Colors.churchGreenPrimary,
    },
    calendarInstruction: {
      fontSize: 14, 
      color: Colors.churchGrayText, 
      textAlign: 'center', 
      marginBottom: 15,
    },
    calendarStyle: {
      borderRadius: 10, 
      borderWidth: 1, 
      borderColor: Colors.inputBorder, 
      paddingBottom: 10,
    },
    selectedDateDisplay: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: 20,
      backgroundColor: Colors.churchGreenLightBg,
      borderColor: Colors.churchGreenPrimary,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
    },
    modalOverlay: {
      flex: 1, 
      backgroundColor: Colors.modalBg, 
      justifyContent: 'center', 
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: Colors.cardBg, 
      padding: 25, 
      borderRadius: 15, 
      width: '90%',
      maxHeight: '85%', 
      shadowColor: Colors.shadowColor, 
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3, 
      shadowRadius: 15, 
      elevation: 10,
    },
    modalTitle: { 
      fontSize: 20, 
      fontWeight: 'bold', 
      textAlign: 'center', 
      color: Colors.churchGreenPrimary 
    },
    modalSubTitle: { 
      fontSize: 14, 
      textAlign: 'center', 
      marginBottom: 15, 
      color: Colors.churchGrayText 
    },
    modalScrollContent: { 
      maxHeight: Dimensions.get('window').height * 0.45, 
      paddingRight: 5, 
      marginTop: 10 
    },
    modalDetailRow: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingVertical: 10, 
      borderBottomWidth: 1, 
      borderBottomColor: Colors.inputBorder,
    },
    modalDetailLabel: { 
      fontSize: 14, 
      fontWeight: '600', 
      flex: 1.5 
    },
    modalDetailValue: { 
      fontSize: 14, 
      flex: 2, 
      textAlign: 'right' 
    },
    modalButtonsContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      marginTop: 25 
    },
    modalButton: {
      paddingVertical: 12, 
      paddingHorizontal: 25, 
      borderRadius: 10,
      alignItems: 'center', 
      justifyContent: 'center', 
      flex: 1, 
      marginHorizontal: 8,
      shadowColor: Colors.shadowColor, 
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, 
      shadowRadius: 4, 
      elevation: 3,
    },
    modalButtonText: { 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
    scheduledCard: {
      padding: 20, 
      borderRadius: 15, 
      backgroundColor: Colors.pureWhite, 
      alignItems: 'center',
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.15, 
      shadowRadius: 5, 
      elevation: 5,
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
      padding: 15, 
      alignItems: 'center', 
      borderRadius: 10, 
      shadowColor: Colors.redError, 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 4, 
      elevation: 4,
    },
    cancelButtonText: {
      fontSize: 16, 
      fontWeight: 'bold', 
      color: Colors.pureWhite,
    },
    feeDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: Colors.churchGreenLightBg,
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: Colors.churchGreenPrimary,
    },
    feeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.churchGreenDarkText,
    },
    feeAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors.churchGreenPrimary,
    },
    feeReminder: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.churchGreenLightBg,
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: Colors.churchGreenPrimary,
    },
    feeReminderText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.churchGreenDarkText,
      marginLeft: 8,
    },
    feeNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.pureWhite,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
      borderWidth: 2,
      borderColor: Colors.churchGreenPrimary,
    },
    feeNoticeText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.churchGreenPrimary,
      marginLeft: 8,
    },
    feeHighlight: {
      backgroundColor: Colors.churchGreenLightBg,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginTop: 5,
    },
    successFee: {
      marginTop: 10,
      padding: 12,
      backgroundColor: Colors.churchGreenLightBg,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: Colors.churchGreenPrimary,
    },
    successFeeText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.churchGreenDarkText,
      textAlign: 'center',
    },
  });
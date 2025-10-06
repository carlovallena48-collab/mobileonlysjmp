import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Image, Platform, Alert, Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import SignatureCanvas from 'react-native-signature-canvas';

const { width: screenWidth } = Dimensions.get('window');

// Consolidated Colors (C)
const C = {
  primary: '#388E3C', lightBg: '#E8F5E9', darkText: '#1B5E20',
  grayText: '#616161', white: '#FFFFFF', black: '#000000',
  inputBg: '#FAFAFA', inputBorder: '#E0E0E0', shadow: '#000',
  redError: '#D32F2F', headerBg: '#FFFFFF', headerText: '#212121',
  modalBg: 'rgba(0,0,0,0.6)', cancelBtn: '#F0F0F0', cancelBtnTxt: '#424242',
  calSelBg: '#4CAF50', calSelTxt: '#FFFFFF', calDayTxt: '#424242',
  calInactiveTxt: '#BDBDBD', calHeaderBg: '#FFFFFF', calWkndTxt: '#D32F2F',
  calTodayBorder: '#388E3C',
  timeSlotBg: '#F5F5F5', timeSlotBorder: '#E0E0E0', timeSlotTxt: '#424242',
  timeSlotSelBg: '#388E3C', timeSlotSelTxt: '#FFFFFF',
};

// Visit Date/Time Selection Overlay Component (ovS)
const VisitDateTimeSelectionOverlay = ({ currentSelectedDate, currentSelectedTime, onConfirmSelection }) => {
  const [tempSelectedDate, setTempSelectedDate] = useState(currentSelectedDate || new Date());
  const [tempSelectedTime, setTempSelectedTime] = useState(currentSelectedTime || null);
  const [markedDates, setMarkedDates] = useState({});

  const fmtDate = useCallback(d => d instanceof Date ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date', []);
  const fmtTime = useCallback(t => t ? t : 'Select Time', []);

  useEffect(() => {
    const newMarkedDates = {};
    const selDateStr = tempSelectedDate?.toISOString().split('T')[0];
    if (selDateStr) newMarkedDates[selDateStr] = { selected: true, selectedColor: C.calSelBg, textColor: C.calSelTxt };
    const todayStr = new Date().toISOString().split('T')[0];
    if (selDateStr !== todayStr && !newMarkedDates[todayStr])
      newMarkedDates[todayStr] = { customStyles: { container: { borderColor: C.calTodayBorder, borderWidth: 1 }, text: { color: C.calTodayBorder } } };
    setMarkedDates(newMarkedDates);
  }, [tempSelectedDate]);

  const handleDayPress = day => {
    const selectedDate = new Date(day.dateString); selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < new Date().setHours(0,0,0,0)) {
      Alert.alert("Invalid Date", "Please select a date that is today or in the future."); setTempSelectedDate(null); return;
    }
    setTempSelectedDate(selectedDate);
  };

  const availableTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];

  const handleConfirm = () => {
    if (!tempSelectedDate) { Alert.alert("Missing Info", "Please select a date."); return; }
    if (!tempSelectedTime) { Alert.alert("Missing Info", "Please select a time."); return; }
    onConfirmSelection(tempSelectedDate, tempSelectedTime);
  };

  return (
    <View style={ovS.container}>
      <ScrollView contentContainerStyle={ovS.scrollViewContent}>
        <Text style={[ovS.title, { color: C.darkText }]}>Select Date & Time of Visit</Text>
        <Calendar minDate={new Date().toISOString().split('T')[0]} onDayPress={handleDayPress}
          markedDates={markedDates} style={ovS.calendar} enableSwipeMonths={true}
          theme={{
            backgroundColor: C.white, calendarBackground: C.white, textSectionTitleColor: C.grayText,
            selectedDayBackgroundColor: C.calSelBg, selectedDayTextColor: C.calSelTxt, todayTextColor: C.calTodayBorder,
            dayTextColor: C.calDayTxt, textDisabledColor: C.calInactiveTxt, dotColor: C.calSelBg,
            arrowColor: C.darkText, monthTextColor: C.darkText, textDayFontWeight: '500',
            textMonthFontWeight: 'bold', textDayHeaderFontWeight: '600', textDayFontSize: 16,
            textMonthFontSize: 18, textDayHeaderFontSize: 13, 'stylesheet.calendar.header': {
              week: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-around',
                backgroundColor: C.lightBg, borderRadius: 8, paddingVertical: 5, marginBottom: 5 },
              dayHeader: { color: C.darkText },
            },
          }}
        />
      <View style={ovS.selectedDisplayContainer}>
  <View style={{flexDirection: 'row', alignItems: 'center'}}>
    <Feather name="calendar" size={16} color={C.darkText} />
    <Text> {fmtDate(tempSelectedDate)}</Text>
  </View>
  <View style={{flexDirection: 'row', alignItems: 'center'}}>
    <Feather name="clock" size={16} color={C.darkText} />
    <Text> {fmtTime(tempSelectedTime)}</Text>
  </View>
</View>
        <View style={ovS.timeSlotsContainer}>
          {availableTimeSlots.map((slot, i) => (
            <TouchableOpacity key={i} onPress={() => setTempSelectedTime(slot)} activeOpacity={0.7}
              style={[ovS.timeSlotButton, { backgroundColor: C.timeSlotBg, borderColor: C.timeSlotBorder },
                tempSelectedTime === slot && { backgroundColor: C.timeSlotSelBg, borderColor: C.timeSlotSelBg }]}>
              <Text style={[ovS.timeSlotText, { color: C.timeSlotTxt },
                tempSelectedTime === slot && { color: C.timeSlotSelTxt }]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleConfirm} style={[ovS.confirmButton, { backgroundColor: C.primary }]}
          disabled={!tempSelectedDate || !tempSelectedTime} activeOpacity={0.7}>
          <Text style={[ovS.confirmButtonText, { color: C.white }]}>Confirm Selection & Proceed</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Main SickCallFormScreen Component (ms)
export default function SickCallFormScreen({ navigation }) {
  const signatureRef = useRef(null);
  const [form, setForm] = useState({
    patientName: '', address: '', contactNumber: '', contactPerson: '',
    relationship: '', status: '', age: '', dateOfVisit: null,
    timeOfVisit: null, sickness: '', signature: null,
  });
  const [showVisitSelectionOverlay, setShowVisitSelectionOverlay] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleChange = useCallback((field, value) => {
    if (field.includes('Name') || field.includes('Address') || field.includes('Person') || field.includes('Relationship')) {
      value = value.replace(/\b\w/g, char => char.toUpperCase());
    }
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const fmtDate = useCallback(d => d instanceof Date ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date', []);
  const fmtTime = useCallback(t => t ? t : 'Select Time', []);

  const handleDateTimeConfirmed = useCallback((date, time) => {
    handleChange('dateOfVisit', date); handleChange('timeOfVisit', time); setShowVisitSelectionOverlay(false);
  }, [handleChange]);

  const handleSignatureSave = () => { if (signatureRef.current) signatureRef.current.readSignature(); };
  const handleSignatureOK = signature => { setForm(prev => ({ ...prev, signature })); setShowSignatureModal(false); };
  const handleClearSignature = () => { if (signatureRef.current) signatureRef.current.clearSignature(); setForm(prev => ({ ...prev, signature: null })); };

  const handleSubmit = () => {
    const requiredFields = { patientName: 'Patient Name', address: 'Address', contactNumber: 'Contact Number',
      dateOfVisit: 'Date of Visit', timeOfVisit: 'Time of Visit', sickness: 'Sickness/Condition' };
    for (const field in requiredFields) {
      if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
        Alert.alert('Missing Info', `Please fill in the '${requiredFields[field]}' field.`); return;
      }
    }
    if (!form.signature) { Alert.alert('Missing Signature', 'Please provide a signature in the remarks section.'); return; }
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    const formDataForApi = { ...form, dateOfVisit: form.dateOfVisit ? form.dateOfVisit.toLocaleDateString('en-US') : '' };
    try {
      await new Promise(r => setTimeout(r, 1500));
      setShowModal(false);
      Alert.alert('Success!', 'Your Sick Call request has been submitted!', [{ text: 'OK', onPress: () => {
        setForm({ patientName: '', address: '', contactNumber: '', contactPerson: '', relationship: '',
          status: '', age: '', dateOfVisit: null, timeOfVisit: null, sickness: '', signature: null, });
        if (signatureRef.current) signatureRef.current.clearSignature();
        setShowVisitSelectionOverlay(true); navigation.goBack();
      }}]);
    } catch (e) { console.error("Error submitting:", e); Alert.alert('Failed', 'An error occurred. Try again.'); }
    finally { setIsSubmitting(false); }
  };

  const renderSection = (title, iconName, children) => (
    <View style={ms.sectionCard}>
      <View style={ms.sectionHeader}>
        <Feather name={iconName} size={22} color={C.primary} style={ms.sectionIcon} />
        <Text style={[ms.sectionTitleHeader, { color: C.darkText }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderInput = (label, placeholder, value, onChangeText, keyboardType = 'default', icon, autoCapitalize = 'words', multiline = false, isRequired = false) => (
    <View style={ms.inputGroup}>
      <Text style={[ms.label, { color: C.darkText }]}>{label} {isRequired && <Text style={ms.requiredIndicator}>*</Text>}</Text>
      <View style={ms.inputContainer}>
        {/* Render icon if provided, it will sit as the first item in the flex row */}
        {icon && <Feather name={icon} size={20} color={C.grayText} style={ms.inputIcon} />}
        <TextInput
          style={[
            ms.inputField,
            { color: C.darkText },
            multiline && ms.textArea,
            // Dynamically set paddingLeft based on icon presence
            { paddingLeft: icon ? (20 + 12) : 15 } // 20 (icon width) + 12 (icon marginRight) or 15 (default container padding)
          ]}
          placeholder={placeholder} placeholderTextColor={C.grayText} value={value}
          onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize}
          multiline={multiline} numberOfLines={multiline ? 4 : 1}
        />
      </View>
    </View>
  );

  const renderDateTimeDisplay = (label, value, icon, onPress) => (
    <View style={ms.dateTimeDisplayWrapper}>
      <Text style={[ms.dateTimeLabel, { color: C.darkText }]}>{label}:</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={ms.dateTimeDisplayButton}>
        <Feather name={icon} size={20} color={C.primary} style={ms.inputIcon} />
        <Text style={[ms.dateTimeDisplayText, value ? { color: C.grayText } : { color: C.grayText }]}>
          {label.includes('Date') ? fmtDate(value) : fmtTime(value)}
        </Text>
        <Feather name="edit-2" size={18} color={C.grayText} />
      </TouchableOpacity>
    </View>
  );

  const DetailRow = ({ label, value }) => (
    <View style={ms.modalDetailRow}>
      <Text style={[ms.modalDetailLabel, { color: C.darkText }]}>{label}:</Text>
      {label === 'Signature' && value ? (<Image source={{ uri: value }} style={ms.modalSignatureImage} resizeMode="contain" />) :
      (<Text style={[ms.modalDetailValue, { color: C.grayText }]}>{value || 'N/A'}</Text>)}
    </View>
  );

  return (
    <View style={[ms.container, { backgroundColor: C.lightBg }]}>
      <View style={[ms.header, { backgroundColor: C.headerBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ms.backButton} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={C.headerText} />
        </TouchableOpacity>
        <View style={ms.headerContent}>
          <Image source={require('../assets/LOGO.png')} style={ms.headerSmallLogo} />
          <View style={ms.headerTextContainer}>
            <Text style={[ms.headerSmallText, { color: C.headerText }]}>Diocese of Antipolo</Text>
            <Text style={[ms.headerParishName, { color: C.headerText }]}>San Jose Manggagawa Parish</Text>
            <Text style={[ms.headerAddress, { color: C.grayText }]}>E. Rodriguez Highway, Cor. E. Manuel St.,{'\n'}Brgy. San Jose, Rodriguez, Rizal</Text>
            <Text style={[ms.headerContact, { color: C.grayText }]}>Cellphone#: 0967-431-6482</Text>
          </View>
          <Image source={require('../assets/Diocese.png')} style={ms.headerSmallLogo} />
        </View>
        <Text style={[ms.headerMemorandumTitle, { color: C.headerText }]}>SICK CALL FORM</Text>
      </View>

      {showVisitSelectionOverlay ? (
        <VisitDateTimeSelectionOverlay currentSelectedDate={form.dateOfVisit} currentSelectedTime={form.timeOfVisit} onConfirmSelection={handleDateTimeConfirmed} />
      ) : (
        <ScrollView contentContainerStyle={ms.scrollViewContent}>
          {renderSection('Visit Details', 'calendar', <>
            {renderDateTimeDisplay('Date of Visit', form.dateOfVisit, 'calendar', () => setShowVisitSelectionOverlay(true))}
            {renderDateTimeDisplay('Time of Visit', form.timeOfVisit, 'clock', () => setShowVisitSelectionOverlay(true))}
            {renderInput('SICKNESS/CONDITION', 'Describe the sickness, condition, or reason for sick call', form.sickness, v => handleChange('sickness', v), 'default', null, 'sentences', true, true)}
            <View style={ms.inputGroup}>
                <Text style={[ms.label, { color: C.darkText }]}>Remarks / Signature: <Text style={ms.requiredIndicator}>*</Text></Text>
                <TouchableOpacity onPress={() => setShowSignatureModal(true)} style={ms.openSignatureButton} activeOpacity={0.7}>
                    <Feather name="edit-3" size={20} color={C.primary} style={ms.inputIcon} />
                    <Text style={[ms.openSignatureButtonText, { color: C.darkText }]}>
                        {form.signature ? 'Signature Provided (Tap to Redraw)' : 'Tap to Sign Here'}
                    </Text>
                </TouchableOpacity>
                {form.signature && (
                    <View style={ms.signaturePreviewContainer}>
                        <Text style={[ms.label, {color: C.darkText, marginBottom: 5}]}>Current Signature:</Text>
                        <Image source={{ uri: form.signature }} style={ms.signaturePreviewImage} resizeMode="contain" />
                        <TouchableOpacity onPress={handleClearSignature} style={ms.clearSignatureButton} activeOpacity={0.7}>
                            <Feather name="x-circle" size={18} color={C.redError} />
                            <Text style={[ms.clearSignatureText, { color: C.redError }]}>Clear Current Signature</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
          </>)}
          {renderSection('Patient Information', 'user', <>
            {renderInput('NAME', 'Full Name of Patient', form.patientName, v => handleChange('patientName', v), 'default', 'user', 'words', false, true)}
            {renderInput('AGE', 'Age of Patient', form.age, v => handleChange('age', v), 'numeric', 'info', 'none')}
            {renderInput('ADDRESS', 'Complete Address', form.address, v => handleChange('address', v), 'default', 'home', 'words', false, true)}
            {renderInput('STATUS', 'e.g., Stable, Critical, Recovering', form.status, v => handleChange('status', v), 'default', 'activity')}
          </>)}
          {renderSection('Contact Person Information', 'phone', <>
            {renderInput('CONTACT NUMBER', 'e.g., 09XX-XXX-XXXX', form.contactNumber, v => handleChange('contactNumber', v), 'phone-pad', 'phone', 'none', false, true)}
            {renderInput('CONTACT PERSON', 'Name of Contact Person', form.contactPerson, v => handleChange('contactPerson', v), 'default', 'user-plus')}
            {renderInput('RELATIONSHIP', 'e.g., Son, Daughter, Spouse', form.relationship, v => handleChange('relationship', v), 'default', 'heart')}
          </>)}
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.7}
            style={ms.submitButton}>
            {isSubmitting ? (<ActivityIndicator color={C.white} />) : (<Text style={ms.submitButtonText}>Review Details</Text>)}
          </TouchableOpacity>
        </ScrollView>
      )}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={ms.modalOverlay}>
          <View style={ms.modalContent}>
            <Text style={[ms.modalTitle, { color: C.darkText }]}>Confirm Request Details</Text>
            <ScrollView style={ms.modalScrollContent}>
              <DetailRow label="Sacrament" value="Sick Call" /><DetailRow label="Parish" value="San Jose Manggagawa Parish" />
              <DetailRow label="Patient Name" value={form.patientName} /><DetailRow label="Age" value={form.age} />
              <DetailRow label="Address" value={form.address} /><DetailRow label="Status" value={form.status} />
              <DetailRow label="Contact Number" value={form.contactNumber} /><DetailRow label="Contact Person" value={form.contactPerson} />
              <DetailRow label="Relationship" value={form.relationship} />
              <DetailRow label="Date of Visit" value={fmtDate(form.dateOfVisit)} /><DetailRow label="Time of Visit" value={fmtTime(form.timeOfVisit)} />
              <DetailRow label="Sickness/Condition" value={form.sickness} />
              <DetailRow label="Signature" value={form.signature} />
            </ScrollView>
            <View style={ms.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} disabled={isSubmitting} activeOpacity={0.7}
                style={[ms.modalButton, { backgroundColor: C.cancelBtn }]}>
                <Text style={[ms.modalButtonText, { color: C.cancelBtnTxt }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmSubmit} disabled={isSubmitting} activeOpacity={0.7}
                style={[ms.modalButton, { backgroundColor: C.primary }]}>
                {isSubmitting ? (<ActivityIndicator color={C.white} />) : (<Text style={[ms.modalButtonText, { color: C.white }]}>Submit Now</Text>)}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={showSignatureModal} animationType="slide" onRequestClose={() => setShowSignatureModal(false)}>
        <View style={ms.signatureModalOverlay}>
          <View style={ms.signatureModalContent}>
            <Text style={[ms.signatureModalTitle, { color: C.darkText }]}>Draw Your Signature</Text>
            <View style={ms.signaturePadContainer}>
              <SignatureCanvas ref={signatureRef} onOK={handleSignatureOK}
                webStyle={`
                    .m-signature-pad--footer {display: none;}
                    .m-signature-pad {box-shadow: none; border: none;}
                    body {background-color: #f0f0f0;}
                `}
                canvasText="Sign here" backgroundColor="#f0f0f0" penColor={C.black}
                minWidth={1} maxWidth={3} velocityFilterWeight={0.9}
              />
            </View>
            <View style={ms.signatureModalActions}>
              <TouchableOpacity onPress={handleClearSignature} style={[ms.modalButton, ms.signatureModalClearButton]} activeOpacity={0.7}>
                <Feather name="x-circle" size={20} color={C.redError} />
                <Text style={[ms.modalButtonText, { color: C.redError }]}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignatureSave} style={[ms.modalButton, { backgroundColor: C.primary }]} activeOpacity={0.7}>
                <Feather name="check-circle" size={20} color={C.white} />
                <Text style={[ms.modalButtonText, { color: C.white }]}>Save Signature</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Renamed styles for brevity (ovS = overlayStyles, ms = mainFormStyles)
const ovS = StyleSheet.create({
  container: { flex: 1, marginVertical: 20, backgroundColor: C.white, borderRadius: 15, padding: 25,
    marginHorizontal: 20, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  scrollViewContent: { paddingBottom: 20, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  calendar: { width: '100%', borderRadius: 10, overflow: 'hidden', borderWidth: 1,
    borderColor: C.inputBorder, marginBottom: 20,
  },
  selectedDisplayContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: C.lightBg, borderRadius: 10, paddingVertical: 15, paddingHorizontal: 10,
    marginBottom: 25, borderWidth: 1, borderColor: C.primary,
  },
  selectedDisplayText: { fontSize: 16, fontWeight: '600', color: C.darkText, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 5,
  },
  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start',
    marginBottom: 25, paddingHorizontal: 5,
  },
  timeSlotButton: { width: (screenWidth - 40 - 50) / 3.5, height: 50, borderRadius: 8, borderWidth: 1,
    margin: 4, justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.timeSlotBg, borderColor: C.timeSlotBorder,
  },
  timeSlotText: { fontSize: 15, fontWeight: 'bold', color: C.timeSlotTxt },
  confirmButton: { padding: 16, alignItems: 'center', borderRadius: 12, backgroundColor: C.primary,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15,
    shadowRadius: 8, elevation: 8, marginTop: 10,
  },
  confirmButtonText: { fontSize: 18, fontWeight: 'bold', },
});

const ms = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15, paddingTop: Platform.OS === 'android' ? 40 : 15,
    borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 5, elevation: 8,
    alignItems: 'center', backgroundColor: C.headerBg,
  },
  backButton: { position: 'absolute', left: 15, top: Platform.OS === 'android' ? 40 : 15, zIndex: 1 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginBottom: 10,
  },
  headerSmallLogo: { width: 60, height: 60, resizeMode: 'contain' },
  headerTextContainer: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
  headerSmallText: { fontSize: 14, fontWeight: 'normal', textAlign: 'center' },
  headerParishName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 2 },
  headerAddress: { fontSize: 12, textAlign: 'center', marginTop: 2, lineHeight: 16 },
  headerContact: { fontSize: 12, textAlign: 'center', marginTop: 2 },
  headerMemorandumTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15, borderBottomWidth: 2,
    borderBottomColor: C.primary, paddingBottom: 5,
  },
  scrollViewContent: { padding: 20, paddingBottom: 100 },
  sectionCard: { borderRadius: 12, padding: 20, marginBottom: 20, backgroundColor: C.white,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 6, elevation: 4,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15,
    borderBottomWidth: 1, borderBottomColor: C.inputBorder, paddingBottom: 10,
  },
  sectionIcon: { marginRight: 10 },
  sectionTitleHeader: { fontSize: 19, fontWeight: 'bold' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginLeft: 5 },
  requiredIndicator: { color: C.redError, fontSize: 14 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Important for multiline text to start at top
    backgroundColor: C.inputBg,
    borderColor: C.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10, // Add internal vertical padding here
  },
  inputIcon: {
    marginRight: 12, // Space between icon and text input
    marginLeft: 15, // Aligns icon with the 15 units padding of the container
  },
  inputField: {
    flex: 1,
    // height: '100%', // Removed as it conflicts with multiline
    fontSize: 16,
    paddingVertical: 0, // Control vertical padding via inputContainer
    paddingHorizontal: 0, // Ensure no extra horizontal padding here
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top', // For Android
    // paddingTop and paddingBottom are now handled by inputContainer's paddingVertical
  },

  dateTimeDisplayWrapper: { marginBottom: 15 },
  dateTimeLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginLeft: 5 },
  dateTimeDisplayButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 55, borderRadius: 10, paddingHorizontal: 15, borderWidth: 1,
    backgroundColor: C.inputBg, borderColor: C.inputBorder,
  },
  dateTimeDisplayText: { flex: 1, fontSize: 16, marginLeft: 5, color: C.grayText },

  openSignatureButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderColor: C.inputBorder, borderWidth: 1, borderRadius: 10, height: 55,
    paddingHorizontal: 15, justifyContent: 'flex-start',
  },
  openSignatureButtonText: { fontSize: 16, marginLeft: 5, flex: 1 },
  signaturePreviewContainer: { marginTop: 15, alignItems: 'center', borderWidth: 1,
    borderColor: C.inputBorder, borderRadius: 10, padding: 10, backgroundColor: C.inputBg,
  },
  signaturePreviewImage: { width: '90%', height: 100, resizeMode: 'contain', borderWidth: 1,
    borderColor: C.inputBorder, backgroundColor: C.white, borderRadius: 5, marginBottom: 10,
  },
  clearSignatureButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 8, backgroundColor: C.lightBg,
    borderColor: C.redError, borderWidth: 1, width: '80%',
  },
  clearSignatureText: { marginLeft: 5, fontSize: 14, fontWeight: 'bold' },

  submitButton: { padding: 18, alignItems: 'center', borderRadius: 12, backgroundColor: C.primary,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2,
    shadowRadius: 8, elevation: 8, position: 'absolute', bottom: 20, left: 20, right: 20,
  },
  submitButtonText: { fontSize: 18, fontWeight: 'bold', color: C.white },

  modalOverlay: { flex: 1, backgroundColor: C.modalBg, justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: C.white, padding: 30, borderRadius: 15, width: '90%',
    maxHeight: '85%', shadowColor: C.shadow, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalScrollContent: { maxHeight: Platform.OS === 'ios' ? 300 : 250, paddingRight: 10 },
  modalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.inputBorder,
  },
  modalDetailLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  modalDetailValue: { fontSize: 15, flex: 2, textAlign: 'right' },
  modalSignatureImage: { width: '60%', height: 70, borderWidth: 1, borderColor: C.inputBorder,
    backgroundColor: '#f9f9f9', borderRadius: 5,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  modalButton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', minWidth: 120,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginHorizontal: 5,
    flexDirection: 'row',
  },
  modalButtonText: { fontSize: 17, fontWeight: 'bold', marginLeft: 5 },

  signatureModalOverlay: { flex: 1, backgroundColor: C.modalBg, justifyContent: 'center', alignItems: 'center' },
  signatureModalContent: { backgroundColor: C.white, borderRadius: 15, padding: 20, width: '90%',
    height: '70%', shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 10, justifyContent: 'space-between',
  },
  signatureModalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  signaturePadContainer: { flex: 1, borderColor: C.inputBorder, borderWidth: 1, borderRadius: 10,
    overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 20,
  },
  signatureModalActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  signatureModalClearButton: { backgroundColor: C.cancelBtn, borderColor: C.redError, borderWidth: 1 },
});
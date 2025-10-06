import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, ScrollView,
    TouchableOpacity, StyleSheet, Platform, Alert,
    Image, ActivityIndicator, Modal, Dimensions,
    KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width, height } = Dimensions.get('window');
// ** IMPORTANT: Palitan ang IP na ito sa IP address ng iyong computer! **
const API_URL = "http://192.168.100.199:5000/api/baptismrequests";
const CONTACT_STORAGE_KEY = '@BaptismContact';

const Colors = {
    churchGreenPrimary: '#4CAF50',
    churchGreenLightBg: '#E8F5E9',
    churchGreenDarkText: '#1B5E20',
    churchGrayText: '#757575',
    pureWhite: '#FFFFFF',
    pureBlack: '#000000',
    inputBg: '#F7F9F7',
    inputBorder: '#DDE7DD',
    shadowColor: '#000000',
    datePickerText: '#333333',
    datePickerPlaceholder: '#A0A0A0',
    datePickerBorderHighlight: '#A5D6A7',
    redError: '#D32F2F',
    headerBg: '#FFFFFF',
    headerText: '#000000',
    modalBg: 'rgba(0,0,0,0.6)',
    cancelButton: '#E0E0E0',
    cancelButtonText: '#424242',
    editButton: '#FF9800',
};

// Dropdown options
const maritalStatusOptions = [
    { value: 'Married', label: 'Married' },
    { value: 'Single Parent', label: 'Single Parent' },
    { value: 'Separated', label: 'Separated' },
    { value: 'Widowed', label: 'Widowed' },
];

// Detail Row helper for modals and schedule view
const DetailRow = ({ label, value }) => (
    <View style={styles.modalDetailRow}>
        <Text style={styles.modalDetailLabel}>{label}</Text>
        <Text style={styles.modalDetailValue}>{value || '—'}</Text>
    </View>
);

// Function to format Date (ISO string or Date object)
const fmtDate = (d) => {
    if (!d) return '';
    try {
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date.getTime())) return ''; // Invalid date check
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return '';
    }
};

// Function to format Time (Date object)
const fmtTime = (t) => t ? new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

// Function para i-handle ang MongoDB date object format
const getDateValue = (dataField) => {
    if (dataField && dataField.$date && dataField.$date.$numberLong) {
        return new Date(parseInt(dataField.$date.$numberLong, 10));
    } else if (dataField && typeof dataField === 'string') {
        return new Date(dataField);
    } else if (dataField instanceof Date) {
        return dataField;
    }
    return null;
};


export default function BaptismFormScreen({ navigation }) {
    const [hasScheduled, setHasScheduled] = useState(false);
    const [scheduledData, setScheduledData] = useState(null);
    const [loadingExisting, setLoadingExisting] = useState(true);

    // State para sa Contact Number ng user na naka-save sa device
    const [userContact, setUserContact] = useState('');
    // State para kontrolin kung ang contact field ay read-only
    const [isContactEditable, setIsContactEditable] = useState(true);

    const [form, setForm] = useState({
        baptizedName: '', birthDate: null, birthPlace: '', fatherName: '', fatherBirthPlace: '',
        motherName: '', motherBirthPlace: '', maritalStatus: '', currentAddress: '',
        godfatherName: '', godfatherAddress: '', godmotherName: '', godmotherAddress: '',
        baptismDate: null, baptismTime: null, contactNo: '',
    });

    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [showBapTimePicker, setShowBapTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showCalendarOverlay, setShowCalendarOverlay] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [contactInputReady, setContactInputReady] = useState(false); // Para i-enable ang contact input

    // Refs for inputs
    const refs = {
        baptizedName: useRef(null), birthPlace: useRef(null), fatherName: useRef(null),
        fatherBirthPlace: useRef(null), motherName: useRef(null), motherBirthPlace: useRef(null),
        currentAddress: useRef(null), godfatherName: useRef(null), godfatherAddress: useRef(null),
        godmotherName: useRef(null), godmotherAddress: useRef(null), contactNo: useRef(null),
    };

    // Utility Functions
    const formatDateAPI = (d) => {
        const date = new Date(d);
        const yyyy = date.getFullYear();
        const mm = `${date.getMonth() + 1}`.padStart(2, '0');
        const dd = `${date.getDate()}`.padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatTimeAPI = (t) => {
        const date = new Date(t);
        let hh = date.getHours();
        const mm = `${date.getMinutes()}`.padStart(2, '0');
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12;
        hh = hh ? hh : 12;
        return `${hh.toString().padStart(2, '0')}:${mm} ${ampm}`;
    };

    // Helper Functions (for rendering)
    const renderFormInput = ({
        label, placeholder, value, onChangeText,
        icon, isDatePicker, onPress, showPicker,
        mode = 'date', onDateChange, minDate,
        keyboardType = 'default', autoCapitalize = 'words',
        inputRef, note, isRequired = true, maxLength, isReadOnly = false
    }) => {
        // I-override ang isReadOnly para sa contact field base sa isContactEditable state
        const finalIsReadOnly = label === 'Contact Number' ? !isContactEditable : isReadOnly;
        
        const displayValue = isDatePicker && value
            ? (mode === 'time' ? fmtTime(value) : fmtDate(value))
            : (typeof value === 'string' ? value : '');

        const isFilled = isDatePicker ? !!value : (typeof value === 'string' && value.trim() !== '');

        return (
            <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: Colors.churchGreenDarkText }]}>
                    {label}{isRequired && <Text style={{ color: Colors.redError }}> *</Text>}
                </Text>
                {note && <Text style={[styles.noteText, { color: Colors.churchGrayText }]}>{note}</Text>}

                {isDatePicker ? (
                    <TouchableOpacity 
                        onPress={onPress} 
                        activeOpacity={0.7} 
                        style={[
                            styles.inputContainer,
                            { borderColor: showPicker ? Colors.datePickerBorderHighlight : Colors.inputBorder }
                        ]}
                        disabled={!onPress || finalIsReadOnly}
                    >
                        <Feather name={icon} size={20} color={finalIsReadOnly ? Colors.churchGrayText : Colors.churchGreenPrimary} style={styles.inputIcon} />
                        <Text style={[
                            styles.datePickerText,
                            { color: isFilled ? Colors.datePickerText : Colors.datePickerPlaceholder }
                        ]}>
                            {displayValue || placeholder}
                        </Text>
                        {showPicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={value || new Date()}
                                mode={mode}
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={minDate}
                            />
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.inputContainer, { backgroundColor: finalIsReadOnly ? Colors.inputBg : Colors.pureWhite }]}>
                        <Feather name={icon} size={20} color={finalIsReadOnly ? Colors.churchGrayText : Colors.churchGreenPrimary} style={styles.inputIcon} />
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput, { color: Colors.churchGreenDarkText, opacity: finalIsReadOnly ? 0.7 : 1 }]}
                            placeholder={placeholder}
                            placeholderTextColor={Colors.churchGrayText}
                            value={value}
                            onChangeText={onChangeText}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            maxLength={maxLength}
                            editable={!finalIsReadOnly}
                        />
                    </View>
                )}
            </View>
        );
    };

    const renderSection = (title, iconName, content) => (
        <View style={[styles.sectionCard, { backgroundColor: Colors.pureWhite }]}>
            <View style={styles.sectionHeader}>
                <Feather name={iconName} size={22} color={Colors.churchGreenPrimary} style={styles.sectionIcon} />
                <Text style={[styles.sectionTitle, { color: Colors.churchGreenDarkText }]}>{title}</Text>
            </View>
            {content}
        </View>
    );

    // Function para mag-save ng contact sa AsyncStorage
    const saveContact = async (contact) => {
        try {
            await AsyncStorage.setItem(CONTACT_STORAGE_KEY, contact);
            console.log('Contact saved to storage:', contact);
        } catch (e) {
            console.error('Failed to save contact:', e);
        }
    };

    // Function para mag-load ng contact mula sa AsyncStorage
    const loadContactAndFetch = async () => {
        try {
            const storedContact = await AsyncStorage.getItem(CONTACT_STORAGE_KEY);
            if (storedContact !== null) {
                setUserContact(storedContact);
                setForm(prev => ({ ...prev, contactNo: storedContact }));
                console.log('Contact loaded from storage:', storedContact);
                await fetchExisting(storedContact);
            } else {
                setLoadingExisting(false);
                setContactInputReady(true);
            }
        } catch (e) {
            console.error('Failed to load contact or fetch schedule:', e);
            setLoadingExisting(false);
            setContactInputReady(true);
        }
    };

    // Updated fetchExisting function
    const fetchExisting = async (contact) => {
        if (!contact) {
            setLoadingExisting(false);
            setHasScheduled(false);
            return;
        }

        // I-set up ang endpoint para mag-filter by contact number
        const endpoint = `${API_URL}?contact=${contact}`;

        try {
            const res = await fetch(endpoint);
            const data = await res.json();

            // I-check kung array ang naibalik at kung may laman
            if (Array.isArray(data) && data.length > 0) {
                // Kunin ang latest entry na may 'Pending' o 'Confirmed' status
                const activeSchedule = data
                    .filter(item =>
                        item.status &&
                        (item.status.toLowerCase() === 'pending' || item.status.toLowerCase() === 'confirmed')
                    )
                    .sort((a, b) => {
                        // Pag-uuri base sa petsa ng paggawa o ID, kukunin ang pinakabago
                        const dateA = new Date(a.createdAt || a._id?.$oid || 0);
                        const dateB = new Date(b.createdAt || b._id?.$oid || 0);
                        return dateB - dateA;
                    })[0];

                if (activeSchedule) {
                    setHasScheduled(true);
                    setScheduledData(activeSchedule);
                    setShowCalendarOverlay(false);
                    setIsContactEditable(false); // Gawing Read-Only ang contact kapag may schedule
                } else {
                    setHasScheduled(false);
                    setIsContactEditable(true);
                }
            } else {
                setHasScheduled(false);
                setIsContactEditable(true);
            }
        } catch (err) {
            console.error('Error fetching existing schedule:', err);
        } finally {
            setLoadingExisting(false);
            setContactInputReady(true);
        }
    };

    // Initial load ng contact at schedule
    useEffect(() => {
        loadContactAndFetch();
    }, []);
    
    // I-re-fetch ang schedule kapag nagbago ang contact number sa form (at hindi pa nagsu-submit)
    useEffect(() => {
        // Gawin lang ito kapag ready na ang input at hindi pa loading
        if (form.contactNo && contactInputReady && !loadingExisting) {
            // Gumawa ng delay para hindi mag-trigger sa bawat keystroke
            const timeout = setTimeout(() => {
                // I-check kung ang contact ay iba sa currently loaded na userContact
                if (form.contactNo !== userContact) {
                    // I-set ang userContact sa form.contactNo para ma-trigger ang fetchExisting
                    setUserContact(form.contactNo); 
                    fetchExisting(form.contactNo);
                }
            }, 1000); // 1-second debounce
            return () => clearTimeout(timeout);
        }
    }, [form.contactNo, contactInputReady, loadingExisting]);


    const handleChange = (field, value) => {
        if (typeof value === 'string' && (
            field.toLowerCase().includes('name') ||
            field.toLowerCase().includes('place') ||
            field.toLowerCase().includes('address')
        )) {
            // Automatic Capitalization for names/places
            value = value.replace(/\b\w/g, char => char.toUpperCase());
        }
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event, selectedDate, field) => {
        if (Platform.OS === 'android') {
            if (field === 'birthDate') setShowBirthDatePicker(false);
            if (field === 'baptismTime') setShowBapTimePicker(false);
        }
        if (!selectedDate) return;
        handleChange(field, selectedDate);
    };

    const handleInitialBaptismDateSelection = (day) => {
        handleChange('baptismDate', new Date(day.dateString));
    };

    const confirmInitialDate = () => {
        if (form.baptismDate) setShowCalendarOverlay(false);
        else Alert.alert('Select Date', 'Please select a Baptismal Date before proceeding.');
    };

    const requiredFields = {
        baptizedName: 'Pangalan ng Bibinyagan', birthDate: 'Kailan Ipinanganak',
        birthPlace: 'Lugar ng Kapanganakan (Bibinyagan)', fatherName: 'Pangalan ng Ama',
        motherName: 'Pangalan ng Ina', maritalStatus: 'Kasal sa (Marital Status)',
        currentAddress: 'Kasalukuyang Tirahan', godfatherName: 'Pangalan ng Ninong',
        godmotherName: 'Pangalan ng Ninang', baptismDate: 'Petsa ng Binyag',
        baptismTime: 'Oras ng Binyag', contactNo: 'Contact Number',
    };

    const handleSubmit = () => {
        for (const field in requiredFields) {
            const val = form[field];
            if (!val || (typeof val === 'string' && !val.trim())) {
                Alert.alert('Missing Information', `Please fill in the '${requiredFields[field]}' field.`);
                return;
            }
        }
        setShowModal(true);
    };

    // I-update ang userContact at i-save sa AsyncStorage pagkatapos mag-submit
    const confirmSubmit = async () => {
        setIsSubmitting(true);

        const submittedContact = form.contactNo;

        const req = {
            name: form.baptizedName, birthDate: form.birthDate ? formatDateAPI(form.birthDate) : '',
            birthPlace: form.birthPlace, fatherName: form.fatherName, fatherBirthPlace: form.fatherBirthPlace,
            motherName: form.motherName, motherBirthPlace: form.motherBirthPlace, marriage: form.maritalStatus,
            address: form.currentAddress, godfather: form.godfatherName, godfatherAddress: form.godfatherAddress,
            godmother: form.godmotherName, godmotherAddress: form.godmotherAddress,
            baptismDate: form.baptismDate ? formatDateAPI(form.baptismDate) : '',
            baptismTime: form.baptismTime ? formatTimeAPI(form.baptismTime) : '',
            contact: submittedContact, sacrament: 'Baptism', status: 'Pending',
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req),
            });

            if (!response.ok) throw new Error('Failed to submit request');
            const newSched = await response.json();

            // I-save ang contact number at i-update ang state
            await saveContact(submittedContact);
            setUserContact(submittedContact);
            setScheduledData(newSched);

            setShowModal(false);
            setShowSuccess(true);
            setHasScheduled(true);
            setIsContactEditable(false); // Gawing Read-Only ulit ang contact

        } catch (err) {
            console.error('Submit error:', err);
            Alert.alert('Submission Failed', 'An error occurred. Please try again or check the API URL.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function para i-clear ang schedule at payagan ang user na mag-input ng bagong contact
    const handleEditContact = () => {
        Alert.alert(
            'Change Contact Number',
            'Are you sure you want to view a different schedule? You can enter a new contact number to check its schedule.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Change',
                    onPress: () => {
                        // I-set ang contact field sa form na editable at i-clear ang scheduled data
                        setIsContactEditable(true);
                        setHasScheduled(false);
                        setScheduledData(null);
                        setShowCalendarOverlay(true); // Ibalik sa pagpili ng date
                        // I-set sa huling contact na ginamit para hindi blanko ang field
                        setForm(prev => ({ ...prev, contactNo: userContact })); 
                    },
                },
            ]
        );
    };

    if (loadingExisting) {
        return (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.churchGreenPrimary} />
                <Text style={styles.loadingText}>Checking existing schedule...</Text>
            </View>
        );
    }

    // --- SCHEDULED DATA VIEW (Kapag may schedule na) ---
    if (hasScheduled && scheduledData) {

        const bapDate = getDateValue(scheduledData.baptismDate);
        const birthDate = getDateValue(scheduledData.birthDate);
        const currentStatus = scheduledData.status || 'Pending';

        return (
            <View style={[styles.container, { backgroundColor: Colors.churchGreenLightBg }]}>
                <View style={[styles.header, { backgroundColor: Colors.headerBg }]}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={24} color={Colors.headerText} />
                    </TouchableOpacity>
                    <Text style={[styles.headerMemorandumTitle, { color: Colors.headerText, marginTop: Platform.OS === 'android' ? 36 : 18 }]}>MY BAPTISMAL SCHEDULE</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={[styles.scheduledCard, {
                        borderColor: currentStatus.toLowerCase() === 'confirmed' ? Colors.churchGreenPrimary : (currentStatus.toLowerCase() === 'pending' ? '#FFC107' : Colors.redError),
                        backgroundColor: Colors.pureWhite
                    }]}>

                        {/* Image ng simbahan (church6.png) - Assumed to be in the assets folder */}
                        <Image
                            source={require('../assets/church6.png')}
                            style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 20, resizeMode: 'cover' }}
                        />

                        <View style={[styles.statusBadge, {
                            backgroundColor: currentStatus.toLowerCase() === 'confirmed' ? Colors.churchGreenPrimary : (currentStatus.toLowerCase() === 'pending' ? '#FFC107' : Colors.redError)
                        }]}>
                            <Text style={styles.statusText}>{currentStatus.toUpperCase()}</Text>
                        </View>

                        <Text style={[styles.scheduledTitle, { color: Colors.churchGreenDarkText }]}>
                            Request ID: {scheduledData._id?.$oid || scheduledData._id || 'N/A'}
                        </Text>
                        <Text style={[styles.scheduledSubTitle, { color: Colors.churchGrayText }]}>
                            Please wait for the Parish Office's Confirmation.
                        </Text>

                        {/* Button para palitan ang contact at mag-view ng ibang schedule */}
                        <TouchableOpacity 
                            onPress={handleEditContact}
                            style={[styles.editButton, { backgroundColor: Colors.editButton }]}
                            activeOpacity={0.7}
                        >
                            <Feather name="edit" size={16} color={Colors.pureWhite} style={{ marginRight: 5 }} />
                            <Text style={[styles.submitButtonText, { color: Colors.pureWhite }]}>Check Another Contact</Text>
                        </TouchableOpacity>

                        <View style={styles.scheduledDetails}>
                            <DetailRow label="Sacrament" value={scheduledData.sacrament || 'Baptism'} />
                            <DetailRow label="Date of Baptism" value={bapDate ? fmtDate(bapDate) : 'N/A'} />
                            <DetailRow label="Time of Baptism" value={scheduledData.baptismTime || 'N/A'} />

                            <View style={styles.separator} />

                            <DetailRow label="Name of Baptized" value={scheduledData.name || 'N/A'} />
                            <DetailRow label="Birth Date" value={birthDate ? fmtDate(birthDate) : 'N/A'} />
                            <DetailRow label="Birth Place" value={scheduledData.birthPlace || 'N/A'} />
                            <DetailRow label="Father's Name" value={scheduledData.fatherName || 'N/A'} />
                            <DetailRow label="Mother's Name" value={scheduledData.motherName || 'N/A'} />
                            <DetailRow label="Marital Status" value={scheduledData.marriage || 'N/A'} />
                            <DetailRow label="Current Address" value={scheduledData.address || 'N/A'} />
                            <DetailRow label="Contact Number" value={scheduledData.contact || 'N/A'} />
                            <DetailRow label="Godfather's Name" value={scheduledData.godfather || 'N/A'} />
                            <DetailRow label="Godfather's Address" value={scheduledData.godfatherAddress || 'N/A'} />
                            <DetailRow label="Godmother's Name" value={scheduledData.godmother || 'N/A'} />
                            <DetailRow label="Godmother's Address" value={scheduledData.godmotherAddress || 'N/A'} />
                        </View>

                        <View style={styles.noteSection}>
                            <Feather name="info" size={16} color={Colors.churchGrayText} />
                            <Text style={styles.noteTextSchedule}>
                                {currentStatus.toLowerCase() === 'pending'
                                    ? 'Your request is currently under review by the parish office. Check back later for updates.'
                                    : currentStatus.toLowerCase() === 'confirmed'
                                        ? 'Your schedule is confirmed! Please bring required documents on the day.'
                                        : 'There was an issue with your request. Contact the parish office.'}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
    // --- END OF SCHEDULED DATA VIEW ---


    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: Colors.churchGreenLightBg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.header, { backgroundColor: Colors.headerBg }]}>
                        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton} activeOpacity={0.7}>
                            <Feather name="arrow-left" size={24} color={Colors.headerText} />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <Image source={require('../assets/LOGO.png')} style={styles.headerSmallLogo} />
                            <View style={styles.headerTextContainer}>
                                <Text style={[styles.headerSmallText, { color: Colors.headerText }]}>Diocese of Antipolo</Text>
                                <Text style={[styles.headerParishName, { color: Colors.headerText }]}>San Jose Manggagawa Parish</Text>
                                <Text style={[styles.headerAddress, { color: Colors.churchGrayText }]}>
                                    E. Rodriguez Highway, Cor. E. Manuel St.,{'\n'}Brgy. San Jose, Rodriguez, Rizal
                                </Text>
                                <Text style={[styles.headerContact, { color: Colors.churchGrayText }]}>Cellphone#: 0967-431-6482</Text>
                            </View>
                            <Image source={require('../assets/Diocese.png')} style={styles.headerSmallLogo} />
                        </View>
                        <Text style={[styles.headerMemorandumTitle, { color: Colors.headerText }]}>BAPTISMAL REGISTRATION</Text>
                    </View>

                    {showCalendarOverlay ? (
                        <View style={[styles.calendarOverlay, {
                            backgroundColor: Colors.pureWhite,
                            borderRadius: 12, borderWidth: 1, borderColor: Colors.inputBorder,
                            shadowColor: Colors.shadowColor, shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.2, shadowRadius: 10, elevation: 8, padding: 20,
                            marginHorizontal: 20, justifyContent: 'flex-start', alignItems: 'stretch',
                        }]}>
                            <Text style={[styles.calendarOverlayTitle, { color: Colors.churchGreenDarkText }]}>Select Baptismal Date</Text>
                            <Calendar
                                minDate={new Date().toISOString().split('T')[0]}
                                onDayPress={handleInitialBaptismDateSelection}
                                markedDates={{
                                    [form.baptismDate ? form.baptismDate.toISOString().split('T')[0] : '']: {
                                        selected: true, selectedColor: Colors.churchGreenPrimary,
                                        dotColor: Colors.pureWhite, textColor: Colors.pureWhite
                                    },
                                }}
                                style={{ width: '100%' }}
                                theme={{
                                    todayTextColor: Colors.churchGreenPrimary,
                                    arrowColor: Colors.churchGreenDarkText,
                                    monthTextColor: Colors.churchGreenDarkText,
                                    textDayFontWeight: '500', textMonthFontWeight: 'bold',
                                    textDayHeaderFontWeight: '700', textDayFontSize: 16,
                                    textMonthFontSize: 18, textDayHeaderFontSize: 14,
                                    calendarBackground: Colors.pureWhite,
                                    'stylesheet.calendar.header': {
                                        week: {
                                            marginTop: 5, flexDirection: 'row', justifyContent: 'space-around',
                                            backgroundColor: Colors.churchGreenLightBg, borderRadius: 8, paddingVertical: 5,
                                        },
                                        dayHeader: { color: Colors.churchGreenDarkText },
                                    },
                                }}
                            />
                            {form.baptismDate && (
                                <View style={[styles.datePickerButton, {
                                    marginTop: 25,
                                    backgroundColor: Colors.churchGreenLightBg,
                                    borderColor: Colors.churchGreenPrimary, borderWidth: 2,
                                    shadowOpacity: 0, elevation: 0, width: '100%',
                                }]}>
                                    <Feather name="check-circle" size={20} color={Colors.churchGreenDarkText} style={styles.inputIcon} />
                                    <Text style={[styles.datePickerText, { color: Colors.churchGreenDarkText, fontWeight: 'bold' }]}>
                                        {fmtDate(form.baptismDate)}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={confirmInitialDate}
                                style={[styles.confirmDateButton, { backgroundColor: Colors.churchGreenPrimary }]}
                                disabled={!form.baptismDate}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.submitButtonText, { color: Colors.pureWhite }]}>Confirm Date & Proceed</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (

                        <ScrollView contentContainerStyle={styles.scrollViewContent}>
                            {/* Personal Information */}
                            {renderSection('Personal Information', 'user', <>
                                {renderFormInput({
                                    label: 'Pangalan ng Bibinyagan',
                                    placeholder: 'First, Middle, Last',
                                    value: form.baptizedName,
                                    onChangeText: v => handleChange('baptizedName', v),
                                    icon: 'user',
                                    inputRef: refs.baptizedName
                                })}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Kailan Ipinanganak',
                                            placeholder: 'Select Date',
                                            value: form.birthDate,
                                            icon: 'calendar',
                                            isDatePicker: true,
                                            onPress: () => setShowBirthDatePicker(true),
                                            showPicker: showBirthDatePicker,
                                            onDateChange: (e, d) => handleDateChange(e, d, 'birthDate'),
                                            minDate: undefined
                                        })}
                                    </View>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Place of Birth',
                                            placeholder: 'Place of Birth',
                                            value: form.birthPlace,
                                            onChangeText: v => handleChange('birthPlace', v),
                                            icon: 'map-pin',
                                            inputRef: refs.birthPlace
                                        })}
                                    </View>
                                </View>
                            </>)}

                            {/* Parents Information */}
                            {renderSection('Parents Information', 'users', <>
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Pangalan ng Ama',
                                            placeholder: 'Father\'s Name',
                                            value: form.fatherName,
                                            onChangeText: v => handleChange('fatherName', v),
                                            icon: 'user',
                                            inputRef: refs.fatherName
                                        })}
                                    </View>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Place of Birth (Ama)',
                                            placeholder: 'Father\'s Birthplace',
                                            value: form.fatherBirthPlace,
                                            onChangeText: v => handleChange('fatherBirthPlace', v),
                                            icon: 'map-pin',
                                            inputRef: refs.fatherBirthPlace,
                                            isRequired: false
                                        })}
                                    </View>
                                </View>
                                {renderFormInput({
                                    label: 'Pangalan ng Ina',
                                    placeholder: 'Mother\'s Full Name',
                                    value: form.motherName,
                                    onChangeText: v => handleChange('motherName', v),
                                    icon: 'user',
                                    inputRef: refs.motherName,
                                    note: 'Maaaring ilagay ang apelyido noong dalaga.'
                                })}
                                {renderFormInput({
                                    label: 'Lugar ng Kapanganakan (Ina)',
                                    placeholder: 'Mother\'s Birthplace',
                                    value: form.motherBirthPlace,
                                    onChangeText: v => handleChange('motherBirthPlace', v),
                                    icon: 'map-pin',
                                    inputRef: refs.motherBirthPlace,
                                    isRequired: false
                                })}

                                <Text style={[styles.inputLabel, { color: Colors.churchGreenDarkText }]}>
                                    Kasal sa (Marital Status)<Text style={{ color: Colors.redError }}> *</Text>
                                </Text>
                                <View style={styles.maritalStatusContainer}>
                                    {maritalStatusOptions.map((option) => (
                                        <TouchableOpacity key={option.value} style={styles.checkboxContainer} onPress={() => handleChange('maritalStatus', option.value)} activeOpacity={0.7}>
                                            <Feather name={form.maritalStatus === option.value ? 'check-square' : 'square'} size={18} color={form.maritalStatus === option.value ? Colors.churchGreenPrimary : Colors.churchGrayText} />
                                            <Text style={[styles.checkboxLabel, { color: Colors.churchGreenDarkText }]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>)}

                            {/* Current Address */}
                            {renderSection('Current Address', 'home', <>
                                {renderFormInput({
                                    label: 'Kasalukuyang Tirahan',
                                    placeholder: 'Current Address',
                                    value: form.currentAddress,
                                    onChangeText: v => handleChange('currentAddress', v),
                                    icon: 'map',
                                    inputRef: refs.currentAddress
                                })}
                            </>)}

                            {/* Godparents Information */}
                            {renderSection('Godparents Information', 'heart', <>
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Pangalan ng Ninong',
                                            placeholder: 'Godfather\'s Name',
                                            value: form.godfatherName,
                                            onChangeText: v => handleChange('godfatherName', v),
                                            icon: 'user',
                                            inputRef: refs.godfatherName
                                        })}
                                    </View>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Address (Ninong)',
                                            placeholder: 'Godfather\'s Address',
                                            value: form.godfatherAddress,
                                            onChangeText: v => handleChange('godfatherAddress', v),
                                            icon: 'map-pin',
                                            inputRef: refs.godfatherAddress
                                        })}
                                    </View>
                                </View>
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Pangalan ng Ninang',
                                            placeholder: 'Godmother\'s Name',
                                            value: form.godmotherName,
                                            onChangeText: v => handleChange('godmotherName', v),
                                            icon: 'user',
                                            inputRef: refs.godmotherName
                                        })}
                                    </View>
                                    <View style={styles.halfWidth}>
                                        {renderFormInput({
                                            label: 'Address (Ninang)',
                                            placeholder: 'Godmother\'s Address',
                                            value: form.godmotherAddress,
                                            onChangeText: v => handleChange('godmotherAddress', v),
                                            icon: 'map-pin',
                                            inputRef: refs.godmotherAddress
                                        })}
                                    </View>
                                </View>
                            </>)}

                            {/* Schedule and Contact Section */}
                            {renderSection('Schedule & Contact', 'phone', <>
                                {renderFormInput({
                                    label: 'Petsa ng Binyag (Selected)',
                                    placeholder: 'Date',
                                    value: form.baptismDate,
                                    icon: 'calendar',
                                    isDatePicker: true,
                                    onPress: () => setShowCalendarOverlay(true),
                                    isRequired: true,
                                    isReadOnly: true
                                })}
                                {renderFormInput({
                                    label: 'Oras ng Binyag',
                                    placeholder: 'Select Time',
                                    value: form.baptismTime,
                                    icon: 'clock',
                                    isDatePicker: true,
                                    mode: 'time',
                                    onPress: () => setShowBapTimePicker(true),
                                    showPicker: showBapTimePicker,
                                    onDateChange: (e, d) => handleDateChange(e, d, 'baptismTime'),
                                    isRequired: true,
                                })}
                                {renderFormInput({
                                    label: 'Contact Number',
                                    placeholder: '09xxxxxxxxx',
                                    value: form.contactNo,
                                    onChangeText: v => handleChange('contactNo', v),
                                    icon: 'phone',
                                    keyboardType: 'number-pad',
                                    autoCapitalize: 'none',
                                    maxLength: 11,
                                    inputRef: refs.contactNo,
                                    isReadOnly: false // Pinapayagan ang pag-edit sa form
                                })}
                            </>)}

                            <TouchableOpacity
                                onPress={handleSubmit}
                                style={[styles.submitButton, { backgroundColor: Colors.churchGreenPrimary }]}
                                disabled={isSubmitting}
                                activeOpacity={0.7}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={Colors.pureWhite} />
                                ) : (
                                    <Text style={[styles.submitButtonText, { color: Colors.pureWhite }]}>Submit Baptismal Request</Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 50 }} />
                        </ScrollView>
                    )}

                    {/* Modals (Confirmation, Success - Retained) */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => {
                            setShowModal(!showModal);
                        }}
                    >
                        {/* Confirmation Modal Content */}
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite }]}>
                                <Text style={[styles.modalTitle, { color: Colors.churchGreenDarkText }]}>Confirm Submission</Text>
                                <Text style={[styles.modalSubTitle, { color: Colors.churchGrayText }]}>Please review the details before submitting:</Text>

                                <ScrollView style={styles.modalDetailsScrollView}>
                                    <DetailRow label="Name of Baptized" value={form.baptizedName} />
                                    <DetailRow label="Birth Date" value={fmtDate(form.birthDate)} />
                                    <DetailRow label="Place of Birth" value={form.birthPlace} />
                                    <DetailRow label="Father's Name" value={form.fatherName} />
                                    <DetailRow label="Mother's Name" value={form.motherName} />
                                    <DetailRow label="Marital Status" value={form.maritalStatus} />
                                    <DetailRow label="Current Address" value={form.currentAddress} />
                                    <View style={styles.separator} />
                                    <DetailRow label="Godfather's Name" value={form.godfatherName} />
                                    <DetailRow label="Godmother's Name" value={form.godmotherName} />
                                    <View style={styles.separator} />
                                    <DetailRow label="Baptism Date" value={fmtDate(form.baptismDate)} />
                                    <DetailRow label="Baptism Time" value={fmtTime(form.baptismTime)} />
                                    <DetailRow label="Contact Number" value={form.contactNo} />
                                </ScrollView>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity
                                        onPress={() => setShowModal(false)}
                                        style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: Colors.cancelButton }]}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={[styles.modalButtonText, { color: Colors.cancelButtonText }]}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmSubmit}
                                        style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary }]}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color={Colors.pureWhite} />
                                        ) : (
                                            <Text style={[styles.modalButtonText, { color: Colors.pureWhite }]}>Confirm & Submit</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showSuccess}
                        onRequestClose={() => {
                            setShowSuccess(false);
                        }}
                    >
                        {/* Success Modal Content */}
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite }]}>
                                <Feather name="check-circle" size={60} color={Colors.churchGreenPrimary} style={{ marginBottom: 15 }} />
                                <Text style={[styles.modalTitle, { color: Colors.churchGreenDarkText }]}>Success!</Text>
                                <Text style={[styles.modalSubTitle, { color: Colors.churchGrayText, textAlign: 'center' }]}>
                                    Your Baptismal Request has been submitted successfully!{'\n'}You may now view your schedule status.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSuccess(false);
                                        // Awtomatikong ipapakita ang schedule dahil sa hasScheduled state
                                    }}
                                    style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary, width: '100%', marginTop: 20 }]}
                                >
                                    <Text style={[styles.modalButtonText, { color: Colors.pureWhite }]}>View Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

// Full Stylesheet para hindi mag-error
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        width: '100%',
        paddingTop: Platform.OS === 'android' ? 30 : 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBorder,
        marginBottom: 10,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 30 : 50,
        left: 15,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 25,
    },
    headerSmallLogo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    headerTextContainer: {
        flex: 1,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    headerSmallText: {
        fontSize: 10,
        fontWeight: '500',
    },
    headerParishName: {
        fontSize: 16,
        fontWeight: '900',
        textAlign: 'center',
    },
    headerAddress: {
        fontSize: 8,
        textAlign: 'center',
    },
    headerContact: {
        fontSize: 8,
        fontWeight: '500',
        marginTop: 2,
    },
    headerMemorandumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
        paddingBottom: 5,
        borderBottomWidth: 2,
        borderBottomColor: Colors.churchGreenPrimary,
        marginHorizontal: 20,
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        paddingBottom: 50,
    },
    sectionCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: Colors.churchGreenPrimary,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBorder,
    },
    sectionIcon: {
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputWrapper: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    noteText: {
        fontSize: 11,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pureWhite,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        paddingHorizontal: 10,
        height: 50,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    },
    datePickerText: {
        flex: 1,
        fontSize: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    halfWidth: {
        width: '48%',
    },
    maritalStatusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
        marginBottom: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
    },
    submitButton: {
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: Colors.churchGreenPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.churchGreenLightBg,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.churchGreenDarkText,
    },
    calendarOverlay: {
        flex: 1,
        marginVertical: 20,
        alignItems: 'center',
    },
    calendarOverlayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    confirmDateButton: {
        width: '100%',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: Colors.churchGreenPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.modalBg,
    },
    modalContent: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalSubTitle: {
        fontSize: 14,
        marginBottom: 15,
    },
    modalDetailsScrollView: {
        width: '100%',
        maxHeight: height * 0.45,
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 8,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBg,
    },
    modalDetailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.churchGrayText,
        width: '45%',
    },
    modalDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.churchGreenDarkText,
        width: '55%',
        textAlign: 'right',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.inputBorder,
        marginVertical: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalCancelButton: {
        borderWidth: 1,
        borderColor: Colors.churchGrayText,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Scheduled View Styles
    scheduledCard: {
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 3,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },
    statusBadge: {
        position: 'absolute',
        top: 30,
        right: 30,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        zIndex: 10,
    },
    statusText: {
        color: Colors.pureWhite,
        fontWeight: 'bold',
        fontSize: 14,
    },
    scheduledTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    scheduledSubTitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    scheduledDetails: {
        marginTop: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 8,
        backgroundColor: Colors.inputBg,
    },
    noteSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 20,
        padding: 10,
        backgroundColor: Colors.churchGreenLightBg,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: Colors.churchGreenPrimary,
    },
    noteTextSchedule: {
        fontSize: 12,
        color: Colors.churchGrayText,
        marginLeft: 10,
        flexShrink: 1,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        marginBottom: 20,
        shadowColor: Colors.editButton,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    }
});
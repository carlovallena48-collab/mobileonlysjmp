import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
    Image, Platform, Alert, Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import SignatureCanvas from 'react-native-signature-canvas';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

// Consolidated Colors (C)
const C = {
    primary: '#388E3C', lightBg: '#E8F5E9', darkText: '#1B5E20',
    grayText: '#616161', white: '#FFFFFF', black: '#000000',
    inputBg: '#FAFAFA', inputBorder: '#E0E0E0', shadow: '#000',
    redError: '#D32F2F', headerBg: '#FFFFFF', headerText: '#212121',
    modalBg: 'rgba(0,0,0,0.6)', cancelBtn: '#F0F0F0', cancelBtnTxt: '#424242',
    successGreen: '#4CAF50', warningOrange: '#FF9800',
};

const API_BASE_URL = 'http://mobileonlysjmp.onrender.com'; // Your server IP

// Main MarriageForm Component
export default function MarriageForm({ navigation, route }) {
    const { userEmail } = route.params || {}; // Get user email from navigation
    
    const groomSignatureRef = useRef(null);
    const brideSignatureRef = useRef(null);
    const [step, setStep] = useState(1);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [form, setForm] = useState({
        dateOfWedding: '', timeOfWedding: '', reservationFee: '', balance: '',
        groomName: '', groomMiddleName: '', groomSurname: '', groomDOB: '', groomAge: '', groomPOB: '', groomResidence: '', groomFatherName: '', groomMotherMaidenName: '',
        groomMarriageLicense: '', groomBaptismalCert: '', groomConfirmationCert: '', groomMarriageBannsPermission: '',
        brideName: '', brideMiddleName: '', brideSurname: '', brideDOB: '', brideAge: '', bridePOB: '', brideResidence: '', brideFatherName: '', brideMotherMaidenName: '',
        brideMarriageLicense: '', brideBaptismalCert: '', brideConfirmationCert: '', brideMarriageBannsPermission: '',
        interviewDate: '', interviewTime: '', seminarDate: '', seminarTime: '',
        sponsors: Array(20).fill(''),
        notes: '',
        groomSignature: null, brideSignature: null,
        dateOfApplication: new Date().toLocaleDateString(), groomCP: '', brideCP: '',
        submittedByEmail: '', // Will be set dynamically
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [activeSigner, setActiveSigner] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [pickerField, setPickerField] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState({
        status: null,
        message: '',
    });
    const [dateAvailability, setDateAvailability] = useState({
        checking: false,
        available: null,
        message: ''
    });
    const [bookedDates, setBookedDates] = useState([]);

  // Get user email from AsyncStorage on component mount
useEffect(() => {
    const getUserEmail = async () => {
        try {
            console.log('🔍 DEBUG - Starting to get user email...');
            
            // Try ALL possible storage keys that might contain user data
            const keys = await AsyncStorage.getAllKeys();
            console.log('🔍 DEBUG - All AsyncStorage keys:', keys);
            
            // Get all stored data
            const allData = await AsyncStorage.multiGet(keys);
            console.log('🔍 DEBUG - All AsyncStorage data:');
            allData.forEach(([key, value]) => {
                console.log(`  ${key}:`, value);
            });

            let email = '';

            // Priority: route params -> userData -> user -> userEmail -> userInfo
            if (userEmail) {
                email = userEmail;
                console.log('🔍 DEBUG - Using email from route params:', email);
            } else {
                // Try to find email in any of the stored data
                for (const [key, value] of allData) {
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            if (parsed.email) {
                                email = parsed.email;
                                console.log('🔍 DEBUG - Found email in', key, ':', email);
                                break;
                            }
                        } catch (e) {
                            // If it's not JSON, check if it's directly an email
                            if (key.toLowerCase().includes('email') && value.includes('@')) {
                                email = value;
                                console.log('🔍 DEBUG - Found email in', key, ':', email);
                                break;
                            }
                        }
                    }
                }
            }

            console.log('🔍 DEBUG - Final email found:', email);
            
            if (email) {
                setCurrentUserEmail(email);
                setForm(prev => ({ ...prev, submittedByEmail: email }));
                console.log('✅ DEBUG - Email set in form:', email);
            } else {
                console.warn('❌ DEBUG - No user email found! Showing manual input.');
                // Don't show alert, just let the manual input appear
            }
        } catch (error) {
            console.error('❌ DEBUG - Error getting user email:', error);
        }
    };

    getUserEmail();
}, [userEmail, navigation]);
    // Fetch booked dates on component mount
    useEffect(() => {
        fetchBookedDates();
    }, []);

    // Check date availability when date changes
    useEffect(() => {
        if (form.dateOfWedding) {
            checkDateAvailability(form.dateOfWedding, form.timeOfWedding);
        }
    }, [form.dateOfWedding, form.timeOfWedding]);

    const fetchBookedDates = async () => {
        try {
            console.log('🔍 DEBUG - Fetching booked dates...');
            const response = await fetch(`${API_BASE_URL}/api/booked-wedding-dates`);
            if (response.ok) {
                const dates = await response.json();
                setBookedDates(dates);
                console.log('✅ DEBUG - Booked dates fetched:', dates.length);
            } else {
                console.error('❌ DEBUG - Failed to fetch booked dates');
            }
        } catch (error) {
            console.error('❌ DEBUG - Error fetching booked dates:', error);
        }
    };

    const checkDateAvailability = async (date, time) => {
        if (!date) return;
        
        setDateAvailability({ checking: true, available: null, message: '' });
        
        try {
            console.log('🔍 DEBUG - Checking date availability:', date, time);
            const response = await fetch(
                `${API_BASE_URL}/api/check-wedding-availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time || '')}`
            );
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ DEBUG - Availability result:', result);
                setDateAvailability({
                    checking: false,
                    available: result.available,
                    message: result.available 
                        ? 'This date is available!' 
                        : `Date already booked for ${result.existingBooking?.groomName} & ${result.existingBooking?.brideName}`
                });
            } else {
                console.error('❌ DEBUG - Availability check failed');
                setDateAvailability({
                    checking: false,
                    available: null,
                    message: 'Error checking availability'
                });
            }
        } catch (error) {
            console.error('❌ DEBUG - Error checking availability:', error);
            setDateAvailability({
                checking: false,
                available: null,
                message: 'Network error checking availability'
            });
        }
    };

    const handleChange = useCallback((field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            handleChange(pickerField, formattedDate);
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            handleChange(pickerField, selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    };

    const handleSignatureSave = () => {
        if (activeSigner === 'groom' && groomSignatureRef.current) {
            groomSignatureRef.current.readSignature();
        } else if (activeSigner === 'bride' && brideSignatureRef.current) {
            brideSignatureRef.current.readSignature();
        }
    };

    const handleSignatureOK = signature => {
        if (activeSigner === 'groom') {
            handleChange('groomSignature', signature);
        } else if (activeSigner === 'bride') {
            handleChange('brideSignature', signature);
        }
        setShowSignatureModal(false);
    };

    const handleClearSignature = () => {
        if (activeSigner === 'groom' && groomSignatureRef.current) {
            groomSignatureRef.current.clearSignature();
            handleChange('groomSignature', null);
        } else if (activeSigner === 'bride' && brideSignatureRef.current) {
            brideSignatureRef.current.clearSignature();
            handleChange('brideSignature', null);
        }
    };

    const validateAndNext = () => {
        let requiredFields = {};
        if (step === 1) {
            requiredFields = { 
                dateOfWedding: 'Wedding Date', 
                timeOfWedding: 'Wedding Time', 
                reservationFee: 'Reservation Fee' 
            };
            
            // Check date availability before proceeding
            if (form.dateOfWedding && dateAvailability.available === false) {
                Alert.alert(
                    'Date Not Available',
                    'The selected wedding date is already booked. Please choose another date.',
                    [{ text: 'OK' }]
                );
                return;
            }
        } else if (step === 2) {
            requiredFields = { 
                groomName: 'Groom\'s Name', 
                groomSurname: 'Groom\'s Surname', 
                groomDOB: 'Groom\'s Date of Birth', 
                groomResidence: 'Groom\'s Residence' 
            };
        } else if (step === 3) {
            requiredFields = { 
                brideName: 'Bride\'s Name', 
                brideSurname: 'Bride\'s Surname', 
                brideDOB: 'Bride\'s Date of Birth', 
                brideResidence: 'Bride\'s Residence' 
            };
        } else if (step === 6) {
            requiredFields = { 
                groomCP: 'Groom\'s Contact Number', 
                brideCP: 'Bride\'s Contact Number' 
            };
        }

        for (const field in requiredFields) {
            if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
                Alert.alert('Missing Info', `Please provide the '${requiredFields[field]}'.`);
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handleSubmit = () => {
        console.log('🔍 DEBUG - Submit clicked:');
        console.log('  - groomCP:', form.groomCP);
        console.log('  - brideCP:', form.brideCP);
        console.log('  - submittedByEmail:', form.submittedByEmail);
        console.log('  - currentUserEmail:', currentUserEmail);

        if (!form.groomCP || !form.brideCP) {
            Alert.alert('Missing Info', 'Please provide both Groom\'s and Bride\'s contact numbers.');
            return;
        }
        
        // Use currentUserEmail as fallback
        const finalEmail = form.submittedByEmail || currentUserEmail;
        
        if (!finalEmail) {
            Alert.alert(
                'Authentication Required', 
                'Please log in to submit the application.',
                [{ text: 'OK' }]
            );
            return;
        }
        
        // Show the review modal before submitting
        setShowModal(true);
    };

    // Updated: Handle the actual submission to your server
    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionStatus({ status: 'loading', message: 'Submitting your application...' });
        
        try {
            // Use currentUserEmail as fallback if submittedByEmail is empty
            const finalEmail = form.submittedByEmail || currentUserEmail;
            
            if (!finalEmail) {
                throw new Error('No user email available. Please log in again.');
            }

            // Prepare the data for submission
            const submissionData = {
                ...form,
                submittedByEmail: finalEmail
            };

            console.log('🔍 DEBUG - Final submission data:', {
                submittedByEmail: submissionData.submittedByEmail,
                groomName: submissionData.groomName,
                brideName: submissionData.brideName,
                dateOfWedding: submissionData.dateOfWedding
            });

            const response = await fetch(`${API_BASE_URL}/api/marriage_requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();

            console.log('🔍 DEBUG - Server response:', result);

            if (response.ok) {
                setIsSubmitting(false);
                setSubmissionStatus({ 
                    status: 'success', 
                    message: 'Your marriage application has been successfully submitted!' 
                });
                
                setTimeout(() => {
                    setShowModal(false);
                    navigation.goBack();
                }, 2000);
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('❌ DEBUG - Submission failed:', error);
            setIsSubmitting(false);
            setSubmissionStatus({ 
                status: 'error', 
                message: error.message || 'An error occurred. Please try again.' 
            });
            
            if (error.message.includes('already booked')) {
                Alert.alert(
                    'Date Not Available',
                    error.message,
                    [
                        { 
                            text: 'Change Date', 
                            onPress: () => {
                                setSubmissionStatus({ status: null, message: '' });
                                setStep(1);
                            }
                        },
                        { text: 'OK' }
                    ]
                );
            }
        }
    };

    // Function to close the status modal and reset state
    const closeStatusModal = () => {
        setSubmissionStatus({ status: null, message: '' });
        setIsSubmitting(false);
    };

    // Render date availability status
    const renderDateAvailability = () => {
        if (!form.dateOfWedding) return null;

        if (dateAvailability.checking) {
            return (
                <View style={ms.availabilityContainer}>
                    <ActivityIndicator size="small" color={C.primary} />
                    <Text style={[ms.availabilityText, { color: C.grayText }]}>
                        Checking availability...
                    </Text>
                </View>
            );
        }

        if (dateAvailability.available !== null) {
            const isAvailable = dateAvailability.available;
            return (
                <View style={[
                    ms.availabilityContainer, 
                    { backgroundColor: isAvailable ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                    <Feather 
                        name={isAvailable ? "check-circle" : "x-circle"} 
                        size={16} 
                        color={isAvailable ? C.successGreen : C.redError} 
                    />
                    <Text style={[
                        ms.availabilityText, 
                        { color: isAvailable ? C.successGreen : C.redError }
                    ]}>
                        {dateAvailability.message}
                    </Text>
                </View>
            );
        }

        return null;
    };

    // Add manual email input for testing if no email is found
    const renderManualEmailInput = () => {
        if (!form.submittedByEmail && !currentUserEmail) {
            return (
                <View style={ms.inputGroup}>
                    <Text style={[ms.label, { color: C.darkText }]}>Your Email *</Text>
                    <TextInput
                        style={[ms.inputField, { color: C.darkText }]}
                        placeholder="Enter your email address"
                        placeholderTextColor={C.grayText}
                        value={form.submittedByEmail}
                        onChangeText={v => handleChange('submittedByEmail', v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Text style={[ms.subText, { color: C.redError }]}>
                        Email is required to submit the application
                    </Text>
                </View>
            );
        }
        return null;
    };

    const renderHeader = () => (
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
            <Text style={[ms.headerMemorandumTitle, { color: C.headerText }]}>MARRIAGE APPLICATION FORM</Text>
        </View>
    );

    const renderInput = (label, placeholder, value, onChangeText, keyboardType = 'default', icon, autoCapitalize = 'words', multiline = false, isRequired = false, onPress = null) => (
        <View style={ms.inputGroup}>
            <Text style={[ms.label, { color: C.darkText }]}>{label} {isRequired && <Text style={ms.requiredIndicator}>*</Text>}</Text>
            <TouchableOpacity
                onPress={onPress}
                style={[ms.inputContainer, onPress && ms.touchableInput]}
                activeOpacity={onPress ? 0.7 : 1}
            >
                {icon && <Feather name={icon} size={20} color={C.grayText} style={ms.inputIcon} />}
                <TextInput
                    style={[ms.inputField, { color: C.darkText }, multiline && ms.textArea, { paddingLeft: icon ? 40 : 15 }]}
                    placeholder={placeholder}
                    placeholderTextColor={C.grayText}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    editable={!onPress}
                />
            </TouchableOpacity>
        </View>
    );

    const renderSectionCard = (title, children) => (
        <View style={ms.sectionCard}>
            <Text style={[ms.sectionTitleHeader, { color: C.darkText }]}>{title}</Text>
            {children}
        </View>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return renderSectionCard('Step 1 of 6: Marriage Arrangement', <>
                    {/* Manual email input for testing */}
                    {renderManualEmailInput()}
                    
                    <View style={ms.row}>
                        <View style={ms.flexItem}>
                            {renderInput('DATE OF WEDDING', 'e.g. Sept 20, 2025', form.dateOfWedding, v => handleChange('dateOfWedding', v), 'default', 'calendar', 'none', false, true, () => {
                                setPickerField('dateOfWedding');
                                setShowDatePicker(true);
                            })}
                        </View>
                        <View style={ms.flexItem}>
                            {renderInput('TIME', 'e.g. 10:00 AM', form.timeOfWedding, v => handleChange('timeOfWedding', v), 'default', 'clock', 'none', false, true, () => {
                                setPickerField('timeOfWedding');
                                setShowTimePicker(true);
                            })}
                        </View>
                    </View>
                    
                    {/* Date Availability Status */}
                    {renderDateAvailability()}
                    
                    <View style={ms.row}>
                        <View style={ms.flexItem}>
                            {renderInput('RESERVATION FEE', 'e.g. ₱5,000', form.reservationFee, v => handleChange('reservationFee', v), 'numeric', 'dollar-sign', 'none', false, true)}
                        </View>
                        <View style={ms.flexItem}>
                            {renderInput('BALANCE', 'e.g. ₱2,000', form.balance, v => handleChange('balance', v), 'numeric', 'dollar-sign')}
                        </View>
                    </View>
                    
                    {/* Booked Dates Info */}
                    {bookedDates.length > 0 && (
                        <View style={ms.bookedDatesContainer}>
                            <Text style={ms.bookedDatesTitle}>Upcoming Weddings:</Text>
                            {bookedDates.slice(0, 3).map((booking, index) => (
                                <Text key={index} style={ms.bookedDateText}>
                                    {booking.dateOfWedding} - {booking.groomName} & {booking.brideName}
                                </Text>
                            ))}
                            {bookedDates.length > 3 && (
                                <Text style={ms.moreDatesText}>...and {bookedDates.length - 3} more</Text>
                            )}
                        </View>
                    )}
                </>);
            case 2:
                return renderSectionCard('Step 2 of 6: Groom\'s Information', <>
                    {renderInput('NAME', 'First Name', form.groomName, v => handleChange('groomName', v), 'default', 'user', 'words', false, true)}
                    {renderInput('MIDDLE NAME', 'Middle Name', form.groomMiddleName, v => handleChange('groomMiddleName', v))}
                    {renderInput('SURNAME', 'Surname', form.groomSurname, v => handleChange('groomSurname', v), 'default', null, 'words', false, true)}
                    {renderInput('DATE OF BIRTH', 'MM/DD/YYYY', form.groomDOB, v => handleChange('groomDOB', v), 'default', 'calendar', 'none', false, true, () => {
                        setPickerField('groomDOB');
                        setShowDatePicker(true);
                    })}
                    {renderInput('AGE', 'Age', form.groomAge, v => handleChange('groomAge', v), 'numeric', 'info')}
                    {renderInput('PLACE OF BIRTH', 'City/Province', form.groomPOB, v => handleChange('groomPOB', v))}
                    {renderInput('RESIDENCE', 'Complete Address', form.groomResidence, v => handleChange('groomResidence', v), 'default', 'home', 'words', false, true)}
                    {renderInput('FATHER', 'Full Name of Father', form.groomFatherName, v => handleChange('groomFatherName', v), 'default', 'user-plus')}
                    {renderInput('MOTHER (MAIDEN)', 'Mother\'s Maiden Name', form.groomMotherMaidenName, v => handleChange('groomMotherMaidenName', v), 'default', 'user-plus')}
                </>);
            case 3:
                return renderSectionCard('Step 3 of 6: Bride\'s Information', <>
                    {renderInput('NAME', 'First Name', form.brideName, v => handleChange('brideName', v), 'default', 'user', 'words', false, true)}
                    {renderInput('MIDDLE NAME', 'Middle Name', form.brideMiddleName, v => handleChange('brideMiddleName', v))}
                    {renderInput('SURNAME', 'Surname', form.brideSurname, v => handleChange('brideSurname', v), 'default', null, 'words', false, true)}
                    {renderInput('DATE OF BIRTH', 'MM/DD/YYYY', form.brideDOB, v => handleChange('brideDOB', v), 'default', 'calendar', 'none', false, true, () => {
                        setPickerField('brideDOB');
                        setShowDatePicker(true);
                    })}
                    {renderInput('AGE', 'Age', form.brideAge, v => handleChange('brideAge', v), 'numeric', 'info')}
                    {renderInput('PLACE OF BIRTH', 'City/Province', form.bridePOB, v => handleChange('bridePOB', v))}
                    {renderInput('RESIDENCE', 'Complete Address', form.brideResidence, v => handleChange('brideResidence', v), 'default', 'home', 'words', false, true)}
                    {renderInput('FATHER', 'Full Name of Father', form.brideFatherName, v => handleChange('brideFatherName', v), 'default', 'user-plus')}
                    {renderInput('MOTHER (MAIDEN)', 'Mother\'s Maiden Name', form.brideMotherMaidenName, v => handleChange('brideMotherMaidenName', v), 'default', 'user-plus')}
                </>);
            case 4:
                return renderSectionCard('Step 4 of 6: Requirements & Schedule', <>
                    <View style={ms.coupleInputsContainer}>
                        <View style={ms.coupleColumn}>
                            <Text style={[ms.columnTitle, { color: C.darkText }]}>GROOM</Text>
                            {renderInput('MARRIAGE LICENSE', 'License#', form.groomMarriageLicense, v => handleChange('groomMarriageLicense', v))}
                            {renderInput('BAPTISMAL CERT.', 'Date & Place', form.groomBaptismalCert, v => handleChange('groomBaptismalCert', v))}
                            {renderInput('CONFIRMATION CERT.', 'Date & Place', form.groomConfirmationCert, v => handleChange('groomConfirmationCert', v))}
                            {renderInput('MARRIAGE BANNS & PERMISSION', 'Banns/Permission from Parish', form.groomMarriageBannsPermission, v => handleChange('groomMarriageBannsPermission', v))}
                        </View>
                        <View style={ms.coupleColumn}>
                            <Text style={[ms.columnTitle, { color: C.darkText }]}>BRIDE</Text>
                            {renderInput('MARRIAGE LICENSE', 'License#', form.brideMarriageLicense, v => handleChange('brideMarriageLicense', v))}
                            {renderInput('BAPTISMAL CERT.', 'Date & Place', form.brideBaptismalCert, v => handleChange('brideBaptismalCert', v))}
                            {renderInput('CONFIRMATION CERT.', 'Date & Place', form.brideConfirmationCert, v => handleChange('brideConfirmationCert', v))}
                            {renderInput('MARRIAGE BANNS & PERMISSION', 'Banns/Permission from Parish', form.brideMarriageBannsPermission, v => handleChange('brideMarriageBannsPermission', v))}
                        </View>
                    </View>
                    <Text style={[ms.sectionTitleHeader, { marginTop: 20 }]}>Interview & Seminar Schedule</Text>
                    <View style={ms.row}>
                        <View style={ms.flexItem}>
                            {renderInput('INTERVIEW DATE', 'e.g. Sept 20, 2025', form.interviewDate, v => handleChange('interviewDate', v), 'default', 'calendar', 'none', false, false, () => {
                                setPickerField('interviewDate');
                                setShowDatePicker(true);
                            })}
                        </View>
                        <View style={ms.flexItem}>
                            {renderInput('TIME', 'e.g. 9:00 AM', form.interviewTime, v => handleChange('interviewTime', v), 'default', 'clock', 'none', false, false, () => {
                                setPickerField('interviewTime');
                                setShowTimePicker(true);
                            })}
                        </View>
                    </View>
                    <Text style={[ms.label, { marginTop: 15 }]}>SEMINAR: SATURDAY</Text>
                    {renderInput('Date', 'e.g. Oct 10, 2025', form.seminarDate, v => handleChange('seminarDate', v), 'default', 'calendar', 'none', false, false, () => {
                        setPickerField('seminarDate');
                        setShowDatePicker(true);
                    })}
                    <Text style={ms.subText}>PRE-CANA: 10:00AM - 12:00 NN</Text>
                    <Text style={ms.subText}>MARRIAGE COUNSELING: 1:00 PM - 5:00 PM</Text>
                </>);
            case 5:
                return renderSectionCard('Step 5 of 6: Sponsors', <>
                    <Text style={[ms.sectionTitleHeader, { marginBottom: 15 }]}>Sponsors (Ninong & Ninang)</Text>
                    <View style={ms.sponsorsContainer}>
                        <View style={ms.sponsorsColumn}>
                            <Text style={[ms.columnTitle, { color: C.darkText }]}>SPONSOR NAME</Text>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <View key={`sponsor-name-${i}`} style={ms.sponsorRow}>
                                    <Text style={[ms.sponsorLabel, { color: C.darkText }]}>{i + 1}.</Text>
                                    <TextInput
                                        style={[ms.sponsorInput, { borderColor: C.inputBorder }]}
                                        placeholder="Name of Sponsor"
                                        placeholderTextColor={C.grayText}
                                        value={form.sponsors[i]}
                                        onChangeText={v => {
                                            const newSponsors = [...form.sponsors];
                                            newSponsors[i] = v;
                                            handleChange('sponsors', newSponsors);
                                        }}
                                    />
                                </View>
                            ))}
                        </View>
                        <View style={ms.sponsorsColumn}>
                            <Text style={[ms.columnTitle, { color: C.darkText }]}>ADDRESS</Text>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <View key={`sponsor-address-${i}`} style={ms.sponsorRow}>
                                    <TextInput
                                        style={[ms.sponsorInput, { borderColor: C.inputBorder }]}
                                        placeholder="Address"
                                        placeholderTextColor={C.grayText}
                                        value={form.sponsors[i + 10]}
                                        onChangeText={v => {
                                            const newSponsors = [...form.sponsors];
                                            newSponsors[i + 10] = v;
                                            handleChange('sponsors', newSponsors);
                                        }}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </>);
            case 6:
                return renderSectionCard('Step 6 of 6: Signatures & Contact Info', <>
                    <Text style={[ms.sectionTitleHeader, { marginBottom: 15 }]}>Important Notes</Text>
                    <Text style={ms.noteText}>• The Schedule of Interview, Seminar & Confirmation, <Text style={ms.boldText}>NO RE-SCHEDULE.</Text></Text>
                    <Text style={ms.noteText}>• Please wear decent clothes during interview and seminar.</Text>
                    <Text style={ms.noteText}>• <Text style={ms.boldText}>Be on time</Text> (at least 15 minutes) on your wedding.</Text>
                    <Text style={ms.noteText}>• <Text style={ms.boldText}>NO MARRIAGE LICENSE, NO WEDDING.</Text> Kindly submit your documents on time.</Text>
                    <Text style={ms.noteText}>• Check your Marriage Contract if there is any mistakes found after registration, the office will not be liable.</Text>
                    <Text style={ms.noteText}>• Please settle your balance at least 2 weeks before the wedding date.</Text>
                    <Text style={ms.noteText}>• Kindly get your Marriage contract here at the Parish Office, 1 week after your wedding to register it at the Local Civil Registry located at Municipal Hall of Montalban.</Text>
                    <Text style={ms.noteText}>• Kindly bring <Text style={ms.boldText}>two (2) pieces of 2x2 ID picture</Text> for the documents.</Text>

                    <View style={ms.signaturesContainer}>
                        <View style={ms.signatureBox}>
                            <Text style={ms.signatureTitle}>GROOM</Text>
                            <TouchableOpacity onPress={() => { setActiveSigner('groom'); setShowSignatureModal(true); }} style={ms.openSignatureButton} activeOpacity={0.7}>
                                <Feather name="edit-3" size={20} color={C.primary} style={ms.inputIcon} />
                                <Text style={[ms.openSignatureButtonText, { color: C.darkText }]}>
                                    {form.groomSignature ? 'Signature Provided' : 'Tap to Sign Here'}
                                </Text>
                            </TouchableOpacity>
                            {form.groomSignature && (
                                <Image source={{ uri: form.groomSignature }} style={ms.signaturePreviewImage} resizeMode="contain" />
                            )}
                            <View style={ms.fullWidthInput}>
                                {renderInput('CP#', 'Contact Number', form.groomCP, v => handleChange('groomCP', v), 'phone-pad', 'phone', 'none', false, true)}
                            </View>
                        </View>
                        <View style={ms.signatureBox}>
                            <Text style={ms.signatureTitle}>BRIDE</Text>
                            <TouchableOpacity onPress={() => { setActiveSigner('bride'); setShowSignatureModal(true); }} style={ms.openSignatureButton} activeOpacity={0.7}>
                                <Feather name="edit-3" size={20} color={C.primary} style={ms.inputIcon} />
                                <Text style={[ms.openSignatureButtonText, { color: C.darkText }]}>
                                    {form.brideSignature ? 'Signature Provided' : 'Tap to Sign Here'}
                                </Text>
                            </TouchableOpacity>
                            {form.brideSignature && (
                                <Image source={{ uri: form.brideSignature }} style={ms.signaturePreviewImage} resizeMode="contain" />
                            )}
                            <View style={ms.fullWidthInput}>
                                {renderInput('CP#', 'Contact Number', form.brideCP, v => handleChange('brideCP', v), 'phone-pad', 'phone', 'none', false, true)}
                            </View>
                        </View>
                    </View>
                    <Text style={ms.dateOfApplication}>DATE OF APPLICATION: {form.dateOfApplication}</Text>
                </>);
            default:
                return null;
        }
    };

    const renderFooterButtons = () => (
        <View style={ms.footerContainer}>
            {step > 1 && (
                <TouchableOpacity onPress={() => setStep(prev => prev - 1)} style={ms.backButtonFooter} activeOpacity={0.7}>
                    <Text style={ms.backButtonText}>Back</Text>
                </TouchableOpacity>
            )}
            {step < 6 ? (
                <TouchableOpacity onPress={validateAndNext} style={ms.nextButton} activeOpacity={0.7}>
                    <Text style={ms.nextButtonText}>Next</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={handleSubmit} style={ms.submitButton} activeOpacity={0.7}>
                    <Text style={ms.submitButtonText}>Review & Submit</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderSignaturePad = () => {
        const signatureRef = activeSigner === 'groom' ? groomSignatureRef : brideSignatureRef;
        const title = activeSigner === 'groom' ? 'Draw Groom\'s Signature' : 'Draw Bride\'s Signature';
        return (
            <Modal transparent visible={showSignatureModal} animationType="slide" onRequestClose={() => setShowSignatureModal(false)}>
                <View style={ms.signatureModalOverlay}>
                    <View style={ms.signatureModalContent}>
                        <Text style={[ms.signatureModalTitle, { color: C.darkText }]}>{title}</Text>
                        <View style={ms.signaturePadContainer}>
                            <SignatureCanvas
                                ref={signatureRef}
                                onOK={handleSignatureOK}
                                webStyle={`.m-signature-pad--footer {display: none;}.m-signature-pad {box-shadow: none; border: none;}body {background-color: #f0f0f0;}`}
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
        );
    };

    const DetailRow = ({ label, value }) => (
        <View style={ms.modalDetailRow}>
            <Text style={[ms.modalDetailLabel, { color: C.darkText }]}>{label}:</Text>
            {label.includes('Signature') && value ? (
                <Image source={{ uri: value }} style={ms.modalSignatureImage} resizeMode="contain" />
            ) : (
                <Text style={[ms.modalDetailValue, { color: C.grayText }]}>{value || 'N/A'}</Text>
            )}
        </View>
    );

    const LoadingModal = () => (
        <Modal transparent visible={isSubmitting} animationType="fade">
            <View style={ms.modalOverlay}>
                <View style={ms.loadingContainer}>
                    <ActivityIndicator size="large" color={C.white} />
                    <Text style={ms.loadingText}>Submitting...</Text>
                </View>
            </View>
        </Modal>
    );

    const SuccessModal = () => (
        <Modal transparent visible={submissionStatus.status === 'success'} animationType="fade">
            <View style={ms.modalOverlay}>
                <View style={ms.successModalContent}>
                    <AntDesign name="checkcircle" size={70} color={C.successGreen} />
                    <Text style={ms.successTitle}>Success!</Text>
                    <Text style={ms.successMessage}>Your Marriage Application has been submitted!</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setSubmissionStatus({ status: null, message: '' });
                            navigation.goBack();
                        }}
                        style={ms.successButton}
                    >
                        <Text style={ms.successButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[ms.container, { backgroundColor: C.lightBg }]}>
            {renderHeader()}
            <ScrollView contentContainerStyle={ms.scrollViewContent}>
                {renderStepContent()}
            </ScrollView>
            {renderFooterButtons()}

            {/* Confirmation Modal */}
            <Modal transparent visible={showModal} animationType="fade" onRequestClose={() => setShowModal(false)}>
                <View style={ms.modalOverlay}>
                    <View style={ms.modalContent}>
                        <Text style={[ms.modalTitle, { color: C.darkText }]}>Confirm Application Details</Text>
                        <ScrollView style={ms.modalScrollContent}>
                            <Text style={ms.modalSectionTitle}>MARRIAGE ARRANGEMENT</Text>
                            <DetailRow label="Date of Wedding" value={form.dateOfWedding} />
                            <DetailRow label="Time of Wedding" value={form.timeOfWedding} />
                            <DetailRow label="Reservation Fee" value={form.reservationFee} />
                            <DetailRow label="Balance" value={form.balance} />
                            
                            {/* Show availability status in confirmation */}
                            {form.dateOfWedding && dateAvailability.available !== null && (
                                <View style={[
                                    ms.availabilityBadge,
                                    { backgroundColor: dateAvailability.available ? '#E8F5E9' : '#FFEBEE' }
                                ]}>
                                    <Feather 
                                        name={dateAvailability.available ? "check-circle" : "x-circle"} 
                                        size={16} 
                                        color={dateAvailability.available ? C.successGreen : C.redError} 
                                    />
                                    <Text style={[
                                        ms.availabilityBadgeText,
                                        { color: dateAvailability.available ? C.successGreen : C.redError }
                                    ]}>
                                        {dateAvailability.available ? 'Date Available' : 'Date Already Booked'}
                                    </Text>
                                </View>
                            )}
                            
                            <Text style={ms.modalSectionTitle}>GROOM'S INFORMATION</Text>
                            <DetailRow label="Name" value={`${form.groomName} ${form.groomMiddleName} ${form.groomSurname}`} />
                            <DetailRow label="Date of Birth" value={form.groomDOB} />
                            <DetailRow label="Age" value={form.groomAge} />
                            <DetailRow label="Residence" value={form.groomResidence} />
                            <Text style={ms.modalSectionTitle}>BRIDE'S INFORMATION</Text>
                            <DetailRow label="Name" value={`${form.brideName} ${form.brideMiddleName} ${form.brideSurname}`} />
                            <DetailRow label="Date of Birth" value={form.brideDOB} />
                            <DetailRow label="Age" value={form.brideAge} />
                            <DetailRow label="Residence" value={form.brideResidence} />
                            <Text style={ms.modalSectionTitle}>REQUIREMENTS & SCHEDULE</Text>
                            <DetailRow label="Interview Date" value={form.interviewDate} />
                            <DetailRow label="Interview Time" value={form.interviewTime} />
                            <DetailRow label="Seminar Date" value={form.seminarDate} />
                            <DetailRow label="Groom's Banns & Permission" value={form.groomMarriageBannsPermission} />
                            <DetailRow label="Bride's Banns & Permission" value={form.brideMarriageBannsPermission} />
                            <Text style={ms.modalSectionTitle}>CONTACT & SIGNATURES</Text>
                            <DetailRow label="Groom's Signature" value={form.groomSignature} />
                            <DetailRow label="Groom's CP#" value={form.groomCP} />
                            <DetailRow label="Bride's Signature" value={form.brideSignature} />
                            <DetailRow label="Bride's CP#" value={form.brideCP} />
                            <Text style={ms.modalSectionTitle}>SUBMITTED BY</Text>
                            <DetailRow label="User Email" value={form.submittedByEmail || currentUserEmail} />
                        </ScrollView>
                        <View style={ms.modalActions}>
                            <TouchableOpacity onPress={() => setShowModal(false)} disabled={isSubmitting} activeOpacity={0.7} style={[ms.modalButton, { backgroundColor: C.cancelBtn }]}>
                                <Text style={[ms.modalButtonText, { color: C.cancelBtnTxt }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={confirmSubmit} 
                                disabled={isSubmitting || (form.dateOfWedding && dateAvailability.available === false) || (!form.submittedByEmail && !currentUserEmail)}
                                activeOpacity={0.7} 
                                style={[
                                    ms.modalButton, 
                                    { 
                                        backgroundColor: (isSubmitting || (form.dateOfWedding && dateAvailability.available === false) || (!form.submittedByEmail && !currentUserEmail)) 
                                            ? '#CCCCCC' 
                                            : C.primary 
                                    }
                                ]}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={C.white} />
                                ) : (
                                    <Text style={[ms.modalButtonText, { color: C.white }]}>
                                        {form.dateOfWedding && dateAvailability.available === false ? 'Date Booked' : 
                                         (!form.submittedByEmail && !currentUserEmail) ? 'Email Required' : 'Submit'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Signature Modal */}
            {renderSignaturePad()}

            {/* Date and Time Pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onTimeChange}
                />
            )}

            {/* Loading Modal */}
            <LoadingModal />
            
            {/* Success Modal */}
            <SuccessModal />
        </View>
    );
}

// Updated Styles (same as before, no changes needed)
const ms = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 20,
        paddingTop: 0,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 15,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerSmallLogo: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        marginHorizontal: 5,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerSmallText: {
        fontSize: 12,
        fontWeight: '500',
    },
    headerParishName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerAddress: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },
    headerContact: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },
    headerMemorandumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    sectionCard: {
        backgroundColor: C.white,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        shadowColor: C.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    sectionTitleHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    requiredIndicator: {
        color: C.redError,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.inputBorder,
        height: 50,
        paddingHorizontal: 0,
    },
    touchableInput: {
        backgroundColor: '#f8f8f8',
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 15,
        height: '100%',
    },
    textArea: {
        height: 100,
        paddingVertical: 10,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    flexItem: {
        flex: 1,
        marginHorizontal: 5,
    },
    subText: {
        fontSize: 12,
        color: C.grayText,
        textAlign: 'center',
        marginTop: 5,
    },
    coupleInputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    coupleColumn: {
        flex: 1,
        marginHorizontal: 5,
    },
    columnTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    sponsorsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sponsorsColumn: {
        flex: 1,
        marginHorizontal: 5,
    },
    sponsorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sponsorLabel: {
        width: 25,
        fontSize: 14,
        textAlign: 'right',
        marginRight: 5,
    },
    sponsorInput: {
        flex: 1,
        backgroundColor: C.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 40,
        fontSize: 14,
        color: C.darkText,
    },
    noteText: {
        fontSize: 14,
        color: C.grayText,
        marginBottom: 8,
        lineHeight: 20,
    },
    boldText: {
        fontWeight: 'bold',
    },
    signaturesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    signatureBox: {
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    signatureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: C.darkText,
    },
    openSignatureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.inputBorder,
        height: 50,
        width: '100%',
        paddingHorizontal: 15,
    },
    openSignatureButtonText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    signaturePreviewImage: {
        width: '100%',
        height: 100,
        marginTop: 10,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 8,
        backgroundColor: C.white,
    },
    fullWidthInput: {
        width: '100%',
        marginTop: 15,
    },
    dateOfApplication: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        color: C.darkText,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: C.white,
    },
    backButtonFooter: {
        backgroundColor: C.cancelBtn,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        flex: 1,
        alignItems: 'center',
        marginRight: 10,
    },
    backButtonText: {
        color: C.cancelBtnTxt,
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: C.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        flex: 1,
        alignItems: 'center',
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: C.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        flex: 1,
        alignItems: 'center',
    },
    nextButtonText: {
        color: C.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButtonText: {
        color: C.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: C.modalBg,
    },
    modalContent: {
        backgroundColor: C.white,
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        shadowColor: C.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalScrollContent: {
        flexGrow: 1,
        maxHeight: Dimensions.get('window').height * 0.6,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: C.darkText,
        borderBottomWidth: 1,
        borderBottomColor: C.inputBorder,
        paddingBottom: 5,
    },
    modalDetailRow: {
        flexDirection: 'row',
        marginBottom: 5,
        flexWrap: 'wrap',
    },
    modalDetailLabel: {
        fontSize: 14,
        fontWeight: '600',
        width: 150,
    },
    modalDetailValue: {
        fontSize: 14,
        flex: 1,
    },
    modalSignatureImage: {
        width: 150,
        height: 50,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 5,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    signatureModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: C.modalBg,
    },
    signatureModalContent: {
        backgroundColor: C.white,
        borderRadius: 12,
        padding: 20,
        width: screenWidth * 0.9,
        alignItems: 'center',
    },
    signatureModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    signaturePadContainer: {
        width: '100%',
        height: screenWidth * 0.5,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: C.inputBg,
    },
    signatureModalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    signatureModalClearButton: {
        backgroundColor: C.cancelBtn,
    },
    loadingContainer: {
        padding: 20,
        backgroundColor: C.grayText,
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        color: C.white,
        marginTop: 10,
        fontSize: 16,
    },
    successModalContent: {
        backgroundColor: C.white,
        borderRadius: 12,
        padding: 30,
        width: '80%',
        alignItems: 'center',
        shadowColor: C.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: C.successGreen,
        marginTop: 15,
        marginBottom: 5,
    },
    successMessage: {
        fontSize: 16,
        color: C.darkText,
        textAlign: 'center',
        marginBottom: 20,
    },
    successButton: {
        backgroundColor: C.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    successButtonText: {
        color: C.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // New Styles for Availability Features
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
    },
    availabilityText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    bookedDatesContainer: {
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: C.warningOrange,
    },
    bookedDatesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: C.darkText,
        marginBottom: 5,
    },
    bookedDateText: {
        fontSize: 12,
        color: C.grayText,
        marginBottom: 2,
    },
    moreDatesText: {
        fontSize: 11,
        color: C.grayText,
        fontStyle: 'italic',
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginVertical: 5,
    },
    availabilityBadgeText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
});
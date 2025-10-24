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
const API_URL = "http://mobileonlysjmp.onrender.com/api/baptismrequests";
const USER_STORAGE_KEY = '@userData';
const NOTIFICATION_STORAGE_KEY = '@notificationHistory';

const Colors = {
    churchGreenPrimary: '#4CAF50',
    churchGreenLightBg: '#E8F5E9',
    churchGreenDarkText: '#1B5E20',
    churchGrayText: '#757575',
    pureWhite: '#FFFFFF',
    pureBlack: '#000000',
    inputBg: '#F7F9F7',
    inputBorder: '#DDE7DD',
    redError: '#D32F2F',
    gold: '#FFD700',
    silver: '#C0C0C0',
    blueInfo: '#2196F3',
    orangeWarning: '#FF9800',
};

const maritalStatusOptions = [
    { value: 'Katoliko Romano', label: 'Katoliko Romano' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Di pa Kasal', label: 'Di pa Kasal' },
    { value: 'Agipay', label: 'Agipay' },
    { value: 'Protestante', label: 'Protestante' },
];

// BAPTISM REMINDERS DATA - UPDATED WITH YOUR CONTENT
const baptismReminders = {
    title: "MGA PAALALA!",
    reminders: [
        "Mahigpit pong ipinatutupad na **MAGULANG** lamang ang dapat magsulat o sumagot sa Baptismal Form.",
        "Paki sigurado po na tama lahat ng spelling ng inyong isinulat.",
        "Ang pagkuha ng Baptismal Certificate ay pagkalipas isang buwan. Mahigpit din pong ipinatutupad na **MAGULANG** lamang ang maaaring kumuha ng Baptismal Certificate. Magpakita lamang ng ID.",
        "Kung sakali man na ibang tao ang uutusang kumuha ng Baptismal Certificate kinakailangan po ng Authorization Letter mula sa Magulang. Xerox ng ID ng Magulang at ID ng kukuha.",
        "Ang pagkuha ng mga certificates ay **tuwing Martes hanggang Sabado** lamang. Ito ay may bayad na 50 pesos kada kuha/kopya."
    ],
    officeReminders: {
        title: "REMINDERS!",
        items: [
            "ALL TRANSACTIONS MUST BE DONE AT THE PARISH OFFICE ONLY.",
            "ALL TRANSACTIONS BEYOND 5:00 P.M. WILL NOT BE ENTERTAINED.",
            "ALL MASS INTENTIONS MUST BE OFFERED WITHIN OFFICE HOURS:",
            "EVERY TUESDAY TO SATURDAY, BETWEEN 8AM-12NN & 2PM-5PM ONLY.",
            "EVERY SUNDAY, BETWEEN 8AM-12NN ONLY.",
            "ALL MASS INTENTIONS OFFERED BEYOND THOSE TIME WILL NOT BE INCLUDED FOR THE MASS INTENDED TO OFFER.",
            "PLEASE FOLLOW THE SAID OFFICE HOURS.",
            "THANK YOU FOR YOUR CONSIDERATION."
        ]
    }
};

// TIME AVAILABILITY CONFIGURATION
const timeAvailability = {
    'Solo Baptism': {
        days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        times: ['3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM']
    },
    'Common Baptism': {
        days: ['Saturday', 'Sunday'],
        times: {
            'Saturday': ['9:30 AM'],
            'Sunday': ['11:30 AM']
        }
    }
};

// STATUS-BASED REMINDERS
const statusReminders = {
    pending: {
        title: "⏳ Pending for Review",
        message: "Your baptism request is currently under review by the parish office.",
        instructions: [
            "Please wait for the status update.",
            "You will be notified once your request is approved.",
            "Make sure all your information is correct."
        ],
        color: Colors.orangeWarning,
        icon: 'clock'
    },
    approved: {
        title: "✅ Approved",
        message: "Your baptism request has been approved!",
        instructions: [
            "Proceed to the parish office to complete your registration.",
            "Bring all required documents with you.",
            "Pay the necessary fees at the office."
        ],
        color: Colors.churchGreenPrimary,
        icon: 'check-circle'
    },
    completed: {
        title: "🎉 Completed",
        message: "Your baptism has been completed!",
        instructions: [
            "Your baptismal certificate will be available after one month.",
            "Only parents can claim the baptismal certificate.",
            "Bring valid ID when claiming the certificate."
        ],
        color: Colors.blueInfo,
        icon: 'award'
    },
    rejected: {
        title: "❌ Rejected",
        message: "Your baptism request needs revision.",
        instructions: [
            "Please check the reason for rejection.",
            "You may need to provide additional documents.",
            "Contact the parish office for more information."
        ],
        color: Colors.redError,
        icon: 'x-circle'
    },
    cancelled: {
        title: "🚫 Cancelled",
        message: "Your baptism request has been cancelled.",
        instructions: [
            "You can schedule a new baptism if needed.",
            "Contact the parish office for any questions.",
            "Thank you for your understanding."
        ],
        color: Colors.churchGrayText,
        icon: 'slash'
    }
};

const DetailRow = ({ label, value }) => (
    <View style={styles.modalDetailRow}>
        <Text style={styles.modalDetailLabel}>{label}</Text>
        <Text style={styles.modalDetailValue}>{value || '—'}</Text>
    </View>
);

const fmtDate = (d) => {
    if (!d) return '';
    try {
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return '';
    }
};

const fmtTime = (t) => t ? new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

export default function BaptismFormScreen({ navigation }) {
    const [form, setForm] = useState({
        baptizedName: '', birthDate: null, birthPlace: '', fatherName: '', fatherBirthPlace: '',
        motherName: '', motherBirthPlace: '', maritalStatus: '', currentAddress: '',
        godfatherName: '', godfatherAddress: '', godmotherName: '', godmotherAddress: '',
        baptismDate: null, baptismTime: null, contactNo: '', baptismType: '',
    });

    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [showBapTimePicker, setShowBapTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFinalReminders, setShowFinalReminders] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [existingSchedule, setExistingSchedule] = useState(null);
    const [showBaptismTypeSelection, setShowBaptismTypeSelection] = useState(true);
    const [showRemindersModal, setShowRemindersModal] = useState(false);
    const [showTimeSelection, setShowTimeSelection] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');

    const refs = {
        baptizedName: useRef(null), birthPlace: useRef(null), fatherName: useRef(null),
        fatherBirthPlace: useRef(null), motherName: useRef(null), motherBirthPlace: useRef(null),
        currentAddress: useRef(null), godfatherName: useRef(null), godfatherAddress: useRef(null),
        godmotherName: useRef(null), godmotherAddress: useRef(null), contactNo: useRef(null),
    };

    // ✅ NOTIFICATION FUNCTION
    const addNotification = async (type, message, data = {}) => {
        try {
            const newNotification = {
                id: Date.now().toString(),
                type: type,
                message: message,
                data: data,
                timestamp: new Date().toISOString(),
                read: false
            };

            console.log('📢 Creating notification:', newNotification);

            const existingNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
            const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
            
            const updatedNotifications = [newNotification, ...notifications];
            await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
            
            console.log('✅ Notification saved successfully!');
            return newNotification;
        } catch (error) {
            console.error('❌ Error adding notification:', error);
        }
    };

    // Load user data and check for existing schedules
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (userData) {
                    const user = JSON.parse(userData);
                    setUserEmail(user.email);
                    console.log('User email loaded:', user.email);
                    
                    await checkExistingSchedules(user.email);
                } else {
                    console.log('No user data found in storage');
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    // Check for existing baptism schedules
    const checkExistingSchedules = async (email) => {
        try {
            const response = await fetch(`${API_URL}/${email}`);
            const data = await response.json();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const userSchedule = data.find(
                r => r.submittedByEmail === email && 
                     new Date(r.baptismDate) >= today &&
                     (r.status === 'pending' || r.status === 'approved' || r.status === 'completed' || r.status === 'rejected' || !r.status)
            );
            
            if (userSchedule) {
                setExistingSchedule(userSchedule);
                console.log('Existing schedule found:', userSchedule);
                
                // Add notification based on status
                if (userSchedule.status === 'approved') {
                    await addNotification(
                        'approved',
                        `🎉 Your baptism for ${userSchedule.name} has been APPROVED! Scheduled on ${fmtDate(userSchedule.baptismDate)} at ${userSchedule.baptismTime}.`,
                        {
                            scheduleId: userSchedule._id,
                            childName: userSchedule.name,
                            baptismDate: userSchedule.baptismDate,
                            baptismTime: userSchedule.baptismTime,
                            status: 'approved'
                        }
                    );
                } else if (userSchedule.status === 'pending') {
                    await addNotification(
                        'pending',
                        `⏳ Your baptism request for ${userSchedule.name} is under review. We will notify you once approved.`,
                        {
                            scheduleId: userSchedule._id,
                            childName: userSchedule.name,
                            status: 'pending'
                        }
                    );
                } else if (userSchedule.status === 'completed') {
                    await addNotification(
                        'completed',
                        `🎉 Baptism for ${userSchedule.name} has been completed! Certificate will be available after one month.`,
                        {
                            scheduleId: userSchedule._id,
                            childName: userSchedule.name,
                            status: 'completed'
                        }
                    );
                } else if (userSchedule.status === 'rejected') {
                    await addNotification(
                        'rejected',
                        `❌ Your baptism request for ${userSchedule.name} needs revision. Please check the details.`,
                        {
                            scheduleId: userSchedule._id,
                            childName: userSchedule.name,
                            status: 'rejected'
                        }
                    );
                }
            } else {
                setExistingSchedule(null);
            }
        } catch (error) {
            console.error("Error checking existing schedules:", error);
            setExistingSchedule(null);
        }
    };

    const formatDateAPI = (d) => {
        if (!d) return '';
        const date = new Date(d);
        const yyyy = date.getFullYear();
        const mm = `${date.getMonth() + 1}`.padStart(2, '0');
        const dd = `${date.getDate()}`.padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatTimeAPI = (t) => {
        if (!t) return '';
        const date = new Date(t);
        let hh = date.getHours();
        const mm = `${date.getMinutes()}`.padStart(2, '0');
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12;
        hh = hh ? hh : 12;
        return `${hh}:${mm} ${ampm}`;
    };

    // BAPTISM TYPE SELECTION HANDLER
    const handleBaptismTypeSelect = (type) => {
        setForm(prev => ({ ...prev, baptismType: type }));
        setShowRemindersModal(true);
    };

    // PROCEED TO CALENDAR AFTER READING REMINDERS
    const handleProceedToCalendar = () => {
        setShowRemindersModal(false);
        setShowBaptismTypeSelection(false);
        setShowCalendarOverlay(true);
    };

    // HANDLE DATE SELECTION WITH TIME AVAILABILITY
    const handleDateSelection = (day) => {
        const selectedDate = new Date(day.dateString);
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        handleChange('baptismDate', selectedDate);
        
        // Set available times based on baptism type and selected day
        if (form.baptismType === 'Solo Baptism') {
            setAvailableTimes(timeAvailability['Solo Baptism'].times);
        } else if (form.baptismType === 'Common Baptism') {
            const commonTimes = timeAvailability['Common Baptism'].times[dayOfWeek] || [];
            setAvailableTimes(commonTimes);
        }
        
        setSelectedTime('');
        setShowTimeSelection(true);
    };

    // HANDLE TIME SELECTION
    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const selectedDateTime = new Date(form.baptismDate);
        selectedDateTime.setHours(hours, minutes, 0, 0);
        
        handleChange('baptismTime', selectedDateTime);
    };

    // CONFIRM DATE AND TIME SELECTION
    const confirmDateTime = () => {
        if (!form.baptismDate) {
            Alert.alert('Select Date', 'Please select a Baptismal Date before proceeding.');
            return;
        }
        
        if (!selectedTime) {
            Alert.alert('Select Time', 'Please select a Baptismal Time before proceeding.');
            return;
        }
        
        setShowTimeSelection(false);
        setShowCalendarOverlay(false);
    };

    // RENDER STATUS-BASED REMINDERS
    const renderStatusReminders = () => {
        if (!existingSchedule) return null;
        
        const status = existingSchedule.status || 'pending';
        const reminderConfig = statusReminders[status] || statusReminders.pending;
        
        return (
            <View style={[styles.statusReminderCard, { borderLeftColor: reminderConfig.color }]}>
                <View style={styles.statusHeader}>
                    <Feather name={reminderConfig.icon} size={24} color={reminderConfig.color} />
                    <Text style={[styles.statusTitle, { color: reminderConfig.color }]}>
                        {reminderConfig.title}
                    </Text>
                </View>
                
                <Text style={styles.statusMessage}>{reminderConfig.message}</Text>
                
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>What to do next:</Text>
                    {reminderConfig.instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionItem}>
                            <Feather name="chevron-right" size={14} color={Colors.churchGreenPrimary} />
                            <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                    ))}
                </View>

                {/* OFFICE REMINDERS - ALWAYS SHOWN */}
                <View style={styles.officeRemindersContainer}>
                    <Text style={styles.officeRemindersTitle}>📋 IMPORTANT REMINDERS</Text>
                    
                    <View style={styles.reminderItem}>
                        <Text style={styles.reminderNumber}>1.</Text>
                        <Text style={styles.reminderText}>
                            <Text style={styles.boldText}>Proceed to Parish Office</Text> to complete your registration and submit requirements.
                        </Text>
                    </View>
                    
                    <View style={styles.reminderItem}>
                        <Text style={styles.reminderNumber}>2.</Text>
                        <Text style={styles.reminderText}>
                            <Text style={styles.boldText}>Office Hours:</Text> Tuesday to Saturday, 8AM-12NN & 2PM-5PM
                        </Text>
                    </View>
                    
                    <View style={styles.reminderItem}>
                        <Text style={styles.reminderNumber}>3.</Text>
                        <Text style={styles.reminderText}>
                            <Text style={styles.boldText}>Bring Requirements:</Text> Birth Certificate, Valid IDs, and other necessary documents
                        </Text>
                    </View>
                    
                    <View style={styles.reminderItem}>
                        <Text style={styles.reminderNumber}>4.</Text>
                        <Text style={styles.reminderText}>
                            <Text style={styles.boldText}>Baptismal Certificate:</Text> Available after one month, ₱50.00 fee
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // RENDER TIME SELECTION COMPONENT
    const renderTimeSelection = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showTimeSelection}
            onRequestClose={() => setShowTimeSelection(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite, maxHeight: height * 0.7 }]}>
                    <Text style={styles.modalTitle}>Select Baptism Time</Text>
                    <Text style={styles.modalSubTitle}>
                        Available times for {fmtDate(form.baptismDate)}
                    </Text>
                    
                    <View style={styles.timeSelectionContainer}>
                        {availableTimes.length > 0 ? (
                            availableTimes.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.timeSlot,
                                        selectedTime === time && { backgroundColor: Colors.churchGreenPrimary }
                                    ]}
                                    onPress={() => handleTimeSelect(time)}
                                >
                                    <Text style={[
                                        styles.timeSlotText,
                                        selectedTime === time && { color: Colors.pureWhite }
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noTimesText}>
                                No available times for selected date. Please choose another date.
                            </Text>
                        )}
                    </View>

                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                            onPress={() => setShowTimeSelection(false)}
                            style={[styles.modalButton, styles.modalCancelButton]}
                        >
                            <Text style={styles.modalCancelButtonText}>Back to Calendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={confirmDateTime}
                            style={[styles.modalButton, { 
                                backgroundColor: selectedTime ? Colors.churchGreenPrimary : Colors.churchGrayText 
                            }]}
                            disabled={!selectedTime}
                        >
                            <Text style={styles.modalButtonText}>Confirm Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // RENDER FINAL REMINDERS MODAL - UPDATED WITH CONFIRM RESERVATION BUTTON
    const renderFinalRemindersModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showFinalReminders}
            onRequestClose={() => setShowFinalReminders(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite, maxHeight: height * 0.9 }]}>
                    
                    {/* FIRST REMINDERS IMAGE CONTENT */}
                    <Text style={styles.finalReminderTitle}>MGA PAALALA!</Text>
                    
                    <ScrollView style={styles.finalRemindersScrollView}>
                        <View style={styles.reminderSection}>
                            {baptismReminders.reminders.map((reminder, index) => (
                                <View key={index} style={styles.finalReminderItem}>
                                    <Text style={styles.finalReminderNumber}>{index + 1}.</Text>
                                    <Text style={styles.finalReminderText}>{reminder}</Text>
                                </View>
                            ))}
                        </View>
                        
                        {/* SECOND REMINDERS IMAGE CONTENT */}
                        <View style={styles.officeRemindersSection}>
                            <Text style={styles.officeReminderTitle}>REMINDERS!</Text>
                            {baptismReminders.officeReminders.items.map((item, index) => (
                                <View key={index} style={styles.officeReminderItem}>
                                    <Text style={styles.officeReminderText}>{item}</Text>
                                </View>
                            ))}
                        </View>

                        {/* PROCEED TO OFFICE REMINDER */}
                        <View style={styles.proceedReminder}>
                            <Feather name="info" size={20} color={Colors.churchGreenPrimary} />
                            <Text style={styles.proceedReminderText}>
                                Proceed to office to pass the requirements and complete your baptism registration.
                            </Text>
                        </View>

                        {/* SCHEDULE SUMMARY */}
                        <View style={styles.scheduleSummary}>
                            <Text style={styles.scheduleSummaryTitle}>Your Baptism Schedule</Text>
                            <View style={styles.scheduleDetail}>
                                <Feather name="user" size={16} color={Colors.churchGreenPrimary} />
                                <Text style={styles.scheduleText}>Child: {form.baptizedName}</Text>
                            </View>
                            <View style={styles.scheduleDetail}>
                                <Feather name="calendar" size={16} color={Colors.churchGreenPrimary} />
                                <Text style={styles.scheduleText}>Date: {fmtDate(form.baptismDate)}</Text>
                            </View>
                            <View style={styles.scheduleDetail}>
                                <Feather name="clock" size={16} color={Colors.churchGreenPrimary} />
                                <Text style={styles.scheduleText}>Time: {fmtTime(form.baptismTime)}</Text>
                            </View>
                            <View style={styles.scheduleDetail}>
                                <Feather name="tag" size={16} color={Colors.churchGreenPrimary} />
                                <Text style={styles.scheduleText}>Type: {form.baptismType}</Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.finalModalButtonContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowFinalReminders(false);
                                setShowSuccess(true);
                                resetForm(); // RESET FORM SO USER CAN SCHEDULE AGAIN
                            }}
                            style={[styles.finalModalButton, { backgroundColor: Colors.churchGreenPrimary }]}
                        >
                            <Feather name="check-circle" size={20} color={Colors.pureWhite} />
                            <Text style={styles.finalModalButtonText}>Confirm Reservation</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderFormInput = ({
        label, placeholder, value, onChangeText,
        icon, isDatePicker, onPress, showPicker,
        mode = 'date', onDateChange,
        keyboardType = 'default', autoCapitalize = 'words',
        inputRef, note, isRequired = true, maxLength
    }) => {
        const displayValue = isDatePicker && value
            ? (mode === 'time' ? fmtTime(value) : fmtDate(value))
            : (typeof value === 'string' ? value : '');

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
                            { borderColor: showPicker ? Colors.churchGreenPrimary : Colors.inputBorder }
                        ]}
                    >
                        <Feather name={icon} size={20} color={Colors.churchGreenPrimary} style={styles.inputIcon} />
                        <Text style={[
                            styles.datePickerText,
                            { color: value ? Colors.churchGreenDarkText : Colors.churchGrayText }
                        ]}>
                            {displayValue || placeholder}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.inputContainer, { backgroundColor: Colors.pureWhite }]}>
                        <Feather name={icon} size={20} color={Colors.churchGreenPrimary} style={styles.inputIcon} />
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput, { color: Colors.churchGreenDarkText }]}
                            placeholder={placeholder}
                            placeholderTextColor={Colors.churchGrayText}
                            value={value}
                            onChangeText={onChangeText}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            maxLength={maxLength}
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

    const handleChange = (field, value) => {
        if (typeof value === 'string' && (
            field.toLowerCase().includes('name') ||
            field.toLowerCase().includes('place') ||
            field.toLowerCase().includes('address')
        )) {
            value = value.replace(/\b\w/g, char => char.toUpperCase());
        }
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event, selectedDate, field) => {
        if (Platform.OS === 'android') {
            if (field === 'birthDate') setShowBirthDatePicker(false);
            if (field === 'baptismTime') setShowBapTimePicker(false);
        }
        
        if (selectedDate === undefined) {
            return;
        }
        
        if (selectedDate) {
            handleChange(field, selectedDate);
        }
    };

    const confirmInitialDate = () => {
        if (form.baptismDate) {
            setShowCalendarOverlay(false);
        } else {
            Alert.alert('Select Date', 'Please select a Baptismal Date before proceeding.');
        }
    };

    // Cancel existing schedule
    const cancelSchedule = () => {
        Alert.alert(
            'Cancel Schedule',
            'Are you sure you want to cancel your scheduled Baptism?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        await addNotification(
                            'cancelled',
                            `❌ Your baptism schedule for ${existingSchedule.name} has been cancelled.`,
                            {
                                scheduleId: existingSchedule._id,
                                childName: existingSchedule.name,
                                status: 'cancelled'
                            }
                        );
                        
                        setExistingSchedule(null); 
                        resetForm();
                        Alert.alert('Cancelled', 'Your Baptism schedule has been cancelled.');
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setForm({
            baptizedName: '', birthDate: null, birthPlace: '', fatherName: '', fatherBirthPlace: '',
            motherName: '', motherBirthPlace: '', maritalStatus: '', currentAddress: '',
            godfatherName: '', godfatherAddress: '', godmotherName: '', godmotherAddress: '',
            baptismDate: null, baptismTime: null, contactNo: '', baptismType: '',
        });
        setShowBaptismTypeSelection(true);
        setShowCalendarOverlay(false);
        setSelectedTime('');
    };

    const requiredFields = {
        baptizedName: 'Pangalan ng Bibinyagan', 
        birthDate: 'Kailan Ipinanganak',
        birthPlace: 'Lugar ng Kapanganakan (Bibinyagan)', 
        fatherName: 'Pangalan ng Ama',
        motherName: 'Pangalan ng Ina', 
        maritalStatus: 'Kasal sa (Marital Status)',
        currentAddress: 'Kasalukuyang Tirahan', 
        godfatherName: 'Pangalan ng Ninong',
        godmotherName: 'Pangalan ng Ninang', 
        baptismDate: 'Petsa ng Binyag',
        baptismTime: 'Oras ng Binyag', 
        contactNo: 'Contact Number',
        baptismType: 'Uri ng Binyag',
    };

    const handleSubmit = () => {
        for (const field in requiredFields) {
            const val = form[field];
            if (!val || (typeof val === 'string' && !val.trim())) {
                Alert.alert('Missing Information', `Please fill in the '${requiredFields[field]}' field.`);
                return;
            }
        }
        
        if (!userEmail) {
            Alert.alert('Login Required', 'Please login to submit a baptism request.');
            return;
        }
        
        setShowModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (!userEmail) {
                throw new Error('User not logged in');
            }

            const req = {
                name: form.baptizedName, 
                birthDate: form.birthDate ? formatDateAPI(form.birthDate) : '',
                birthPlace: form.birthPlace, 
                fatherName: form.fatherName, 
                fatherBirthPlace: form.fatherBirthPlace,
                motherName: form.motherName, 
                motherBirthPlace: form.motherBirthPlace, 
                marriage: form.maritalStatus,
                address: form.currentAddress, 
                godfather: form.godfatherName, 
                godfatherAddress: form.godfatherAddress,
                godmother: form.godmotherName, 
                godmotherAddress: form.godmotherAddress,
                baptismDate: form.baptismDate ? formatDateAPI(form.baptismDate) : '',
                baptismTime: form.baptismTime ? formatTimeAPI(form.baptismTime) : '',
                contact: form.contactNo, 
                sacrament: 'Baptism', 
                status: 'pending',
                submittedByEmail: userEmail,
                baptismType: form.baptismType,
            };

            console.log('Submitting request:', req);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req),
            });

            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response text:', responseText);

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${responseText}`);
            }

            const result = JSON.parse(responseText);
            
            await addNotification(
                'submitted',
                `✅ Baptism request for ${form.baptizedName} submitted successfully! Scheduled on ${fmtDate(form.baptismDate)} at ${formatTimeAPI(form.baptismTime)}.`,
                {
                    scheduleId: result.id || 'temp_id',
                    childName: form.baptizedName,
                    baptismDate: form.baptismDate,
                    baptismTime: form.baptismTime,
                    baptismType: form.baptismType,
                    status: 'submitted'
                }
            );
            
            setShowModal(false);
            // SHOW FINAL REMINDERS INSTEAD OF SUCCESS MESSAGE IMMEDIATELY
            setShowFinalReminders(true);

        } catch (err) {
            console.error('Submit error:', err);
            
            await addNotification(
                'error',
                `❌ Failed to submit baptism request for ${form.baptizedName}. Please try again.`,
                { 
                    error: err.message,
                    childName: form.baptizedName 
                }
            );
            
            Alert.alert('Submission Failed', err.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigateToScheduleHistory = () => {
        setShowSuccess(false);
        navigation.navigate('ScheduleHistoryScreen');
    };

    // Render existing schedule view
    const renderExistingSchedule = () => (
        <View style={styles.existingScheduleContainer}>
            <View style={styles.scheduledCard}>
                <Feather name="check-circle" size={40} color={Colors.churchGreenPrimary} style={{marginBottom: 10}}/>
                <Text style={styles.scheduledTitle}>You Already Have a Baptism Schedule!</Text>
                <Text style={styles.scheduledMessage}>
                    Please check the status and reminders below for your next steps.
                </Text>
                <DetailRow label="Child's Name" value={existingSchedule.name} />
                <DetailRow label="Baptism Date" value={fmtDate(existingSchedule.baptismDate)} />
                <DetailRow label="Baptism Time" value={existingSchedule.baptismTime} />
                <DetailRow label="Baptism Type" value={existingSchedule.baptismType} />
                <DetailRow label="Status" value={existingSchedule.status || 'Pending'} />
                
                <TouchableOpacity 
                    style={[styles.cancelButton, { marginTop: 20, backgroundColor: Colors.redError }]} 
                    onPress={cancelSchedule}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelButtonText}>Cancel Schedule</Text>
                </TouchableOpacity>
            </View>

            {/* STATUS-BASED REMINDERS - BELOW THE CARD */}
            {renderStatusReminders()}
        </View>
    );

    // RENDER BAPTISM TYPE SELECTION
    const renderBaptismTypeSelection = () => (
        <View style={styles.typeSelectionContainer}>
            <Text style={styles.typeSelectionTitle}>Step 1: Select Baptism Type</Text>
            <Text style={styles.typeSelectionSubtitle}>Choose the type of baptism ceremony</Text>
            
            <TouchableOpacity 
                style={[styles.typeCard, { borderColor: Colors.gold }]}
                onPress={() => handleBaptismTypeSelect('Solo Baptism')}
                activeOpacity={0.7}
            >
                <View style={[styles.typeIcon, { backgroundColor: Colors.gold }]}>
                    <Feather name="user" size={24} color={Colors.pureWhite} />
                </View>
                <View style={styles.typeContent}>
                    <Text style={styles.typeTitle}>Solo Baptism</Text>
                    <Text style={styles.typeFee}>Fee: ₱1,500.00</Text>
                    <Text style={styles.typeSchedule}>EVERY TUESDAY TO SATURDAY</Text>
                    <View style={styles.timeChips}>
                        <View style={styles.timeChip}><Text style={styles.timeChipText}>3:00 PM</Text></View>
                        <View style={styles.timeChip}><Text style={styles.timeChipText}>3:30 PM</Text></View>
                        <View style={styles.timeChip}><Text style={styles.timeChipText}>4:00 PM</Text></View>
                        <View style={styles.timeChip}><Text style={styles.timeChipText}>4:30 PM</Text></View>
                    </View>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.churchGrayText} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.typeCard, { borderColor: Colors.silver }]}
                onPress={() => handleBaptismTypeSelect('Common Baptism')}
                activeOpacity={0.7}
            >
                <View style={[styles.typeIcon, { backgroundColor: Colors.silver }]}>
                    <Feather name="users" size={24} color={Colors.pureWhite} />
                </View>
                <View style={styles.typeContent}>
                    <Text style={styles.typeTitle}>Common Baptism</Text>
                    <Text style={styles.typeFee}>Fee: ₱500.00</Text>
                    <Text style={styles.typeSchedule}>EVERY SATURDAY @ 9:30 AM, EVERY SUNDAY @ 11:30 AM</Text>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.churchGrayText} />
            </TouchableOpacity>
        </View>
    );

    // RENDER INITIAL REMINDERS MODAL (BEFORE FORM FILL-UP)
    const renderRemindersModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showRemindersModal}
            onRequestClose={() => setShowRemindersModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite, maxHeight: height * 0.9 }]}>
                    <Text style={styles.modalTitle}>Baptism Reminders</Text>
                    <Text style={styles.modalSubTitle}>BASAHIN PONG MABUTI</Text>
                    
                    <ScrollView style={styles.remindersScrollView}>
                        <View style={styles.reminderSection}>
                            <Text style={styles.reminderSectionTitle}>REQUIREMENTS:</Text>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>1.</Text>
                                <Text style={styles.reminderText}>BIRTH CERTIFICATE ng batang bibinyagan (ORIGINAL COPY or PHOTOCOPY: LOCAL/PSA BIRTH CERTIFICATE)</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>2.</Text>
                                <Text style={styles.reminderText}>Katoliko ang mga magulang o kahit isa sa magulang</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>3.</Text>
                                <Text style={styles.reminderText}>Para sa batang 3yrs old pataas: CERTIFICATE OF NO RECORD OF BAPTISM</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>4.</Text>
                                <Text style={styles.reminderText}>Para sa batang 7yrs old pataas: Adult Baptism (interview at seminar)</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>5.</Text>
                                <Text style={styles.reminderText}>Seminar ng mga magulang tuwing Huwebes @ 9:00 AM</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>6.</Text>
                                <Text style={styles.reminderText}>Mga damit: BABAE - puting bestida; LALAKI - puting polo at puting shorts</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>7.</Text>
                                <Text style={styles.reminderText}>Kandila: ₱15.00 bawat isa o gumawa ng sarili (bawal ang walang saluhan)</Text>
                            </View>
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderNumber}>8.</Text>
                                <Text style={styles.reminderText}>BAPTISMAL CERTIFICATE: ₱50.00, makukuha pagkalipas ng isang buwan</Text>
                            </View>
                        </View>
                        
                        <View style={styles.selectedTypeInfo}>
                            <Text style={styles.selectedTypeLabel}>Selected Baptism Type:</Text>
                            <Text style={styles.selectedTypeValue}>{form.baptismType}</Text>
                            <Text style={styles.selectedTypeFee}>
                                Fee: {form.baptismType === 'Solo Baptism' ? '₱1,500.00' : '₱500.00'}
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                            onPress={() => setShowRemindersModal(false)}
                            style={[styles.modalButton, styles.modalCancelButton]}
                        >
                            <Text style={styles.modalCancelButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleProceedToCalendar}
                            style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary }]}
                        >
                            <Text style={styles.modalButtonText}>I Understand, Proceed</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: Colors.churchGreenLightBg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                    {/* HEADER */}
                    <View style={[styles.header, { backgroundColor: Colors.pureWhite }]}>
                        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton} activeOpacity={0.7}>
                            <Feather name="arrow-left" size={24} color={Colors.churchGreenDarkText} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: Colors.churchGreenDarkText }]}>BAPTISMAL REGISTRATION</Text>
                    </View>

                    {/* Check for existing schedule first */}
                    {existingSchedule ? (
                        renderExistingSchedule()
                    ) : showBaptismTypeSelection ? (
                        renderBaptismTypeSelection()
                    ) : showCalendarOverlay ? (
                        <View style={styles.calendarOverlay}>
                            <Text style={styles.calendarOverlayTitle}>Step 2: Select Baptismal Date</Text>
                            <Text style={styles.calendarInstruction}>Choose your desired date for the Sacrament of Baptism.</Text>
                            
                            <View style={styles.selectedTypeBanner}>
                                <Feather name="info" size={16} color={Colors.pureWhite} />
                                <Text style={styles.selectedTypeBannerText}>
                                    {form.baptismType} - {form.baptismType === 'Solo Baptism' ? '₱1,500.00' : '₱500.00'}
                                </Text>
                            </View>
                            
                            <Calendar
                                minDate={new Date().toISOString().split('T')[0]}
                                onDayPress={handleDateSelection}
                                markedDates={{
                                    [form.baptismDate ? form.baptismDate.toISOString().split('T')[0] : '']: {
                                        selected: true, 
                                        selectedColor: Colors.churchGreenPrimary,
                                    },
                                }}
                                style={{ width: '100%' }}
                                theme={{
                                    todayTextColor: Colors.churchGreenPrimary,
                                    arrowColor: Colors.churchGreenDarkText,
                                    monthTextColor: Colors.churchGreenDarkText,
                                    textDayFontWeight: '500', 
                                    textMonthFontWeight: 'bold',
                                    textDayHeaderFontWeight: '700', 
                                    textDayFontSize: 16,
                                    textMonthFontSize: 18, 
                                    textDayHeaderFontSize: 14,
                                    calendarBackground: Colors.pureWhite,
                                }}
                            />
                            {form.baptismDate && (
                                <View style={styles.selectedDateContainer}>
                                    <Feather name="check-circle" size={20} color={Colors.churchGreenDarkText} style={styles.inputIcon} />
                                    <Text style={styles.selectedDateText}>
                                        Selected Date: {fmtDate(form.baptismDate)}
                                    </Text>
                                    {selectedTime && (
                                        <View style={styles.selectedTimeContainer}>
                                            <Feather name="clock" size={16} color={Colors.churchGreenPrimary} />
                                            <Text style={styles.selectedTimeText}>Time: {selectedTime}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={confirmInitialDate}
                                style={[styles.confirmDateButton, { 
                                    backgroundColor: form.baptismDate && selectedTime ? Colors.churchGreenPrimary : Colors.churchGrayText 
                                }]}
                                disabled={!form.baptismDate || !selectedTime}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.submitButtonText}>Confirm Date & Time</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (

                        <View style={styles.scrollViewContent}>
                            <Text style={styles.formInstruction}>
                                Step 3: Please fill out the form completely. Fields marked with <Text style={{color: Colors.redError}}>*</Text> are required.
                            </Text>

                            {/* Baptism Type Display */}
                            <View style={styles.baptismTypeDisplay}>
                                <Feather name="tag" size={20} color={Colors.churchGreenPrimary} />
                                <Text style={styles.baptismTypeText}>
                                    {form.baptismType} - {form.baptismType === 'Solo Baptism' ? '₱1,500.00' : '₱500.00'}
                                </Text>
                            </View>

                            {/* Schedule Summary */}
                            <View style={styles.schedulePreview}>
                                <Text style={styles.schedulePreviewTitle}>Selected Schedule</Text>
                                <View style={styles.schedulePreviewDetails}>
                                    <View style={styles.schedulePreviewItem}>
                                        <Feather name="calendar" size={16} color={Colors.churchGreenPrimary} />
                                        <Text style={styles.schedulePreviewText}>Date: {fmtDate(form.baptismDate)}</Text>
                                    </View>
                                    <View style={styles.schedulePreviewItem}>
                                        <Feather name="clock" size={16} color={Colors.churchGreenPrimary} />
                                        <Text style={styles.schedulePreviewText}>Time: {fmtTime(form.baptismTime)}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={styles.changeScheduleButton}
                                    onPress={() => setShowCalendarOverlay(true)}
                                >
                                    <Feather name="edit" size={14} color={Colors.churchGreenPrimary} />
                                    <Text style={styles.changeScheduleText}>Change Schedule</Text>
                                </TouchableOpacity>
                            </View>

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
                                        })}
                                        {showBirthDatePicker && (
                                            <DateTimePicker
                                                value={form.birthDate || new Date()}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={(e, d) => handleDateChange(e, d, 'birthDate')}
                                            />
                                        )}
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
                                {/* Baptism Date Display (From calendar) */}
                                <View style={styles.datePickerWrapper}>
                                    <Text style={styles.dateLabel}>Baptism Schedule:</Text>
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
                                        <View style={styles.scheduleDisplay}>
                                            <Text style={[styles.datePickerText, { color: Colors.churchGreenDarkText, fontWeight: '600' }]}>
                                                {fmtDate(form.baptismDate)}
                                            </Text>
                                            <Text style={[styles.timeDisplayText, { color: Colors.churchGreenPrimary }]}>
                                                {fmtTime(form.baptismTime)}
                                            </Text>
                                        </View>
                                        <Feather name="edit" size={18} color={Colors.churchGreenPrimary} />
                                    </TouchableOpacity>
                                </View>
                                
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
                                    <Text style={styles.submitButtonText}>Review & Submit Baptismal Request</Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 50 }} />
                        </View>
                    )}

                    {/* Initial Reminders Modal (Before Form) */}
                    {renderRemindersModal()}

                    {/* Time Selection Modal */}
                    {renderTimeSelection()}

                    {/* Final Reminders Modal (After Submission) */}
                    {renderFinalRemindersModal()}

                    {/* Confirmation Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => setShowModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite }]}>
                                <Text style={styles.modalTitle}>Confirm Submission</Text>
                                <Text style={styles.modalSubTitle}>Please review the details before submitting:</Text>

                                <ScrollView style={styles.modalDetailsScrollView}>
                                    <DetailRow label="Baptism Type" value={form.baptismType} />
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
                                        style={[styles.modalButton, styles.modalCancelButton]}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.modalCancelButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmSubmit}
                                        style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary }]}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color={Colors.pureWhite} />
                                        ) : (
                                            <Text style={styles.modalButtonText}>Confirm & Submit</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Success Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showSuccess}
                        onRequestClose={() => setShowSuccess(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: Colors.pureWhite }]}>
                                <Feather name="check-circle" size={60} color={Colors.churchGreenPrimary} style={{ marginBottom: 15 }} />
                                <Text style={styles.modalTitle}>Success!</Text>
                                <Text style={styles.modalSubTitle}>
                                    Your Baptismal Request has been submitted successfully!{'\n'}
                                    You can check your schedule status in the History section.
                                </Text>
                                
                                <TouchableOpacity
                                    onPress={navigateToScheduleHistory}
                                    style={[styles.successButton, { backgroundColor: Colors.churchGreenPrimary }]}
                                >
                                    <Feather name="list" size={16} color={Colors.pureWhite} style={{ marginRight: 5 }} />
                                    <Text style={styles.modalButtonText}>View Schedule History</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSuccess(false);
                                        resetForm();
                                    }}
                                    style={[styles.successButton, { backgroundColor: Colors.gold, marginTop: 10 }]}
                                >
                                    <Feather name="plus" size={16} color={Colors.pureWhite} style={{ marginRight: 5 }} />
                                    <Text style={styles.modalButtonText}>Schedule Another Baptism</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // EXISTING SCHEDULE CONTAINER
    existingScheduleContainer: {
        flex: 1,
        padding: 20,
    },
    // STATUS-BASED REMINDERS STYLES
    statusReminderCard: {
        backgroundColor: Colors.pureWhite,
        borderRadius: 12,
        padding: 20,
        marginTop: 15,
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    statusMessage: {
        fontSize: 14,
        color: Colors.churchGrayText,
        marginBottom: 15,
        lineHeight: 20,
    },
    instructionsContainer: {
        backgroundColor: Colors.churchGreenLightBg,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginBottom: 10,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    instructionText: {
        flex: 1,
        fontSize: 13,
        color: Colors.churchGreenDarkText,
        marginLeft: 8,
        lineHeight: 18,
    },
    officeRemindersContainer: {
        backgroundColor: Colors.inputBg,
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: Colors.blueInfo,
    },
    officeRemindersTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.blueInfo,
        marginBottom: 10,
        textAlign: 'center',
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reminderNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.churchGreenPrimary,
        marginRight: 8,
        minWidth: 15,
    },
    reminderText: {
        flex: 1,
        fontSize: 12,
        color: Colors.churchGreenDarkText,
        lineHeight: 16,
    },
    boldText: {
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
    },
    // BAPTISM TYPE SELECTION STYLES
    typeSelectionContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.pureWhite,
    },
    typeSelectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        textAlign: 'center',
        marginBottom: 10,
    },
    typeSelectionSubtitle: {
        fontSize: 16,
        color: Colors.churchGrayText,
        textAlign: 'center',
        marginBottom: 30,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pureWhite,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    typeIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    typeContent: {
        flex: 1,
    },
    typeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginBottom: 5,
    },
    typeFee: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.churchGreenPrimary,
        marginBottom: 5,
    },
    typeSchedule: {
        fontSize: 14,
        color: Colors.churchGrayText,
        marginBottom: 8,
    },
    timeChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeChip: {
        backgroundColor: Colors.churchGreenLightBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 5,
        marginBottom: 5,
    },
    timeChipText: {
        fontSize: 12,
        color: Colors.churchGreenDarkText,
        fontWeight: '500',
    },
    // TIME SELECTION STYLES
    timeSelectionContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 15,
    },
    timeSlot: {
        backgroundColor: Colors.churchGreenLightBg,
        padding: 15,
        margin: 5,
        borderRadius: 10,
        minWidth: 100,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    timeSlotText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.churchGreenDarkText,
    },
    noTimesText: {
        fontSize: 14,
        color: Colors.churchGrayText,
        textAlign: 'center',
        marginVertical: 20,
    },
    selectedTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    selectedTimeText: {
        fontSize: 14,
        color: Colors.churchGreenPrimary,
        fontWeight: '600',
        marginLeft: 5,
    },
    // SCHEDULE PREVIEW STYLES
    schedulePreview: {
        backgroundColor: Colors.churchGreenLightBg,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: Colors.churchGreenPrimary,
    },
    schedulePreviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginBottom: 10,
    },
    schedulePreviewDetails: {
        marginBottom: 10,
    },
    schedulePreviewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    schedulePreviewText: {
        fontSize: 14,
        color: Colors.churchGreenDarkText,
        marginLeft: 8,
    },
    changeScheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    changeScheduleText: {
        fontSize: 12,
        color: Colors.churchGreenPrimary,
        marginLeft: 5,
        fontWeight: '500',
    },
    scheduleDisplay: {
        flex: 1,
    },
    timeDisplayText: {
        fontSize: 12,
        marginTop: 2,
    },
    // FINAL REMINDERS MODAL STYLES
    finalRemindersScrollView: {
        width: '100%',
        maxHeight: height * 0.6,
        marginBottom: 15,
    },
    finalReminderTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        textAlign: 'center',
        marginBottom: 20,
    },
    finalReminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        padding: 12,
        backgroundColor: Colors.churchGreenLightBg,
        borderRadius: 8,
    },
    finalReminderNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.churchGreenPrimary,
        marginRight: 10,
        minWidth: 20,
    },
    finalReminderText: {
        flex: 1,
        fontSize: 14,
        color: Colors.churchGreenDarkText,
        lineHeight: 20,
    },
    officeRemindersSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: Colors.redError,
    },
    officeReminderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.redError,
        textAlign: 'center',
        marginBottom: 15,
    },
    officeReminderItem: {
        marginBottom: 8,
    },
    officeReminderText: {
        fontSize: 14,
        color: Colors.churchGreenDarkText,
        lineHeight: 18,
        textAlign: 'center',
    },
    proceedReminder: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.churchGreenLightBg,
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: Colors.churchGreenPrimary,
    },
    proceedReminderText: {
        flex: 1,
        fontSize: 14,
        color: Colors.churchGreenDarkText,
        marginLeft: 10,
        fontWeight: '600',
        lineHeight: 18,
    },
    scheduleSummary: {
        marginTop: 20,
        padding: 15,
        backgroundColor: Colors.churchGreenLightBg,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: Colors.churchGreenPrimary,
    },
    scheduleSummaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginBottom: 10,
        textAlign: 'center',
    },
    scheduleDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    scheduleText: {
        fontSize: 14,
        color: Colors.churchGreenDarkText,
        marginLeft: 10,
    },
    finalModalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
    },
    finalModalButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    finalModalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.pureWhite,
        marginLeft: 10,
    },
    // INITIAL REMINDERS MODAL STYLES
    remindersScrollView: {
        width: '100%',
        maxHeight: height * 0.6,
        marginBottom: 15,
    },
    reminderSection: {
        marginBottom: 20,
    },
    reminderSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginBottom: 10,
        textAlign: 'center',
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        padding: 10,
        backgroundColor: Colors.churchGreenLightBg,
        borderRadius: 8,
    },
    reminderNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.churchGreenPrimary,
        marginRight: 10,
        minWidth: 20,
    },
    reminderText: {
        flex: 1,
        fontSize: 14,
        color: Colors.churchGreenDarkText,
        lineHeight: 20,
    },
    selectedTypeInfo: {
        backgroundColor: Colors.churchGreenLightBg,
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: Colors.churchGreenPrimary,
        marginTop: 10,
    },
    selectedTypeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.churchGrayText,
        marginBottom: 5,
    },
    selectedTypeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginBottom: 5,
    },
    selectedTypeFee: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.churchGreenPrimary,
    },
    selectedTypeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.churchGreenPrimary,
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
    },
    selectedTypeBannerText: {
        color: Colors.pureWhite,
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
    baptismTypeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.churchGreenLightBg,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: Colors.churchGreenPrimary,
    },
    baptismTypeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.churchGreenDarkText,
        marginLeft: 10,
    },
    // EXISTING STYLES
    scheduledCard: {
        padding: 20, 
        borderRadius: 15, 
        backgroundColor: Colors.pureWhite, 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 5, 
        elevation: 5,
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
        lineHeight: 20,
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
        width: '100%',
    },
    cancelButtonText: {
        fontSize: 16, 
        fontWeight: 'bold', 
        color: Colors.pureWhite,
    },
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
    calendarInstruction: {
        fontSize: 14, 
        color: Colors.churchGrayText, 
        textAlign: 'center', 
        marginBottom: 15,
    },
    datePickerWrapper: {
        marginBottom: 15,
    },
    datePickerButton: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: 60, 
        borderRadius: 10, 
        paddingHorizontal: 12, 
        borderWidth: 1,
        backgroundColor: Colors.inputBg,
    },
    dateLabel: {
        fontSize: 14, 
        fontWeight: '600', 
        marginBottom: 5, 
        marginLeft: 2, 
        color: Colors.churchGreenDarkText 
    },
    header: {
        width: '100%',
        paddingTop: Platform.OS === 'android' ? 30 : 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBorder,
        marginBottom: 10,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 30 : 50,
        left: 15,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        paddingBottom: 50,
    },
    sectionCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        backgroundColor: Colors.pureWhite,
        shadowColor: '#000',
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
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.pureWhite,
    },
    calendarOverlay: {
        flex: 1,
        marginVertical: 20,
        alignItems: 'center',
        backgroundColor: Colors.pureWhite,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        padding: 20,
        marginHorizontal: 20,
    },
    calendarOverlayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: Colors.churchGreenDarkText,
    },
    selectedDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 25,
        backgroundColor: Colors.churchGreenLightBg,
        borderColor: Colors.churchGreenPrimary,
        borderWidth: 2,
        width: '100%',
        padding: 10,
        borderRadius: 8,
    },
    selectedDateText: {
        color: Colors.churchGreenDarkText,
        fontWeight: 'bold',
    },
    confirmDateButton: {
        width: '100%',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.churchGreenDarkText,
    },
    modalSubTitle: {
        fontSize: 14,
        marginBottom: 15,
        color: Colors.churchGrayText,
        textAlign: 'center',
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
        backgroundColor: Colors.pureWhite,
    },
    modalCancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.churchGrayText,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.pureWhite,
    },
    successButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '100%',
        marginTop: 20,
    }
});
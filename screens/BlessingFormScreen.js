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
  Image 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');

// --- Color Palette and Constants ---
const COLOR_PRIMARY_DARK = '#004D40'; // Deep Emerald Green (Header, Labels)
const COLOR_ACCENT = '#4CAF50';       // Vibrant Green (Buttons, Highlights)
const COLOR_LIGHT = '#DCEDC8';        // Pale Green (Section Background)
const COLOR_BACKGROUND = '#F4F8F4';   // Light Off-White/Greenish
const COLOR_TEXT_DARK = '#212121';
const COLOR_TEXT_LIGHT = '#FAFAFA';

const USER_STORAGE_KEY = '@userData';

const BlessingFormScreen = () => {
    const blessingOptions = ['HOUSE', 'BUSINESS', 'TRUCK', 'FUNERAL', 'OTHER'];

    const [formData, setFormData] = useState({
        name: '',
        blessingType: '',
        requestForDetails: '',
        address: '',
        contactNumber: '',
        date: '',
        time: ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Load user data on component mount
    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (userData) {
                    const user = JSON.parse(userData);
                    setUserEmail(user.email);
                    console.log('👤 Current user:', user.email);
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

    const handleTypeSelect = (type) => {
        setFormData(prev => ({
            ...prev,
            blessingType: type,
            requestForDetails: type !== 'OTHER' ? '' : prev.requestForDetails
        }));
    };

    // Date Picker Functions
    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            // Format date as MM/DD/YYYY
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
            handleInputChange('date', formattedDate);
        }
    };

    // Time Picker Functions
    const showTimePickerModal = () => {
        setShowTimePicker(true);
    };

    const onTimeChange = (event, time) => {
        setShowTimePicker(false);
        if (time) {
            setSelectedTime(time);
            // Format time as HH:MM AM/PM
            let hours = time.getHours();
            let minutes = time.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedTime = `${hours}:${minutes} ${ampm}`;
            handleInputChange('time', formattedTime);
        }
    };

    const handleSubmit = async () => {
        // Check required fields
        if (!formData.name || !formData.address || !formData.contactNumber || !formData.date || !formData.time || !formData.blessingType) {
            Alert.alert('Kulang sa Porma', 'Paki-kumpleto po ang inyong Pangalan, Address, Contact, Petsa, Oras, at Piliin ang Uri ng Pagbasbas.');
            return;
        }
        
        // Check if 'OTHER' is selected but details are missing
        if (formData.blessingType === 'OTHER' && !formData.requestForDetails.trim()) {
            Alert.alert('Kulang sa Porma', 'Pakisulat po ang detalye para sa "Ibang Bagay" na babasbasan.');
            return;
        }

        // Check if user is logged in
        if (!userEmail) {
            Alert.alert('Login Required', 'Please login first before submitting a blessing request.');
            return;
        }

        setIsSubmitting(true);

        try {
            const submissionData = {
                name: formData.name,
                blessingType: formData.blessingType,
                requestForDetails: formData.requestForDetails || '',
                address: formData.address,
                contactNumber: formData.contactNumber,
                date: formData.date,
                time: formData.time,
                displayDate: formData.date,
                displayTime: formData.time,
                status: 'pending',
                submittedByEmail: userEmail, // CRITICAL: Add user email
                createdAt: new Date().toISOString(),
                requestNumber: `BLESS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
            };

            console.log('📤 Submitting Blessing request:', submissionData);

            const response = await fetch('http://192.168.1.42:5000/api/blessing_requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            Alert.alert(
                'Tagumpay! 🎉', 
                `Matagumpay na naipadala ang inyong kahilingan!\n\n📋 Request Number: ${result.requestNumber}\n📅 Petsa: ${formData.date}\n⏰ Oras: ${formData.time}\n\nKokontakin po namin kayo para sa kumpirmasyon.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form data after successful submission
                            setFormData({
                                name: '',
                                blessingType: '',
                                requestForDetails: '',
                                address: '',
                                contactNumber: '',
                                date: '',
                                time: ''
                            });
                            setSelectedDate(new Date());
                            setSelectedTime(new Date());
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

    const isOtherSelected = formData.blessingType === 'OTHER';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerTitles}>
                    <Text style={styles.dioceseText}>DIOCESE OF ANTIPOLO</Text>
                    <Text style={styles.parishText}>SAN JOSE MANGGAGAWA PARISH</Text>
                    <Text style={styles.addressText}>San Jose, Rodriguez, Rizal</Text>
                    <Text style={styles.contactText}>Cellphone No.: 0967-431-6482</Text>
                </View>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/LOGO.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Form Card Container */}
            <View style={styles.formCard}>
                <Text style={styles.formTitle}>ONLINE BLESSING REQUEST FORM</Text>
                <Text style={styles.formSubtitle}>Paki-fill out po ang mga sumusunod na impormasyon:</Text>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PANGALAN (NAME):</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Juan Dela Cruz"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Blessing Type Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>HINIHINGING PAGBASBAS (REQUEST FOR BLESSING OF):</Text>
                    <View style={styles.typeSelectionContainer}>
                        {blessingOptions.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    formData.blessingType === type && styles.typeButtonSelected,
                                ]}
                                onPress={() => handleTypeSelect(type)}
                            >
                                <Text style={[
                                    styles.typeButtonText,
                                    formData.blessingType === type && styles.typeButtonTextSelected,
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                
                {/* Other Details Input (Conditionally rendered) */}
                {isOtherSelected && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>IBANG DETALYE (OTHER DETAILS):</Text>
                        <TextInput
                            style={[styles.textInput, styles.multilineInput]}
                            value={formData.requestForDetails}
                            onChangeText={(text) => handleInputChange('requestForDetails', text)}
                            placeholder="e.g., Bagong Motorsiklo, Rebulto, Unit 3B ng Apartment"
                            placeholderTextColor="#999"
                            multiline
                        />
                    </View>
                )}

                {/* Address Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ADDRESS:</Text>
                    <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={formData.address}
                        onChangeText={(text) => handleInputChange('address', text)}
                        placeholder="Kumpletong address (House No., Street, Barangay)"
                        placeholderTextColor="#999"
                        multiline
                    />
                </View>

                {/* Contact Number Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CONTACT NUMBER:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.contactNumber}
                        onChangeText={(text) => handleInputChange('contactNumber', text)}
                        placeholder="09xx-xxx-xxxx"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        maxLength={11}
                    />
                </View>

                {/* Date and Time Group - Scheduling Card Design */}
                <View style={styles.dateTimeGroupContainer}>
                    <Text style={styles.dateTimeHeader}>Iskedyul ng Pagbasbas (SCHEDULE PREFERENCE) </Text>
                    <View style={styles.dateTimeGroup}>
                        {/* Date Picker */}
                        <View style={[styles.inputGroup, styles.halfWidthInput, { marginBottom: 0 }]}>
                            <Text style={styles.label}>Nais na Petsa (PREFERRED DATE):</Text>
                            <TouchableOpacity 
                                style={[
                                    styles.pickerButton, 
                                    formData.date && styles.pickerButtonFilled
                                ]} 
                                onPress={showDatePickerModal}
                            >
                                <Text style={formData.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                                    {formData.date || 'Piliin ang Petsa'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Time Picker */}
                        <View style={[styles.inputGroup, styles.halfWidthInput, { marginBottom: 0 }]}>
                            <Text style={styles.label}>Nais na Oras (PREFERRED TIME):</Text>
                            <TouchableOpacity 
                                style={[
                                    styles.pickerButton,
                                    formData.time && styles.pickerButtonFilled
                                ]} 
                                onPress={showTimePickerModal}
                            >
                                <Text style={formData.time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                                    {formData.time || 'Piliin ang Oras'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Date Time Pickers */}
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
                        is24Hour={false}
                    />
                )}

                {/* Submit Button */}
                <TouchableOpacity 
                    style={[
                        styles.submitButton, 
                        isSubmitting && styles.submitButtonDisabled
                    ]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Text style={styles.submitButtonText}>ISINUSUMITE...</Text>
                    ) : (
                        <Text style={styles.submitButtonText}>IPASA ANG KAHILINGAN (SUBMIT REQUEST)</Text>
                    )}
                </TouchableOpacity>

                {/* User Info */}
                {userEmail && (
                    <View style={styles.userInfo}>
                        <Text style={styles.userInfoText}>Submitting as: {userEmail}</Text>
                    </View>
                )}

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>📋 Mahalagang Paalala:</Text>
                    <Text style={styles.instructionItem}>• Ang schedule ay subject sa availability ng pari</Text>
                    <Text style={styles.instructionItem}>• Kokontakin ka namin para sa kumpirmasyon</Text>
                    <Text style={styles.instructionItem}>• Magdala ng mga kailangan para sa seremonya</Text>
                </View>
            </View>
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Global Container
    container: {
        flex: 1,
        backgroundColor: COLOR_BACKGROUND,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    
    userInfo: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    userInfoText: {
        fontSize: 12,
        color: '#1976d2',
        fontWeight: '500',
    },
    // Header Styles
    header: {
        backgroundColor: COLOR_PRIMARY_DARK, 
        paddingVertical: 30,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    headerTitles: {
        flex: 1,
    },
    dioceseText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLOR_ACCENT,
        letterSpacing: 1.5,
    },
    parishText: {
        fontSize: 24,
        fontWeight: '900',
        color: COLOR_TEXT_LIGHT,
        marginBottom: 3,
        marginTop: 2,
    },
    addressText: {
        fontSize: 12,
        color: '#BDBDBD',
    },
    contactText: {
        fontSize: 12,
        color: '#BDBDBD',
        marginTop: 8,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
        borderWidth: 3,
        borderColor: COLOR_ACCENT,
        padding: 5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
    },

    // Form Card Styles
    formCard: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 25,
        borderRadius: 16,
        marginTop: -30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLOR_PRIMARY_DARK,
        textAlign: 'center',
        marginBottom: 5,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#616161',
        textAlign: 'center',
        marginBottom: 25,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    // Input Field Styles
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_PRIMARY_DARK,
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: COLOR_TEXT_DARK,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    
    // Blessing Type Selection Styles
    typeSelectionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    typeButton: {
        width: (width - 80) / 3,
        padding: 10,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
    },
    typeButtonSelected: {
        borderColor: COLOR_ACCENT,
        backgroundColor: COLOR_LIGHT,
        borderWidth: 2,
    },
    typeButtonText: {
        fontSize: 12,
        fontWeight: '450',
        color: COLOR_TEXT_DARK,
        textAlign: 'center',
    },
    typeButtonTextSelected: {
        color: COLOR_PRIMARY_DARK,
        fontWeight: 'bold',
    },

    // Date and Time Grouping
    dateTimeGroupContainer: {
        marginBottom: 20,
        padding: 18,
        borderRadius: 10,
        backgroundColor: COLOR_LIGHT,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    dateTimeHeader: {
        fontSize: 16,
        fontWeight: '500',
        color: COLOR_PRIMARY_DARK,
        marginBottom: 15,
    },
    dateTimeGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidthInput: {
        width: '49%',
        marginBottom: 0,
    },

    // Picker Button Styles
    pickerButton: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 15,
        padding: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonFilled: {
        borderColor: COLOR_ACCENT,
        backgroundColor: '#F1F8E9',
    },
    pickerButtonText: {
        fontSize: 16,
        color: COLOR_TEXT_DARK,
        fontWeight: '600',
    },
    pickerButtonPlaceholder: {
        fontSize: 16,
        color: '#666',
    },
    calendarIcon: {
        fontSize: 18,
    },
    clockIcon: {
        fontSize: 18,
    },

    // Submit Button Styles
    submitButton: {
        backgroundColor: COLOR_ACCENT,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 35,
        ...Platform.select({
            ios: {
                shadowColor: COLOR_ACCENT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    submitButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    submitButtonText: {
        color: COLOR_TEXT_LIGHT,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },

    // Instructions Card
    instructionsCard: {
        backgroundColor: '#FFF3E0',
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 8,
    },
    instructionItem: {
        fontSize: 12,
        color: '#E65100',
        marginBottom: 4,
        lineHeight: 16,
    },
});

export default BlessingFormScreen;
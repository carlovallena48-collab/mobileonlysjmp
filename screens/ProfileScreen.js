import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Pressable,
    ActivityIndicator,
    Image,
    Dimensions,
    Alert,
    TextInput,
    Animated,
    Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'; 

const { height, width } = Dimensions.get("window");

// 🎨 PREMIUM GREEN & GOLD COLOR PALETTE
const COLORS = {
    primary: "#059669",       // Emerald Green
    primaryLight: "#10b981",  // Green
    secondary: "#f59e0b",     // Amber
    accent: "#22d3ee",        // Cyan
    background: "#f0fdf4",    // Soft Green Background
    cardBackground: "#ffffff",
    textDark: "#1c1917",
    textGray: "#57534e",
    success: "#16a34a",       // Green
    danger: "#dc2626",        // Red
    warning: "#d97706",       // Amber
    borderColor: "#d1fae5",
};

// ✨ ANIMATION VALUES
const fadeAnim = new Animated.Value(0);
const slideAnim = new Animated.Value(50);

// 🎯 SETTING OPTIONS WITH BETTER ICONS
const settingOptions = {
    account: [
        { name: "Full Name", key: "fullName", icon: "person" },
        { name: "Email", key: "email", icon: "at" },
        { name: "Address", key: "address", icon: "location" },
        { name: "Contact", key: "contact", icon: "call" },
        { name: "Role", key: "role", icon: "ribbon" },
    ],
    security: [
        { name: "Change Password", icon: "lock-closed", key: "changePassword" },
    ],
    support: [ 
        { name: "Privacy Policy", icon: "shield-checkmark", key: "privacy" },
        { name: "Terms of Service", icon: "document-text", key: "terms" },
    ]
};

// ✨ ENHANCED INFO ROW COMPONENT
const InfoRow = ({ label, value, icon, isClickable = false, onPress }) => {
    const isLogout = label === "Log Out";
    const [scaleValue] = useState(new Animated.Value(1));
    
    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const clickable = isClickable || isLogout;
    
    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                style={[
                    styles.optionRow,
                    isLogout && styles.logoutRow
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!clickable}
                activeOpacity={clickable ? 0.8 : 1}
            >
                <LinearGradient
                    colors={isLogout ? 
                        ['#fef2f2', '#fecaca'] : 
                        ['#dcfce7', '#bbf7d0']
                    }
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons 
                        name={icon} 
                        size={22}
                        color={isLogout ? COLORS.danger : COLORS.primary}
                    />
                </LinearGradient>
                
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.optionLabel,
                        isLogout && { color: COLORS.danger }
                    ]}>
                        {label}
                    </Text>
                    <Text 
                        style={[
                            styles.optionValue, 
                            { 
                                color: isLogout ? COLORS.danger : 
                                (label === 'Email' || label === 'Role' ? COLORS.textGray : COLORS.textDark) 
                            }
                        ]}
                        numberOfLines={1}
                    >
                        {value}
                    </Text>
                </View>
                
                {clickable && label !== "Email" && ( 
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isLogout ? COLORS.danger : COLORS.primary}
                    />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// ✨ PREMIUM MODAL COMPONENT - IMPROVED TOUCH AREA
const PrivacyAndTermsModal = ({ title, content, onClose, isVisible }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (isVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Animated.View 
                    style={[
                        styles.legalModalView,
                        { opacity: fadeAnim }
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight]}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity 
                            onPress={onClose} 
                            style={styles.closeIcon}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>
                    
                    <ScrollView 
                        style={styles.legalScroll}
                        showsVerticalScrollIndicator={true}
                    >
                        {content.split('\n\n').map((paragraph, index) => (
                            <Text key={index} style={styles.legalText}>
                                {paragraph}
                            </Text>
                        ))}
                    </ScrollView>
                    
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                      <TouchableOpacity
    style={styles.closeDocumentContainer}
    onPress={onClose}
    activeOpacity={0.8}
>
    <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.closeDocumentButton}
    >
        <Text style={styles.closeDocumentText}>Close Document</Text>
    </LinearGradient>
</TouchableOpacity>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

// 🎭 MAIN PROFILE SCREEN COMPONENT
const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState('none'); 
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false); 
    const [editedUser, setEditedUser] = useState({});
    const [isProfileUpdating, setIsProfileUpdating] = useState(false); 
    const [headerScroll] = useState(new Animated.Value(0));
    
    const navigation = useNavigation();
    
    const API_BASE_URL = `http://192.168.100.199:5000`; 
    const PROFILE_IMAGE_DEFAULT = "https://i.ibb.co/L95zB7X/emojiprofile.png";
    const ASYNC_IMAGE_KEY_PREFIX = "@user_profile_image_";

    // Header animation
    const headerHeight = headerScroll.interpolate({
        inputRange: [0, 100],
        outputRange: [height * 0.35, height * 0.2],
        extrapolate: 'clamp',
    });

    const headerOpacity = headerScroll.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

      // ✨ LEGAL CONTENT (Same as before)
      // --- LEGAL CONTENT ---
const PRIVACY_POLICY_CONTENT = `PRIVACY POLICY
San Jose Manggagawa Parish (SJMP)

Last Updated: ${new Date().getFullYear()}

1. INTRODUCTION
San Jose Manggagawa Parish ("we," "our," or "the Parish") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services.

2. INFORMATION WE COLLECT

2.1 Personal Information
- Full Name
- Email Address
- Contact Number
- Residential Address
- Profile Photograph
- Sacramental Records (Baptism, Confirmation, Marriage, etc.)
- Mass and Event Attendance
- Prayer Requests and Intentions

2.2 Technical Information
- Device Information
- App Usage Statistics
- Authentication Data

2.3 NO FINANCIAL DATA COLLECTION
Important: This application does NOT collect, process, or store any financial information. All financial transactions including donations, fees, and payments are handled exclusively through the Parish Office via direct personal transactions.

3. HOW WE USE YOUR INFORMATION

3.1 Parish Operations
- Managing sacramental records and certificates
- Coordinating parish events and activities
- Processing event registrations and reservations
- Sending important parish announcements and updates
- Facilitating prayer requests and spiritual support

3.2 Communication
- Sending religious and spiritual content
- Notifying about mass schedules and special events
- Providing pastoral care and follow-up
- Sharing parish news and community updates

3.3 Legal and Administrative
- Maintaining official parish records
- Complying with canonical and civil law requirements
- Generating statistical reports for diocesan requirements

4. DATA SHARING AND DISCLOSURE

4.1 Within the Church
- Parish priests and staff for ministerial purposes
- Diocese officials for canonical records
- Volunteer ministers for specific pastoral activities

4.2 Third-Party Services
- Cloud storage providers for data backup
- Communication platforms for parish announcements

4.3 Legal Requirements
We may disclose your information when required by:
- Canon Law requirements
- Civil legal obligations
- Protection of vital interests

5. DATA SECURITY

We implement appropriate technical and organizational measures to protect your personal information, including:
- Encryption of sensitive data
- Secure server infrastructure
- Regular security assessments
- Access controls and authentication
- Staff training on data protection

6. DATA RETENTION

We retain your personal information for:
- Sacramental records: Permanently (as required by Canon Law)
- General parish records: While you remain an active member
- Inactive accounts: 5 years after last activity

7. YOUR RIGHTS

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of non-essential data
- Object to certain processing activities
- Request data portability
- Withdraw consent where applicable

8. CHILDREN'S PRIVACY

We are especially careful with children's data:
- Parental consent required for minors under 13
- Limited data collection for children
- Special protection for sacramental records
- Parental access and control over children's data

9. PHOTOGRAPHS AND MEDIA

By using our services, you agree that:
- Profile photos may be used for internal identification
- Event photos may be used in parish publications
- You may opt-out of public media usage
- Consent can be withdrawn at any time

10. FINANCIAL TRANSACTIONS

IMPORTANT NOTICE: All financial matters including:
- Donations and offerings
- Mass stipends and intentions
- Sacramental fees and offerings
- Event registration fees
- Other financial contributions

Are processed EXCLUSIVELY through the San Jose Manggagawa Parish Office during office hours. This mobile application does not handle any financial transactions.

11. CHANGES TO THIS POLICY

We may update this policy to reflect:
- Changes in Canon Law
- Updates to civil data protection laws
- Improvements to our services
- User feedback and needs

12. CONTACT INFORMATION

For privacy-related concerns, contact:
San Jose Manggagawa Parish Data Protection Officer
Email: sanjosemanggagawaparish@gmail.com    
Phone: 0967074316482
Address: E. Rodriguez Highway, Cor. E. Manuel St., Brgy. San Jose, Rodriguez, Rizal

13. DIOCESAN OVERSIGHT

This privacy policy operates under the guidance and approval of the Diocese of [Your Diocese Name] and complies with both Canon Law and applicable data protection regulations.

14. SPIRITUAL COMMITMENT

As a Catholic parish, we treat your personal information with the same respect and dignity we accord to every individual as children of God. We are committed to being good stewards of the information entrusted to us.

15. CONSENT

By using our mobile application and services, you consent to the collection and use of your information as described in this Privacy Policy.

"Whatever you do, do everything for the glory of God." - 1 Corinthians 10:31`;

const TERMS_OF_SERVICE_CONTENT = `TERMS OF SERVICE
San Jose Manggagawa Parish Mobile Application

Last Updated: ${new Date().getFullYear()}

1. ACCEPTANCE OF TERMS
By accessing and using the San Jose Manggagawa Parish mobile application ("the App"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use our App.

2. DESCRIPTION OF SERVICE
The App provides:
- Access to parish information and schedules
- Sacramental record management
- Event registration and management
- Prayer request submission
- Spiritual content and resources
- Parish community communication
- Mass and event notifications

IMPORTANT: This App does NOT provide financial transaction capabilities. All donations and payments must be made directly at the Parish Office.

3. USER ACCOUNTS

3.1 Registration
To access certain features, you must register an account providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.

3.2 Account Types
- Parishioner Accounts: For general parish members
- Volunteer Accounts: For ministry volunteers
- Staff Accounts: For parish employees and clergy
- Administrative Accounts: For parish leadership

3.3 Account Security
You are responsible for all activities under your account. Notify us immediately of any unauthorized use.

4. ACCEPTABLE USE

4.1 Permitted Uses
- Religious and spiritual purposes
- Parish community engagement
- Sacramental preparation and follow-up
- Event registration and coordination
- Personal spiritual growth
- Prayer request submissions

4.2 Prohibited Activities
- Commercial advertising or solicitation
- Harassment or offensive behavior
- Distribution of malicious software
- Unauthorized data collection
- Impersonation of parish staff
- Distribution of heretical content
- Disruption of App functionality
- Attempting financial transactions through the App

5. FINANCIAL TRANSACTIONS POLICY

5.1 No In-App Payments
This application strictly does NOT support:
- Online donations
- Digital payments
- Financial transfers
- Electronic fund transactions
- Credit/debit card processing

5.2 Official Payment Channels
All financial matters must be conducted through:
- Personal transactions at Parish Office
- Direct bank deposits (with office notification)
- Check payments at the office
- Cash offerings during masses/events

5.3 Donation Information
For donations and financial contributions, please:
- Visit the Parish Office during office hours
- Contact parish staff for assistance
- Use official parish banking channels
- Request official receipts for transactions

6. INTELLECTUAL PROPERTY

6.1 Parish Content
All content provided through the App, including:
- Religious texts and teachings
- Parish publications
- Sacramental materials
- Spiritual resources
remains the property of San Jose Manggagawa Parish or its licensors.

6.2 User Content
By submitting content, you grant the Parish a license to use it for parish-related purposes while respecting your privacy and applicable laws.

7. PRIVACY AND DATA PROTECTION

Your use of the App is governed by our Privacy Policy, which explains how we collect, use, and protect your personal information in accordance with:
- Canon Law requirements
- Data protection regulations
- Diocesan policies
- Catholic ethical standards

8. SACRAMENTAL VALIDITY

The App facilitates sacramental preparation and record-keeping but does not:
- Replace proper sacramental formation
- Substitute for personal pastoral care
- Guarantee sacramental validity
- Replace canonical requirements

9. LIMITATION OF LIABILITY

San Jose Manggagawa Parish is not liable for:
- Technical failures or interruptions
- Errors in displayed information
- User misconduct or violations
- Third-party service issues
- Spiritual outcomes or consequences
- Financial matters (handled separately through office)

10. TERMINATION

We may suspend or terminate your access for:
- Violation of these terms
- Fraudulent or abusive behavior
- Legal or canonical requirements
- Parish disciplinary matters

11. DISPUTE RESOLUTION

Any disputes shall be resolved through:
- Pastoral dialogue and reconciliation
- Diocesan mediation processes
- Canonical procedures where applicable

12. MODIFICATIONS TO TERMS

We reserve the right to modify these terms to reflect:
- Changes in Church teaching
- Updates to Canon Law
- Technological improvements
- User needs and feedback

13. DIOCESAN AUTHORITY

These terms operate under the authority of the Diocese of [Your Diocese Name] and are subject to diocesan review and approval.

14. SPIRITUAL RESPONSIBILITY

Users are expected to:
- Maintain Christian charity in all interactions
- Respect Catholic teaching and tradition
- Support the mission of the Parish
- Use the App for spiritual growth

15. CONTACT INFORMATION

For questions about these terms, contact:
San Jose Manggagawa Parish
Email: sanjosemanggagawawparish@gmail.com   
Phone: 09674316482
Address: E. Rodriguez Highway, Cor. E. Manuel St., Brgy. San Jose, Rodriguez, Rizal

16. FINANCIAL OFFICE INFORMATION

For all financial transactions, please visit:
San Jose Manggagawa Parish Office
Office Hours: 8am to 12nn & 2pm to 5pm - Tuesday to Saturday
Location: E. Rodriguez Highway, Cor. E. Manuel St., Brgy. San Jose, Rodriguez, Rizal
Contact: 09674316482

17. SEVERABILITY

If any provision of these terms is found invalid, the remaining provisions shall remain in full force and effect.

18. GOVERNING LAW

These terms are governed by:
- Code of Canon Law
- Catholic Church teaching
- Applicable civil laws
- Diocesan statutes

"Let all that you do be done in love." - 1 Corinthians 16:14

By using the San Jose Manggagawa Parish mobile application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.`;
  
    // 🚀 ENHANCED FETCH PROFILE
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const storedUserString = await AsyncStorage.getItem("@userData");
            if (!storedUserString) {
                setLoading(false);
                return;
            }

            const parsedUser = JSON.parse(storedUserString);
            const userEmail = parsedUser.email;
            
            const localImageUri = await AsyncStorage.getItem(`${ASYNC_IMAGE_KEY_PREFIX}${userEmail}`);
            
            let profileData = {
                fullName: parsedUser.fullName || "User Name",
                email: userEmail,
                address: "N/A",
                contact: "N/A",
                role: "Guest",
                profileImage: localImageUri || parsedUser.profileImage || PROFILE_IMAGE_DEFAULT
            };
            
            try {
                const API_URL = `${API_BASE_URL}/api/profile/${userEmail}`;
                const res = await axios.get(API_URL);

                profileData = {
                    ...profileData, 
                    ...res.data, 
                    profileImage: localImageUri || res.data.profileImage || PROFILE_IMAGE_DEFAULT
                };

            } catch (err) {
                console.warn("API Connection Warning: Could not fetch latest profile data. Using local storage data.");
            }
            
            setUser(profileData);
            
            // Start animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                })
            ]).start();
            
        } catch (err) {
            console.error("Error fetching profile:", err.message);
            const fallbackUser = JSON.parse(await AsyncStorage.getItem("@userData") || '{}');
            setUser({
                fullName: fallbackUser.fullName || "User Name",
                email: fallbackUser.email || "user@example.com",
                address: "N/A (API Error)",
                contact: "N/A",
                role: "Guest",
                profileImage: PROFILE_IMAGE_DEFAULT,
            });
        } finally {
            setLoading(false);
        }
    };
    
    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    // 🔐 ENHANCED CHANGE PASSWORD
    const handleChangePassword = async () => {
        if (isUpdatingPassword) return;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("⚠️ Missing Fields", "Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("🔒 Password Mismatch", "New password and confirmation do not match.");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("🔒 Weak Password", "New password must be at least 6 characters long.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const API_URL = `${API_BASE_URL}/api/change-password/${user.email}`; 
            
            const response = await axios.put(API_URL, {
                currentPassword: oldPassword,
                newPassword: newPassword,
            });

            if (response.data.success) {
                Alert.alert("🎉 Success", "Your password has been successfully updated!");
                setModalType('none'); 
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                 Alert.alert("❌ Update Failed", response.data.message || "Could not update password. Please check your current password.");
            }

        } catch (err) {
            console.error("Password update error:", err.response?.data || err.message);
            Alert.alert(
                "🌐 Connection Error", 
                err.response?.data?.message || "Failed to connect to the server. Please try again."
            );
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // 🖼️ ENHANCED IMAGE PICKER
    const handleImageChange = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('📸 Permission Required', 'We need camera roll permissions to update your profile picture.');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const localUri = result.assets[0].uri;
                setEditedUser(prev => ({...prev, profileImage: localUri}));
            }
        } catch (error) {
            console.error("Image Picker Error:", error);
            Alert.alert("❌ Error", "Failed to select image. Please try again.");
        }
    };

    // 📝 UPDATE PROFILE
    const handleUpdateProfile = async () => {
        if (isProfileUpdating) return;

        if (!editedUser.fullName || !editedUser.address || !editedUser.contact) {
            Alert.alert("⚠️ Incomplete Information", "Please fill in all required fields (Name, Address, Contact).");
            return;
        }
        
        setIsProfileUpdating(true);
        try {
            const isImageNew = editedUser.profileImage.startsWith('file://');
            
            if (isImageNew) {
                const formData = new FormData();
                formData.append('fullName', editedUser.fullName);
                formData.append('address', editedUser.address);
                formData.append('contact', editedUser.contact);

                const filename = editedUser.profileImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                formData.append('profileImage', {
                    uri: editedUser.profileImage,
                    type: type,
                    name: filename || 'profile.jpg'
                });

                const API_URL = `${API_BASE_URL}/api/profile/${user.email}`;
                const response = await axios.put(API_URL, formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 30000
                });

                if (response.data && response.data.success) {
                    await AsyncStorage.setItem(`${ASYNC_IMAGE_KEY_PREFIX}${user.email}`, editedUser.profileImage);
                    
                    const updatedData = {
                        fullName: editedUser.fullName,
                        address: editedUser.address,
                        contact: editedUser.contact,
                        profileImage: response.data.user?.profileImage || editedUser.profileImage,
                    };
                    
                    setUser(prevUser => ({ ...prevUser, ...updatedData }));
                    await AsyncStorage.setItem("@userData", JSON.stringify({ 
                        ...JSON.parse(await AsyncStorage.getItem("@userData") || '{}'), 
                        ...updatedData 
                    }));

                    Alert.alert("🎉 Success", "Profile successfully updated!");
                    setModalType('none');
                } else {
                    Alert.alert("❌ Update Failed", response.data?.message || "Could not update profile.");
                }
            } else {
                const textData = { fullName: editedUser.fullName, address: editedUser.address, contact: editedUser.contact };
                const API_URL = `${API_BASE_URL}/api/profile/${user.email}`;
                const response = await axios.put(API_URL, textData, { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                });

                if (response.data) {
                    const updatedData = { ...textData, profileImage: editedUser.profileImage };
                    setUser(prevUser => ({ ...prevUser, ...updatedData }));
                    await AsyncStorage.setItem("@userData", JSON.stringify({ 
                        ...JSON.parse(await AsyncStorage.getItem("@userData") || '{}'), 
                        ...updatedData 
                    }));

                    Alert.alert("🎉 Success", "Profile successfully updated!");
                    setModalType('none');
                } else {
                    Alert.alert("❌ Update Failed", response.data?.message || "Could not update profile.");
                }
            }

        } catch (err) {
            console.error("❌ Profile update error:", err);
            Alert.alert("❌ Update Error", err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsProfileUpdating(false);
        }
    };

    // 🚪 ENHANCED LOG OUT
    const handleLogout = () => {
        Alert.alert(
            "🚪 Log Out",
            "Are you sure you want to log out?",
            [
                { 
                    text: "Stay Logged In", 
                    style: "cancel",
                    onPress: () => console.log("Cancel Pressed") 
                },
                {
                    text: "Yes, Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("@userData");
                            if (user?.email) {
                                await AsyncStorage.removeItem(`${ASYNC_IMAGE_KEY_PREFIX}${user.email}`);
                            }
                            navigation.replace("Login"); 
                        } catch (err) {
                            console.error("Error logging out:", err);
                            Alert.alert("❌ Error", "Failed to log out. Please try again.");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // 🎯 SETTING CLICKS HANDLER
    const handleSettingClick = (key) => {
        if (key === 'changePassword') {
            setModalType('password');
        } else if (key === 'editProfile') {
             if (user) {
                 setEditedUser({
                     fullName: user.fullName,
                     address: user.address,
                     contact: user.contact,
                     profileImage: user.profileImage, 
                 });
                 setModalType('profile');
             }
        } else if (key === 'privacy') {
            setModalType('privacy');
        } else if (key === 'terms') {
            setModalType('terms');
        }
    };

    // ✨ ENHANCED MODAL CONTENT
    const renderModalContent = () => {
        if (modalType === 'password') {
            return (
                <View style={styles.modalContent}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight]}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>Change Password</Text>
                        <TouchableOpacity 
                            onPress={() => setModalType('none')} 
                            style={styles.closeIcon}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>
                    
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color={COLORS.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            placeholderTextColor={COLORS.textGray}
                            secureTextEntry={true}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            editable={!isUpdatingPassword}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="key" size={20} color={COLORS.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password (min 6 characters)"
                            placeholderTextColor={COLORS.textGray}
                            secureTextEntry={true}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            editable={!isUpdatingPassword}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor={COLORS.textGray}
                            secureTextEntry={true}
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            editable={!isUpdatingPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleChangePassword}
                        disabled={isUpdatingPassword}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primaryLight]}
                            style={styles.gradientButton}
                        >
                            {isUpdatingPassword ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Update Password</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: COLORS.textGray }]}
                        onPress={() => setModalType('none')}
                        disabled={isUpdatingPassword}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (modalType === 'profile') {
            return (
                <ScrollView contentContainerStyle={styles.editProfileScroll} style={styles.editProfileContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight]}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity 
                            onPress={() => setModalType('none')} 
                            style={styles.closeIcon}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            onPress={handleImageChange} 
                            disabled={isProfileUpdating} 
                            style={styles.imageEditContainer}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: editedUser.profileImage || user.profileImage }} 
                                style={styles.profileImageEdit}
                            />
                            <LinearGradient
                                colors={[COLORS.secondary, '#fbbf24']}
                                style={styles.cameraIconOverlay}
                            >
                                <Ionicons name="camera" size={20} color={COLORS.primary} />
                            </LinearGradient>
                            <Text style={styles.imageEditText}>Tap to change photo</Text>
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={COLORS.textGray}
                                value={editedUser.fullName}
                                onChangeText={(text) => setEditedUser(prev => ({...prev, fullName: text}))}
                                editable={!isProfileUpdating}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="at" size={20} color={COLORS.textGray} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                placeholder="Email (Cannot be changed)"
                                placeholderTextColor={COLORS.textGray}
                                value={user.email} 
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="location" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Address"
                                placeholderTextColor={COLORS.textGray}
                                value={editedUser.address}
                                onChangeText={(text) => setEditedUser(prev => ({...prev, address: text}))}
                                editable={!isProfileUpdating}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="call" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Contact Number"
                                placeholderTextColor={COLORS.textGray}
                                value={editedUser.contact}
                                onChangeText={(text) => setEditedUser(prev => ({...prev, contact: text}))}
                                keyboardType="phone-pad"
                                editable={!isProfileUpdating}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleUpdateProfile}
                            disabled={isProfileUpdating}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.primaryLight]}
                                style={styles.gradientButton}
                            >
                                {isProfileUpdating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Profile</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: COLORS.textGray }]}
                            onPress={() => setModalType('none')}
                            disabled={isProfileUpdating}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            );
        }

        return null; 
    };

    // ⏳ LOADING SCREEN
    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={styles.loadingContainer}
                >
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading your profile...</Text>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={{ color: COLORS.danger, fontSize: 16 }}>
                    Failed to load user profile.
                </Text>
            </SafeAreaView>
        );
    }

    // 🎭 MAIN RENDER
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Animated.ScrollView 
                style={styles.container} 
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: headerScroll } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* ENHANCED HEADER */}
                <Animated.View 
                    style={[
                        styles.headerBackground,
                        { 
                            height: headerHeight,
                            opacity: headerOpacity
                        }
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight, '#047857']}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Animated.View 
                            style={[
                                styles.headerContent,
                                { 
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }] 
                                }
                            ]}
                        >
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={{ uri: user.profileImage }}
                                    style={styles.profileImage}
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,0.3)']}
                                    style={styles.imageOverlay}
                                />
                            </View>

                            <Text style={styles.userName}>{user.fullName}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            
                            <TouchableOpacity 
                                style={styles.editButton} 
                                onPress={() => handleSettingClick('editProfile')}
                                activeOpacity={0.8}
                            > 
                                <LinearGradient
                                    colors={[COLORS.secondary, '#fbbf24']}
                                    style={styles.editButtonGradient}
                                >
                                    <Ionicons name="create" size={16} color={COLORS.primary} />
                                    <Text style={styles.editButtonText}>Edit Profile</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>

                {/* ENHANCED CONTENT SECTIONS */}
                <Animated.View 
                    style={[
                        styles.contentContainer,
                        { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }] 
                        }
                    ]}
                >
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.primaryLight]}
                                style={styles.sectionIcon}
                            >
                                <Ionicons name="person-circle" size={20} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.sectionTitle}>Account Information</Text>
                        </View>
                        {settingOptions.account.map((option, index) => (
                            <InfoRow
                                key={index}
                                label={option.name}
                                value={user[option.key] || "N/A"}
                                icon={option.icon}
                            />
                        ))}
                    </View>

                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <LinearGradient
                                colors={[COLORS.warning, '#f59e0b']}
                                style={styles.sectionIcon}
                            >
                                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.sectionTitle}>Security & Access</Text>
                        </View>
                        
                        <InfoRow
                            label={"Change Password"}
                            value={"Manage"}
                            icon={"lock-closed"}
                            isClickable={true}
                            onPress={() => handleSettingClick('changePassword')}
                        />

                        <InfoRow
                            label={"Log Out"}
                            value={"Exit App"}
                            icon={"log-out"}
                            isClickable={true}
                            onPress={handleLogout}
                        />
                    </View>

                    <View style={[styles.sectionCard, { marginBottom: 30 }]}>
                        <View style={styles.sectionHeader}>
                            <LinearGradient
                                colors={[COLORS.success, '#16a34a']}
                                style={styles.sectionIcon}
                            >
                                <Ionicons name="help-buoy" size={20} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.sectionTitle}>Support & Legal</Text>
                        </View>
                        
                        {settingOptions.support.map((option, index) => (
                            <InfoRow
                                key={index}
                                label={option.name}
                                value={"View"}
                                icon={option.icon}
                                isClickable={true}
                                onPress={() => handleSettingClick(option.key)} 
                            />
                        ))}
                    </View>
                </Animated.View>
            </Animated.ScrollView>

            {/* ENHANCED BOTTOM NAVIGATION */}
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
                style={styles.bottomNav}
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                    style={styles.navItem}
                    activeOpacity={0.7}
                >
                    <Ionicons name="home" size={22} color={COLORS.textGray} />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                     onPress={() => navigation.navigate("MyRequests")}
                    style={styles.navItem}
                    activeOpacity={0.7}
                >
                    <Ionicons name="calendar" size={22} color={COLORS.textGray} />
                    <Text style={styles.navText}>Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                    style={styles.navItem}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight]}
                        style={styles.activeNavIcon}
                    >
                        <Ionicons name="person" size={22} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.navTextActive}>Profile</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* ENHANCED MODALS */}
            <Modal
                transparent={true}
                visible={modalType === 'password' || modalType === 'profile'} 
                animationType="slide"
                onRequestClose={() => setModalType('none')}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        {renderModalContent()}
                    </View>
                </View>
            </Modal>
            
            <PrivacyAndTermsModal
                title="Privacy Policy"
                content={PRIVACY_POLICY_CONTENT}
                isVisible={modalType === 'privacy'}
                onClose={() => setModalType('none')}
            />
            
            <PrivacyAndTermsModal
                title="Terms of Service"
                content={TERMS_OF_SERVICE_CONTENT}
                isVisible={modalType === 'terms'}
                onClose={() => setModalType('none')}
            />
        </SafeAreaView>
    );
};

// 🎨 PREMIUM GREEN STYLESHEET
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: '100%',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
        fontWeight: '600',
    },
    headerBackground: {
        width: "100%",
        overflow: 'hidden',
    },
    headerGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
    },
    headerContent: { 
        alignItems: "center",
        paddingHorizontal: 20,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    imageOverlay: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 60,
        top: 0,
        left: 0,
    },
    userName: { 
        fontSize: 28, 
        fontWeight: "800", 
        color: '#fff', 
        textShadowColor: 'rgba(0, 0, 0, 0.3)', 
        textShadowOffset: { width: 1, height: 1 }, 
        textShadowRadius: 5,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        fontWeight: '500',
        marginBottom: 15,
    },
    editButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    editButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    editButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.primary, 
    },
    contentContainer: {
        paddingTop: 20,
    },
    sectionCard: {
        backgroundColor: COLORS.cardBackground,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.textDark,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(209, 250, 229, 0.5)', 
    },
    logoutRow: {
        borderBottomWidth: 0,
        marginTop: 5,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    optionLabel: {
        fontSize: 15,
        color: COLORS.textGray,
        fontWeight: "600",
        marginBottom: 2,
    },
    optionValue: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textDark,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: COLORS.cardBackground,
        borderTopWidth: 1,
        borderTopColor: 'rgba(209, 250, 229, 0.8)',
        paddingVertical: 12,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    navItem: {
        alignItems: "center",
        padding: 8,
        flex: 1,
    },
    activeNavIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    navText: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
        color: COLORS.textGray,
    },
    navTextActive: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
        color: COLORS.primary, 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
    },
    modalView: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 20,
        width: '100%',
        maxHeight: '80%',
    },
    legalModalView: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 20,
        width: '100%',
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    closeIcon: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        overflow: 'hidden',
    },
    inputIcon: {
        padding: 15,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: COLORS.textDark,
    },
    disabledInput: {
        backgroundColor: '#f1f5f9',
        color: COLORS.textGray,
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    closeButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    editProfileContainer: {
        width: '100%',
    },
    editProfileScroll: {
        paddingBottom: 20,
    },
    profileImageEdit: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
        borderWidth: 4,
        borderColor: COLORS.borderColor,
        alignSelf: 'center',
    },
    imageEditContainer: {
        alignItems: 'center',
        marginBottom: 25,
        position: 'relative',
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 20,
        right: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.cardBackground,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    imageEditText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 5,
    },
    legalScroll: {
        maxHeight: height * 0.6,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    legalText: {
        fontSize: 14,
        color: COLORS.textDark,
        lineHeight: 22,
        marginBottom: 15,
        textAlign: 'justify',
    },
    modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
},

closeDocumentTouchable: {
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
},

closeDocumentButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
},

closeDocumentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
},
});

export default ProfileScreen;
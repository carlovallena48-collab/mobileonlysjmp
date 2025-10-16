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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'; 

const { height } = Dimensions.get("window");

// --- REFINED COLOR PALETTE (DARK GREEN/EMERALD FOCUS) ---
const COLORS = {
    primary: "#05668D",
    primaryLight: "#028090",
    background: "#F8F8F8",
    cardBackground: "#FFFFFF",
    textDark: "#1E293B",
    textGray: "#64748B",
    success: "#4CC9F0",
    danger: "#EF4444",
    borderColor: "#E2E8F0",
};

// --- SETTING OPTIONS ---
const settingOptions = {
    account: [
        { name: "Full Name", key: "fullName", icon: "person-circle-outline" },
        { name: "Email", key: "email", icon: "mail-outline" },
        { name: "Address", key: "address", icon: "home-outline" },
        { name: "Contact", key: "contact", icon: "call-outline" },
        { name: "Role", key: "role", icon: "shield-checkmark-outline" },
    ],
    security: [
        { name: "Change Password", icon: "lock-closed-outline", key: "changePassword" },
    ],
    support: [ 
        { name: "Privacy Policy", icon: "document-text-outline", key: "privacy" },
        { name: "Terms of Service", icon: "newspaper-outline", key: "terms" },
    ]
};

// --- INFO ROW COMPONENT ---
const InfoRow = ({ label, value, icon, isClickable = false, onPress }) => {
    const isLogout = label === "Log Out";
    const clickable = isClickable || isLogout;
    
    return (
        <TouchableOpacity
            style={styles.optionRow}
            onPress={onPress}
            disabled={!clickable}
            activeOpacity={clickable ? 0.7 : 1}
        >
            <View style={[styles.iconContainer, { backgroundColor: isLogout ? 'rgba(239, 68, 68, 0.1)' : 'rgba(5, 102, 141, 0.1)' }]}>
                <Ionicons 
                    name={icon} 
                    size={20}
                    color={isLogout ? COLORS.danger : COLORS.primary}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.optionLabel}>{label}</Text>
                <Text 
                    style={[
                        styles.optionValue, 
                        { color: isLogout ? COLORS.danger : (label === 'Email' || label === 'Role' ? COLORS.textGray : COLORS.textDark) }
                    ]}
                    numberOfLines={1}
                >
                    {value}
                </Text>
            </View>
            {clickable && label !== "Email" && ( 
                <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={isLogout ? COLORS.danger : COLORS.textGray}
                />
            )}
        </TouchableOpacity>
    );
};

// --- PRIVACY AND TERMS MODAL COMPONENT ---
const PrivacyAndTermsModal = ({ title, content, onClose, isVisible }) => (
    <Modal
        transparent={true}
        visible={isVisible}
        animationType="slide"
        onRequestClose={onClose}
    >
        <Pressable style={styles.modalContainer} onPress={onClose}>
            <Pressable onPress={() => {}} style={styles.legalModalView}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <ScrollView style={styles.legalScroll}>
                        {content.split('\n\n').map((paragraph, index) => (
                            <Text key={index} style={styles.legalText}>
                                {paragraph}
                            </Text>
                        ))}
                    </ScrollView>
                    <Pressable
                        style={[styles.closeButton, { backgroundColor: COLORS.primary, marginTop: 15 }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);

// --- MAIN PROFILE SCREEN COMPONENT ---
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
    
    const navigation = useNavigation();
    
    const API_BASE_URL = `http://10.69.226.17:5000`; 
    const PROFILE_IMAGE_DEFAULT = "https://i.ibb.co/L95zB7X/emojiprofile.png";
    const ASYNC_IMAGE_KEY_PREFIX = "@user_profile_image_";
    
    // --- LEGAL CONTENT ---
    const PRIVACY_POLICY_CONTENT = `Privacy Policy for SJMP(sanjose manggagawa parish)...`;
    const TERMS_OF_SERVICE_CONTENT = `Terms of Service for SJMP (sanjose manggagawa parish)...`;

    // --- FUNCTION: FETCH PROFILE ---
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

    // --- FUNCTION: CHANGE PASSWORD ---
    const handleChangePassword = async () => {
        if (isUpdatingPassword) return;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Error", "Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "New password and confirmation do not match.");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters long.");
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
                Alert.alert("Success", "Your password has been successfully updated!");
                setModalType('none'); 
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                 Alert.alert("Update Failed", response.data.message || "Could not update password. Please check your current password.");
            }

        } catch (err) {
            console.error("Password update error:", err.response?.data || err.message);
            Alert.alert(
                "API Error", 
                err.response?.data?.message || "Failed to connect to the server or unknown error occurred."
            );
        } finally {
            setIsUpdatingPassword(false);
        }
    };
    
    // --- FUNCTION: IMAGE PICKER ---
    const handleImageChange = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work.');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7, 
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const localUri = result.assets[0].uri;
                setEditedUser(prev => ({...prev, profileImage: localUri}));
            }
        } catch (error) {
            console.error("Image Picker Error:", error);
            Alert.alert("Error", "Failed to select image.");
        }
    };

    // --- FUNCTION: UPDATE PROFILE DETAILS (COMPLETELY FIXED) ---
    const handleUpdateProfile = async () => {
        if (isProfileUpdating) return;

        if (!editedUser.fullName || !editedUser.address || !editedUser.contact) {
            Alert.alert("Error", "Please fill in all required fields (Name, Address, Contact).");
            return;
        }
        
        setIsProfileUpdating(true);
        try {
            const isImageNew = editedUser.profileImage.startsWith('file://');
            
            if (isImageNew) {
                // Use FormData for image upload
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

                console.log("📤 Uploading image with FormData...");
                
                const API_URL = `${API_BASE_URL}/api/profile/${user.email}`;
                const response = await axios.put(API_URL, formData, { 
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000
                });

                console.log("📥 Server response:", response.data);

                if (response.data && response.data.success) {
                    // Store the new image locally
                    await AsyncStorage.setItem(
                        `${ASYNC_IMAGE_KEY_PREFIX}${user.email}`, 
                        editedUser.profileImage
                    );
                    
                    const updatedData = {
                        fullName: editedUser.fullName,
                        address: editedUser.address,
                        contact: editedUser.contact,
                        profileImage: response.data.user?.profileImage || editedUser.profileImage,
                    };
                    
                    setUser(prevUser => ({
                        ...prevUser,
                        ...updatedData
                    }));
                    
                    const storedUser = JSON.parse(await AsyncStorage.getItem("@userData") || '{}');
                    await AsyncStorage.setItem("@userData", JSON.stringify({ 
                        ...storedUser, 
                        ...updatedData 
                    }));

                    Alert.alert("Success", "Profile successfully updated!");
                    setModalType('none');
                } else {
                    Alert.alert("Update Failed", response.data?.message || "Could not update profile.");
                }
            } else {
                // No image change - use text-only update
                const textData = {
                    fullName: editedUser.fullName,
                    address: editedUser.address,
                    contact: editedUser.contact,
                };

                console.log("📤 Updating text data only...");

                const API_URL = `${API_BASE_URL}/api/profile/${user.email}`;
                const response = await axios.put(API_URL, textData, { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                });

                console.log("📥 Server response:", response.data);

                if (response.data) {
                    const updatedData = {
                        ...textData,
                        profileImage: editedUser.profileImage, 
                    };
                    
                    setUser(prevUser => ({
                        ...prevUser,
                        ...updatedData
                    }));
                    
                    const storedUser = JSON.parse(await AsyncStorage.getItem("@userData") || '{}');
                    await AsyncStorage.setItem("@userData", JSON.stringify({ ...storedUser, ...updatedData }));

                    Alert.alert("Success", "Profile successfully updated!");
                    setModalType('none');
                } else {
                    Alert.alert("Update Failed", response.data?.message || "Could not update profile.");
                }
            }

        } catch (err) {
            console.error("❌ Profile update error:", err);
            console.error("❌ Error details:", err.response?.data);
            
            if (err.code === 'ECONNABORTED') {
                Alert.alert("Timeout", "The request took too long. Please check your internet connection.");
            } else if (err.response?.status === 404) {
                Alert.alert("User Not Found", "Your account was not found. Please try logging in again.");
            } else if (err.response?.status === 500) {
                Alert.alert("Server Error", "There's a problem with the server. Please try again later.");
            } else if (!err.response) {
                Alert.alert("Network Error", "Cannot connect to the server. Please check your internet connection.");
            } else {
                Alert.alert(
                    "Update Error", 
                    err.response?.data?.message || "Something went wrong. Please try again."
                );
            }
        } finally {
            setIsProfileUpdating(false);
        }
    };
    
    // --- FUNCTION: LOG OUT ---
    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
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
                            Alert.alert("Error", "Failed to log out.");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };
    
    // --- FUNCTION: HANDLE SETTINGS CLICKS ---
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

    // --- RENDER MODALS ---
    const renderModalContent = () => {
        if (modalType === 'password') {
            return (
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Change Password</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        placeholderTextColor={COLORS.textGray}
                        secureTextEntry={true}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        editable={!isUpdatingPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password (min 6 characters)"
                        placeholderTextColor={COLORS.textGray}
                        secureTextEntry={true}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        editable={!isUpdatingPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        placeholderTextColor={COLORS.textGray}
                        secureTextEntry={true}
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        editable={!isUpdatingPassword}
                    />

                    <Pressable
                        style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleChangePassword}
                        disabled={isUpdatingPassword}
                    >
                        {isUpdatingPassword ? (
                            <ActivityIndicator color={COLORS.cardBackground} />
                        ) : (
                            <Text style={styles.saveButtonText}>Update Password</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={[styles.closeButton, { backgroundColor: COLORS.textGray, marginTop: 10 }]}
                        onPress={() => setModalType('none')}
                        disabled={isUpdatingPassword}
                    >
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            );
        }

        if (modalType === 'profile') {
            return (
                <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={styles.editProfileScroll}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Profile Details</Text>
                    
                    <TouchableOpacity onPress={handleImageChange} disabled={isProfileUpdating} style={styles.imageEditContainer}>
                        <Image
                            source={{ uri: editedUser.profileImage || user.profileImage }} 
                            style={styles.profileImageEdit}
                        />
                        <View style={[styles.cameraIconOverlay, { backgroundColor: COLORS.primary }]}>
                            <Ionicons name="camera-outline" size={24} color={COLORS.cardBackground} />
                        </View>
                        <Text style={[styles.imageEditText, { color: COLORS.primary }]}>Tap to change photo</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor={COLORS.textGray}
                        value={editedUser.fullName}
                        onChangeText={(text) => setEditedUser(prev => ({...prev, fullName: text}))}
                        editable={!isProfileUpdating}
                    />

                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        placeholder="Email (Cannot be changed)"
                        placeholderTextColor={COLORS.textGray}
                        value={user.email} 
                        editable={false}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        placeholderTextColor={COLORS.textGray}
                        value={editedUser.address}
                        onChangeText={(text) => setEditedUser(prev => ({...prev, address: text}))}
                        editable={!isProfileUpdating}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contact Number"
                        placeholderTextColor={COLORS.textGray}
                        value={editedUser.contact}
                        onChangeText={(text) => setEditedUser(prev => ({...prev, contact: text}))}
                        keyboardType="phone-pad"
                        editable={!isProfileUpdating}
                    />

                    <Pressable
                        style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleUpdateProfile}
                        disabled={isProfileUpdating}
                    >
                        {isProfileUpdating ? (
                            <ActivityIndicator color={COLORS.cardBackground} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Profile</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={[styles.closeButton, { backgroundColor: COLORS.textGray, marginTop: 10, marginBottom: 0 }]}
                        onPress={() => setModalType('none')}
                        disabled={isProfileUpdating}
                    >
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </Pressable>
                </View>
                </ScrollView>
            );
        }

        return null; 
    };

    // --- LOADING/ERROR UI ---
    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.textGray }}>
                    Loading profile...
                </Text>
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

    // --- MAIN RENDER ---
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={styles.headerBackground}
                    start={{ x: 0.0, y: 0.1 }}
                    end={{ x: 1.0, y: 1.0 }}
                >
                    <View style={styles.headerContent}>
                        <Image
                            source={{ uri: user.profileImage }}
                            style={styles.profileImage}
                        />

                        <Text style={styles.userName}>{user.fullName}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        
                        <TouchableOpacity 
                            style={styles.editButton} 
                            onPress={() => handleSettingClick('editProfile')}
                        > 
                            <Ionicons
                                name="create-outline"
                                size={16}
                                color={COLORS.primary}
                            />
                            <Text style={[styles.editButtonText, { color: COLORS.primary }]}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
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
                    <Text style={styles.sectionTitle}>Security & Access</Text>
                    
                    <InfoRow
                        label={"Change Password"}
                        value={"Manage"}
                        icon={"lock-closed-outline"}
                        isClickable={true}
                        onPress={() => handleSettingClick('changePassword')}
                    />

                    <InfoRow
                        label={"Log Out"}
                        value={"Exit App"}
                        icon={"log-out-outline"}
                        isClickable={true}
                        onPress={handleLogout}
                    />
                </View>

                <View style={[styles.sectionCard, { marginBottom: 30 }]}>
                    <Text style={styles.sectionTitle}>Support & Legal</Text>
                    
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

            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                    style={styles.navItem}
                >
                    <Ionicons name="home-outline" size={24} color={COLORS.textGray} />
                    <Text style={[styles.navText, { color: COLORS.textGray }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                     onPress={() => navigation.navigate("MyRequests")}
                    style={styles.navItem}
                >
                    <Ionicons name="calendar-outline" size={24} color={COLORS.textGray} />
                    <Text style={[styles.navText, { color: COLORS.textGray }]}>Request Sched</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                    style={styles.navItem}
                >
                    <Ionicons name="person" size={24} color={COLORS.primary} />
                    <Text style={[styles.navTextActive, { color: COLORS.primary }]}>Profile</Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={modalType === 'password' || modalType === 'profile'} 
                animationType="fade" 
                onRequestClose={() => setModalType('none')}
            >
                <Pressable style={styles.modalContainer} onPress={() => setModalType('none')}>
                    <Pressable onPress={() => {}} style={styles.modalView}>
                        {renderModalContent()}
                    </Pressable>
                </Pressable>
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

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
    headerBackground: {
        width: "100%",
        height: height * 0.3,
        justifyContent: "center",
        alignItems: "center",
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        marginBottom: 25,
        paddingTop: 30,
    },
    headerContent: { alignItems: "center" },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: COLORS.cardBackground,
        marginBottom: 10,
        elevation: 10, 
        shadowColor: 'rgba(0,0,0,0.5)', 
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    userName: { 
        fontSize: 26, 
        fontWeight: "800", 
        color: COLORS.cardBackground, 
        textShadowColor: 'rgba(0, 0, 0, 0.15)', 
        textShadowOffset: { width: 1, height: 1 }, 
        textShadowRadius: 3 
    },
    userEmail: {
        fontSize: 14,
        color: "rgba(255,255,255,0.85)",
        marginTop: 2,
        fontWeight: '500',
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.cardBackground,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 25,
        marginTop: 15,
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },
    editButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.primary, 
    },
    sectionCard: {
        backgroundColor: COLORS.cardBackground,
        marginHorizontal: 15,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: COLORS.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textDark,
        marginBottom: 10,
        paddingLeft: 5,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor, 
    },
    iconContainer: {
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
        backgroundColor: 'rgba(5, 102, 141, 0.1)',
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    optionLabel: {
        fontSize: 14,
        color: COLORS.textGray,
        fontWeight: "500",
    },
    optionValue: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.textDark,
        marginTop: 2,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: COLORS.cardBackground,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        paddingVertical: 10,
    },
    navItem: {
        alignItems: "center",
        padding: 5,
    },
    navText: {
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
        color: COLORS.textGray,
    },
    navTextActive: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 4,
        color: COLORS.primary, 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalView: {
        margin: 20,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    legalModalView: {
        margin: 20,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '90%',
    },
    modalContent: {
        width: '100%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 15,
        color: COLORS.primary,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        paddingBottom: 5,
    },
    legalScroll: {
        maxHeight: height * 0.7,
        paddingHorizontal: 5,
    },
    legalText: {
        fontSize: 14,
        color: COLORS.textDark,
        lineHeight: 22,
        marginBottom: 15,
        textAlign: 'justify',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        color: COLORS.textDark,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    disabledInput: {
        backgroundColor: COLORS.background,
        color: COLORS.textGray,
    },
    saveButton: {
        width: '100%',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: COLORS.cardBackground,
        fontSize: 16,
        fontWeight: '700',
    },
    closeButton: {
        width: '100%',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: COLORS.cardBackground,
        fontSize: 16,
        fontWeight: '600',
    },
    editProfileScroll: {
        width: '100%',
    },
    profileImageEdit: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: COLORS.borderColor,
    },
    imageEditContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 25,
        right: 15,
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.cardBackground,
    },
    imageEditText: {
        fontSize: 12,
        fontWeight: '600',
    }
});

export default ProfileScreen;   
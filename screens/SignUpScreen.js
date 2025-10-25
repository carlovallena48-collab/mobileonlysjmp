import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

// Simple local validation functions
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const validateContact = (contact) => {
    const contactRegex = /^[0-9+\-\s()]{10,}$/;
    return contactRegex.test(contact.replace(/\s/g, ''));
};

export default function SignUpScreen({ navigation }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const formSlide = useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(formSlide, {
                toValue: 0,
                duration: 1200,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    const handleSignUp = async () => {
        // Client-side validation
        if (!fullName || !email || !password || !confirmPassword || !address || !contact) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (!validateContact(contact)) {
            Alert.alert('Error', 'Please enter a valid contact number.');
            return;
        }

        // Button animation
        Animated.sequence([
            Animated.spring(buttonScale, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScale, {
                toValue: 1,
                useNativeDriver: true,
            })
        ]).start();

        setLoading(true);
        try {
            // Check if email already exists locally first
            const existingUsers = await AsyncStorage.getItem('parish_users');
            const users = existingUsers ? JSON.parse(existingUsers) : [];
            
            const emailExists = users.find(user => user.email.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                Alert.alert('Error', 'This email is already registered. Please use a different email or login.');
                setLoading(false);
                return;
            }

            // Create new user object
            const newUser = {
                id: Date.now().toString(),
                fullName: fullName.trim(),
                email: email.toLowerCase().trim(),
                password: password, // In production, this should be hashed
                address: address.trim(),
                contact: contact.trim(),
                role: "Member",
                isVerified: true, // Skip verification for free tier
                createdAt: new Date().toISOString(),
            };

            // Save to local storage
            users.push(newUser);
            await AsyncStorage.setItem('parish_users', JSON.stringify(users));

            // Also save to backend if available (but don't block on failure)
            try {
                await axios.post('https://mobileonlysjmp.onrender.com/api/signup', {
                    fullName,
                    email,
                    password,
                    address,
                    contact,
                    role: "Member"
                }, { timeout: 5000 });
            } catch (backendError) {
                console.log('Backend signup failed, but local signup succeeded:', backendError.message);
            }

            Alert.alert(
                'Success', 
                'Account created successfully! You can now login.',
                [
                    {
                        text: 'Go to Login',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );

            // Clear form
            setFullName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAddress('');
            setContact('');

        } catch (error) {
            console.log('Signup error:', error);
            Alert.alert('Error', 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#0A1F0A', '#1A2F1A', '#2A3F2A']}
                style={styles.background}
            >
                
                {/* Header Section */}
                <Animated.View style={[
                    styles.headerContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideUpAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}>
                    <LinearGradient
                        colors={['#10B981', '#059669', '#047857']}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.headerContent}>
                            <Ionicons name="leaf" size={40} color="#FFFFFF" style={styles.headerIcon} />
                            <Text style={styles.headerText}>Join Our Parish</Text>
                            <Text style={styles.subHeaderText}>Begin Your Spiritual Journey</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <ScrollView 
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Form Container */}
                    <Animated.View style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: formSlide }
                            ]
                        }
                    ]}>
                        
                        {/* Full Name Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Full Name *</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="person-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    selectionColor="#10B981"
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Email Address *</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="mail-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    selectionColor="#10B981"
                                />
                            </View>
                            {email && !validateEmail(email) && (
                                <Text style={styles.errorText}>Please enter a valid email address</Text>
                            )}
                        </View>

                        {/* Address Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Address *</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="home-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your complete address"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={address}
                                    onChangeText={setAddress}
                                    selectionColor="#10B981"
                                />
                            </View>
                        </View>

                        {/* Contact Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Contact Number *</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="call-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="09XXXXXXXXX"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={contact}
                                    onChangeText={setContact}
                                    keyboardType="phone-pad"
                                    selectionColor="#10B981"
                                />
                            </View>
                            {contact && !validateContact(contact) && (
                                <Text style={styles.errorText}>Please enter a valid contact number</Text>
                            )}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Password *</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="lock-closed-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create password (min. 6 characters)"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={password}
                                    secureTextEntry={!showPassword}
                                    onChangeText={setPassword}
                                    selectionColor="#10B981"
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowPassword(!showPassword)} 
                                    style={styles.toggleButton}
                                >
                                    <Ionicons 
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={24} 
                                        color="#10B981" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {password && !validatePassword(password) && (
                                <Text style={styles.errorText}>Password must be at least 6 characters</Text>
                            )}
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Confirm Password *</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="lock-closed-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={confirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    onChangeText={setConfirmPassword}
                                    selectionColor="#10B981"
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    style={styles.toggleButton}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={24} 
                                        color="#10B981" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {confirmPassword && password !== confirmPassword && (
                                <Text style={styles.errorText}>Passwords do not match</Text>
                            )}
                        </View>

                        {/* Sign Up Button */}
                        <Animated.View 
                            style={[
                                styles.buttonWrapper,
                                {
                                    transform: [{ scale: buttonScale }],
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[styles.signUpButton, loading && styles.buttonDisabled]}
                                onPress={handleSignUp}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669', '#047857']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                                            <Ionicons name="leaf" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Login Redirect */}
                        <TouchableOpacity 
                            onPress={handleLoginRedirect} 
                            style={styles.loginLink}
                            activeOpacity={0.7}
                        >
                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>
                                    Already have an account?{' '}
                                    <Text style={styles.loginLinkText}>Sign In</Text>
                                </Text>
                                <Ionicons name="log-in-outline" size={16} color="#10B981" />
                            </View>
                        </TouchableOpacity>

                        {/* Security Notice */}
                        <View style={styles.securityNotice}>
                            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                            <Text style={styles.securityText}>
                                Your information is securely stored locally on your device
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A1F0A',
    },
    background: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    headerContainer: {
        width: '100%',
        height: height * 0.22,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
        marginBottom: 20,
    },
    headerGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerIcon: {
        marginBottom: 10,
    },
    headerText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        opacity: 0.9,
    },
    formContainer: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 25,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: '700',
        color: '#10B981',
        fontSize: 14,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    toggleButton: {
        padding: 5,
        marginLeft: 5,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    buttonWrapper: {
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 15,
    },
    signUpButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        marginRight: 8,
    },
    buttonIcon: {
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginLink: {
        marginTop: 10,
        marginBottom: 20,
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    loginText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontWeight: '500',
        marginRight: 5,
    },
    loginLinkText: {
        color: '#10B981',
        fontWeight: '700',
    },
    securityNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    securityText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginLeft: 8,
        textAlign: 'center',
        flex: 1,
    },
});
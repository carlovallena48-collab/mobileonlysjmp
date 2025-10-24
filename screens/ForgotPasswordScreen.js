// screens/ForgotPasswordScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const { height, width } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: Code
    const [userEmail, setUserEmail] = useState('');
    const [countdown, setCountdown] = useState(0);
    
    const codeInputsRef = useRef([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();

        // Pulse animation for header
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const animateStepTransition = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                })
            ]).start();
        });
    };

    const handleSendVerificationCode = async () => {
        if (!email) {
            shakeAnimation();
            Alert.alert('Missing Information', 'Please enter your email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            shakeAnimation();
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            console.log('📤 Sending verification code...');
            const response = await axios.post('http://mobileonlysjmp.onrender.com/api/forgot-password', {
                email: email.trim().toLowerCase(),
            });

            console.log('✅ Verification code sent:', response.data);
            setUserEmail(email);
            setCountdown(60); // Start 60-second countdown
            animateStepTransition();
            setStep(2);
            
        } catch (err) {
            console.log('❌ Forgot password error:', err.response?.data || err.message);
            
            let errorMessage = 'Failed to send verification code. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const shakeAnimation = () => {
        Animated.sequence([
            Animated.timing(slideAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleCodeChange = (text, index) => {
        const newCode = [...verificationCode];
        newCode[index] = text;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (text && index < 5) {
            codeInputsRef.current[index + 1].focus();
        }

        // Auto-submit when all digits are entered
        if (index === 5 && text) {
            const fullCode = newCode.join('');
            if (fullCode.length === 6) {
                handleVerifyCode(fullCode);
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
            codeInputsRef.current[index - 1].focus();
        }
    };

    const handleVerifyCode = async (code = null) => {
        const verificationCodeToVerify = code || verificationCode.join('');
        
        if (verificationCodeToVerify.length !== 6) {
            shakeAnimation();
            Alert.alert('Incomplete Code', 'Please enter the complete 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            console.log('🔐 Verifying code...');
            const response = await axios.post('http://mobileonlysjmp.onrender.com/api/verify-reset-code', {
                email: userEmail,
                code: verificationCodeToVerify,
            });

            console.log('✅ Code verified successfully:', response.data);
            
            // Navigate to reset password screen with token
            navigation.navigate('ResetPassword', { 
                token: response.data.resetToken,
                email: userEmail
            });
            
        } catch (err) {
            console.log('❌ Verify code error:', err.response?.data || err.message);
            
            let errorMessage = 'Invalid verification code. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            Alert.alert('Verification Failed', errorMessage);
            // Clear code on error
            setVerificationCode(['', '', '', '', '', '']);
            codeInputsRef.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        setLoading(true);
        try {
            await axios.post('http://mobileonlysjmp.onrender.com/api/forgot-password', {
                email: userEmail,
            });
            setCountdown(60);
            setVerificationCode(['', '', '', '', '', '']);
            codeInputsRef.current[0].focus();
            
            // Success feedback
            Alert.alert('Code Sent', 'New verification code has been sent to your email!');
        } catch (err) {
            Alert.alert('Error', 'Failed to resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.stepDots}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
            <Text style={styles.stepText}>Step {step} of 2</Text>
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <KeyboardAvoidingView 
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Animated.View 
                        style={[
                            styles.headerBackground,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <LinearGradient
                            colors={['#1a936f', '#2ec4b6', '#1F7A8C']}
                            style={styles.gradientBackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.headerContent}>
                                <TouchableOpacity 
                                    style={styles.backButton}
                                    onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
                                >
                                    <Ionicons name="chevron-back" size={28} color="#fff" />
                                </TouchableOpacity>
                                
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.appName}>SAN JOSE PARISH</Text>
                                    <Text style={styles.welcomeText}>
                                        {step === 1 ? 'Reset Password' : 'Verify Code'}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                    
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View 
                            style={[
                                styles.cardContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            {renderStepIndicator()}

                            {step === 1 ? (
                                // STEP 1: Email Input
                                <>
                                    <View style={styles.iconContainer}>
                                        <LinearGradient
                                            colors={['#1a936f', '#2ec4b6']}
                                            style={styles.iconGradient}
                                        >
                                            <Ionicons name="key-outline" size={32} color="#fff" />
                                        </LinearGradient>
                                    </View>

                                    <Text style={styles.cardTitle}>Forgot Password?</Text>
                                    <Text style={styles.subtitle}>
                                        Don't worry! Enter your email address and we'll send you a verification code to reset your password.
                                    </Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                                        <View style={styles.inputGroup}>
                                            <Ionicons name="mail-outline" size={22} color="#1a936f" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="your.email@example.com"
                                                placeholderTextColor="#9CA3AF"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                value={email}
                                                onChangeText={setEmail}
                                                editable={!loading}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.buttonPrimary, 
                                            (loading || !email) && styles.buttonDisabled
                                        ]}
                                        onPress={handleSendVerificationCode}
                                        disabled={loading || !email}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="send-outline" size={20} color="#FFF" style={styles.buttonIcon} />
                                                <Text style={styles.buttonText}>Send Verification Code</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.backToLoginLink}
                                        onPress={handleBackToLogin}
                                        disabled={loading}
                                    >
                                        <Ionicons name="arrow-back-circle-outline" size={18} color="#1a936f" />
                                        <Text style={styles.backToLoginText}>Back to Login</Text>
                                    </TouchableOpacity>
                                </>
                            ) : step === 2 ? (
                                // STEP 2: Code Verification
                                <>
                                    <View style={styles.iconContainer}>
                                        <LinearGradient
                                            colors={['#2ec4b6', '#1F7A8C']}
                                            style={styles.iconGradient}
                                        >
                                            <Ionicons name="lock-closed-outline" size={32} color="#fff" />
                                        </LinearGradient>
                                    </View>

                                    <Text style={styles.cardTitle}>Enter Verification Code</Text>
                                    <Text style={styles.subtitle}>
                                        We've sent a 6-digit verification code to:
                                    </Text>
                                    <Text style={styles.emailText}>{userEmail}</Text>

                                    <View style={styles.codeSection}>
                                        <Text style={styles.codeLabel}>ENTER CODE</Text>
                                        <View style={styles.codeContainer}>
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <TextInput
                                                    key={index}
                                                    ref={ref => codeInputsRef.current[index] = ref}
                                                    style={[
                                                        styles.codeInput,
                                                        verificationCode[index] && styles.codeInputFilled
                                                    ]}
                                                    placeholder="•"
                                                    placeholderTextColor="#D1D5DB"
                                                    keyboardType="number-pad"
                                                    maxLength={1}
                                                    value={verificationCode[index]}
                                                    onChangeText={(text) => handleCodeChange(text, index)}
                                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                                    editable={!loading}
                                                    selectTextOnFocus
                                                />
                                            ))}
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.buttonPrimary, 
                                            (loading || verificationCode.join('').length !== 6) && styles.buttonDisabled
                                        ]}
                                        onPress={() => handleVerifyCode()}
                                        disabled={loading || verificationCode.join('').length !== 6}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={styles.buttonIcon} />
                                                <Text style={styles.buttonText}>Verify & Continue</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.resendSection}>
                                        <Text style={styles.resendText}>
                                            Didn't receive the code?
                                        </Text>
                                        <TouchableOpacity
                                            onPress={handleResendCode}
                                            disabled={loading || countdown > 0}
                                        >
                                            <Text style={[
                                                styles.resendBold,
                                                (countdown > 0 || loading) && styles.resendDisabled
                                            ]}>
                                                {countdown > 0 ? `Resend in ${countdown}s` : 'Send again'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : null}
                        </Animated.View>

                        {/* Decorative elements */}
                        <View style={styles.floatingShape1} />
                        <View style={styles.floatingShape2} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
    },
    headerBackground: {
        width: '100%',
        height: height * 0.25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 15,
    },
    gradientBackground: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 10 : 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    appName: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
        marginBottom: 4,
    },
    welcomeText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        letterSpacing: 0.5,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    cardContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 25,
        padding: 30,
        marginTop: -20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    stepIndicatorContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    stepDots: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 4,
    },
    stepDotActive: {
        backgroundColor: '#1a936f',
    },
    stepText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1a936f',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
        letterSpacing: 0.3,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 60,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 8,
        fontWeight: '500',
    },
    codeSection: {
        marginBottom: 30,
    },
    codeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
        marginBottom: 15,
        letterSpacing: 1,
        textAlign: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    codeInput: {
        width: 50,
        height: 60,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    codeInputFilled: {
        borderColor: '#1a936f',
        backgroundColor: '#f0fdf9',
        shadowColor: '#1a936f',
        shadowOpacity: 0.1,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#1a936f',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    buttonPrimary: {
        backgroundColor: '#1a936f',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    backToLoginLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        padding: 10,
    },
    backToLoginText: {
        color: '#1a936f',
        fontWeight: '600',
        fontSize: 15,
        marginLeft: 8,
        letterSpacing: 0.3,
    },
    emailText: {
        fontWeight: 'bold',
        color: '#1a936f',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        backgroundColor: '#f0fdf9',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1fae5',
    },
    resendSection: {
        alignItems: 'center',
        marginTop: 10,
    },
    resendText: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 5,
    },
    resendBold: {
        color: '#1a936f',
        fontWeight: '700',
        fontSize: 14,
    },
    resendDisabled: {
        color: '#9CA3AF',
    },
    floatingShape1: {
        position: 'absolute',
        top: height * 0.15,
        right: -50,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(42, 157, 143, 0.1)',
        zIndex: -1,
    },
    floatingShape2: {
        position: 'absolute',
        bottom: 100,
        left: -30,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(26, 147, 111, 0.08)',
        zIndex: -1,
    },
});
// screens/ForgotPasswordScreen.js
import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Success
    const [userEmail, setUserEmail] = useState('');
    
    const codeInputsRef = useRef([]);

    const handleSendVerificationCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            console.log('📤 Sending verification code...');
            const response = await axios.post('http://192.168.100.199:5000/api/forgot-password', {
                email: email.trim().toLowerCase(),
            });

            console.log('✅ Verification code sent:', response.data);
            setUserEmail(email);
            setStep(2); // Move to code verification step
            
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
            Alert.alert('Error', 'Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            console.log('🔐 Verifying code...');
            const response = await axios.post('http://192.168.100.199:5000/api/verify-reset-code', {
                email: userEmail,
                code: verificationCodeToVerify,
            });

            console.log('✅ Code verified successfully:', response.data);
            
            // Navigate to reset password screen with token
            navigation.navigate('ResetPassword', { 
                token: response.data.resetToken 
            });
            
        } catch (err) {
            console.log('❌ Verify code error:', err.response?.data || err.message);
            
            let errorMessage = 'Invalid verification code. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            Alert.alert('Error', errorMessage);
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
        setLoading(true);
        try {
            await axios.post('http://192.168.100.199:5000/api/forgot-password', {
                email: userEmail,
            });
            Alert.alert('Success', 'New verification code sent!');
            setVerificationCode(['', '', '', '', '', '']);
            codeInputsRef.current[0].focus();
        } catch (err) {
            Alert.alert('Error', 'Failed to resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <KeyboardAvoidingView 
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <LinearGradient
                        colors={['#1F7A8C', '#17c071ff']}
                        style={styles.headerBackground}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                    >
                        <View style={styles.headerContent}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.appName}>SJMP Parish App</Text>
                            <Text style={styles.welcomeText}>
                                {step === 1 ? 'Reset Password' : step === 2 ? 'Verification' : 'Success'}
                            </Text>
                        </View>
                    </LinearGradient>
                    
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.cardContainer}>
                            {step === 1 ? (
                                // STEP 1: Email Input
                                <>
                                    <Text style={styles.cardTitle}>Forgot Password?</Text>
                                    <Text style={styles.subtitle}>
                                        Enter your email address and we'll send you a verification code.
                                    </Text>

                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputGroup}>
                                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email address"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            value={email}
                                            onChangeText={setEmail}
                                            editable={!loading}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.button, 
                                            (loading || !email) && styles.buttonDisabled
                                        ]}
                                        onPress={handleSendVerificationCode}
                                        disabled={loading || !email}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Text style={styles.buttonText}>Send Verification Code</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.backToLoginLink}
                                        onPress={handleBackToLogin}
                                        disabled={loading}
                                    >
                                        <Ionicons name="arrow-back" size={16} color="#1D9BF0" />
                                        <Text style={styles.backToLoginText}>Back to Login</Text>
                                    </TouchableOpacity>
                                </>
                            ) : step === 2 ? (
                                // STEP 2: Code Verification
                                <>
                                    <Text style={styles.cardTitle}>Enter Verification Code</Text>
                                    <Text style={styles.subtitle}>
                                        We sent a 6-digit code to:{'\n'}
                                        <Text style={styles.emailText}>{userEmail}</Text>
                                    </Text>

                                    <View style={styles.codeContainer}>
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <TextInput
                                                key={index}
                                                ref={ref => codeInputsRef.current[index] = ref}
                                                style={styles.codeInput}
                                                placeholder="0"
                                                placeholderTextColor="#9CA3AF"
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

                                    <TouchableOpacity
                                        style={[
                                            styles.button, 
                                            (loading || verificationCode.join('').length !== 6) && styles.buttonDisabled
                                        ]}
                                        onPress={() => handleVerifyCode()}
                                        disabled={loading || verificationCode.join('').length !== 6}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Text style={styles.buttonText}>Verify Code</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.resendLink}
                                        onPress={handleResendCode}
                                        disabled={loading}
                                    >
                                        <Text style={styles.resendText}>
                                            Didn't receive the code?{' '}
                                            <Text style={styles.resendBold}>Send again</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : null}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    container: {
        flex: 1,
    },
    headerBackground: {
        width: '100%',
        height: height * 0.22,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 10,
        padding: 5,
    },
    appName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        letterSpacing: 1.5,
    },
    welcomeText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    cardContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 30,
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 52,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 8,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    codeInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    button: {
        backgroundColor: '#1eb059ff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        height: 55,
        shadowColor: '#1D9BF0',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    backToLoginLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    backToLoginText: {
        color: '#1D9BF0',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
    emailText: {
        fontWeight: 'bold',
        color: '#333',
    },
    resendLink: {
        alignItems: 'center',
        marginTop: 10,
    },
    resendText: {
        color: '#6B7280',
        fontSize: 14,
    },
    resendBold: {
        color: '#1D9BF0',
        fontWeight: 'bold',
    },
});
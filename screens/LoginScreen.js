import React, { useState } from 'react';
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
    Platform,
    Image
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const USER_STORAGE_KEY = '@userData';

// SJMP Parish Branding Configuration
const BRAND_CONFIG = {
    appName: 'SJMP Parish App',
    supportEmail: 'carloheba5@gmail.com',
    primaryColor: '#1F7A8C',
    secondaryColor: '#17c071ff',
    gradientColors: ['#1F7A8C', '#17c071ff'],
    homePage: 'https://auth.expo.io',
    privacyPolicy: 'https://your-domain.com/privacy',
    termsOfService: 'https://your-domain.com/terms'
};

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://mobileonlysjmp.onrender.com/api/login', {
                email: email.trim().toLowerCase(),
                password,
            });

            if (response.data.user) {
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
            }

            Alert.alert('Success', response.data.message || 'Login successful!');

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (err) {
            console.log('❌ LOGIN ERROR:', err.response?.data || err.message);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
                
                // Handle email verification requirement
                if (err.response.data.requiresVerification) {
                    Alert.alert(
                        'Email Verification Required',
                        errorMessage,
                        [
                            {
                                text: 'Resend Verification',
                                onPress: () => resendVerification(email)
                            },
                            {
                                text: 'OK',
                                style: 'default'
                            }
                        ]
                    );
                    return;
                }
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async (email) => {
        try {
            const response = await axios.post('http://mobileonlysjmp.onrender.com/api/resend-verification', {
                email: email.trim().toLowerCase()
            });
            Alert.alert('Success', response.data.message);
        } catch (err) {
            Alert.alert('Error', 'Failed to resend verification email.');
        }
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            `For any questions, please contact us at: ${BRAND_CONFIG.supportEmail}`,
            [{ text: 'OK' }]
        );
    };

    const handleViewPrivacyPolicy = () => {
        Alert.alert(
            'Privacy Policy',
            `Our privacy policy is available at: ${BRAND_CONFIG.privacyPolicy}`,
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <LinearGradient
                    colors={BRAND_CONFIG.gradientColors}
                    style={styles.headerBackground}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <Image 
                                    source={require('../assets/LOGO.png')} 
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                        <Text style={styles.appName}>San Jose Manggagawa Parish</Text>
                        <Text style={styles.welcomeText}>Welcome Back!</Text>
                    </View>
                </LinearGradient>
                
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardTitle}>Log In</Text>

                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputGroup}>
                            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                editable={!loading}
                            />
                        </View>

                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputGroup}>
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)} 
                                style={styles.showPasswordButton}
                                disabled={loading}
                            >
                                <Ionicons 
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color="#6B7280" 
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.forgotLink}
                            onPress={() => navigation.navigate('ForgotPassword')}
                            disabled={loading}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button, 
                                (loading || !email || !password) && styles.buttonDisabled
                            ]}
                            onPress={handleSignIn}
                            disabled={loading || !email || !password}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>Log In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.dontHaveText}>Don't have an account?</Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('SignUp')}
                            disabled={loading}
                        >
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Branding Links */}
                    <View style={styles.brandingLinks}>
                        <TouchableOpacity onPress={handleContactSupport}>
                            <Text style={styles.brandingLinkText}>Contact Support</Text>
                        </TouchableOpacity>
                        <Text style={styles.brandingSeparator}>•</Text>
                        <TouchableOpacity onPress={handleViewPrivacyPolicy}>
                            <Text style={styles.brandingLinkText}>Privacy Policy</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerBackground: {
        width: '100%',
        height: height * 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        overflow: 'hidden',
    },
    headerContent: {
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBackground: {
        backgroundColor: '#ffffff',
        borderRadius: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoImage: {
        width: 100,
        height: 100,
    },
    appName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.9,
        marginBottom: 5,
        letterSpacing: 1.5,
    },
    welcomeText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
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
        marginBottom: 20,
        textAlign: 'center',
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
        marginBottom: 15,
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
    showPasswordButton: {
        padding: 5,
    },
    forgotLink: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotText: {
        color: '#1D9BF0',
        fontWeight: '600',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#1eb059ff',
        paddingVertical: 15,
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
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    dontHaveText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signUpText: {
        color: '#1D9BF0',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 5,
    },
    brandingLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    brandingLinkText: {
        color: '#6B7280',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    brandingSeparator: {
        color: '#6B7280',
        fontSize: 12,
        marginHorizontal: 10,
    },
});
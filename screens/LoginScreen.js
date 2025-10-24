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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

const { height } = Dimensions.get('window');
const USER_STORAGE_KEY = '@userData';

WebBrowser.maybeCompleteAuthSession();

// SJMP Parish Branding Configuration
const BRAND_CONFIG = {
    appName: 'SJMP Parish App',
    supportEmail: 'carloheba5@gmail.com',
    primaryColor: '#1F7A8C',
    secondaryColor: '#17c071ff',
    gradientColors: ['#1F7A8C', '#17c071ff'],
    homePage: 'https://auth.expo.io',
    // Add your actual privacy policy and terms of service links
    privacyPolicy: 'https://your-domain.com/privacy',
    termsOfService: 'https://your-domain.com/terms'
};

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Google Auth Configuration
    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: '630251895833-jgbkmqav3iq67fhf7gg2pl3gmhap62kk.apps.googleusercontent.com',
        androidClientId: '630251895833-1ddjgp9fbrn4me4fvqin3v3a08fav98n.apps.googleusercontent.com',
        iosClientId: '630251895833-jgbkmqav3iq67fhf7gg2pl3gmhap62kk.apps.googleusercontent.com',
        scopes: ['openid', 'profile', 'email'],
        redirectUri: redirectUri,
    });

    // Debug the redirect URI
    React.useEffect(() => {
        console.log('🔗 Redirect URI:', redirectUri);
        console.log('📱 Platform:', Platform.OS);
        console.log('🏢 App Ownership:', Constants.appOwnership);
    }, []);

    // Handle Google Auth Response
    React.useEffect(() => {
        console.log('🔐 Google Auth Response:', response);
        
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log('✅ Google auth success, access token received');
            handleGoogleSignIn(authentication.accessToken);
        } else if (response?.type === 'error') {
            console.log('❌ Google auth error:', response.error);
            if (response.error !== 'request_failed') {
                Alert.alert(
                    'Google Login', 
                    'Unable to sign in with Google. Please try email/password login.'
                );
            }
            setGoogleLoading(false);
        } else if (response?.type === 'dismiss') {
            console.log('ℹ️ Google auth dismissed by user');
            setGoogleLoading(false);
        }
    }, [response]);

    const handleGoogleSignIn = async (accessToken) => {
        if (!accessToken) {
            setGoogleLoading(false);
            return;
        }

        setGoogleLoading(true);
        try {
            console.log('📤 Sending access token to backend...');
            
            const response = await axios.post('http://192.168.1.42:5000/auth/google/expo', {
                accessToken: accessToken
            });

            if (response.data.success) {
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
                console.log("✅ Google user saved:", response.data.user.email);

                Alert.alert('Success', 'Google login successful!');

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            } else {
                Alert.alert('Error', response.data.message || 'Google login failed');
            }
        } catch (err) {
            console.log('❌ Google auth error:', err.response?.data || err.message);
            Alert.alert('Error', 'Google login failed. Please try email/password login.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        console.log('🚀 Starting Google login...');
        console.log('🔗 Using Redirect URI:', redirectUri);
        setGoogleLoading(true);
        try {
            await promptAsync();
        } catch (error) {
            console.log('❌ Google prompt error:', error);
            setGoogleLoading(false);
        }
    };

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
        const response = await axios.post('http://192.168.1.42:5000/api/login', {
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
        const response = await axios.post('http://192.168.1.42:5000/api/resend-verification', {
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
                        <Text style={styles.appName}>San Jose Manggagawa Parish </Text>
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
                                editable={!loading && !googleLoading}
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
                                editable={!loading && !googleLoading}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)} 
                                style={styles.showPasswordButton}
                                disabled={loading || googleLoading}
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
                            disabled={loading || googleLoading}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button, 
                                (loading || !email || !password) && styles.buttonDisabled
                            ]}
                            onPress={handleSignIn}
                            disabled={loading || !email || !password || googleLoading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>Log In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Google Login Section */}
                    <View style={styles.socialContainer}>
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>
                        
                        <View style={styles.socialButtons}>
                            <TouchableOpacity 
                                style={[
                                    styles.socialButton, 
                                    styles.googleButton, 
                                    googleLoading && styles.buttonDisabled
                                ]}
                                onPress={handleGoogleLogin}
                                disabled={googleLoading || loading}
                            >
                                {googleLoading ? (
                                    <ActivityIndicator size="small" color="#070606ff" />
                                ) : (
                                    <>
                                        <Ionicons name="logo-google" size={20} color="#ef3a08ff" />
                                        <Text style={styles.socialButtonText}>Sign in with Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                       
                    </View>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.dontHaveText}>Don't have an account?</Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('SignUp')}
                            disabled={loading || googleLoading}
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
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
    socialContainer: {
        marginTop: 20,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: 14,
        color: '#6B7280',
        paddingHorizontal: 10,
        fontWeight: '500',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    googleButton: {
        backgroundColor: '#ecdedcff',
    },
    socialButtonText: {
        color: '#131212ff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 12,
    },
    noteText: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic',
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
   logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
},
logoBackground: {
    backgroundColor: '#ffffff', // White background
    borderRadius: 100, // Optional: rounded corners
    shadowColor: '#000', // Optional: shadow for better visibility
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
},
logoImage: {
    width: 100,
    height: 100,
},
});
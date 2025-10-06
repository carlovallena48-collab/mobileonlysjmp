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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ added

const { height } = Dimensions.get('window');

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

        setLoading(true);
        try {
            const response = await axios.post('http://192.168.100.199:5000/api/login', {
                email,
                password,
            });

            // ✅ Save user to AsyncStorage
            if (response.data.user) {
                await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
                console.log("✅ User saved to storage:", response.data.user);
            }

            Alert.alert('Success', response.data.message);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (err) {
            console.log('AXIOS ERROR:', err.response?.data, err.message);
            Alert.alert('Error', err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#1F7A8C', '#17c071ff']}
                style={styles.headerBackground}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.appName}>Parish App</Text>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.cardContainer}>
                    <Text style={styles.cardTitle}>Log In</Text>

                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Your email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotLink}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Log In</Text>}
                    </TouchableOpacity>
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                    <Text style={styles.socialText}>Or log in with</Text>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                            <Ionicons name="logo-google" size={24} color="#fff" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                            <Ionicons name="logo-facebook" size={24} color="#fff" />
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.signUpContainer}>
                    <Text style={styles.dontHaveText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signUpText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
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
    appName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.8,
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
        fontSize: 15,
        color: '#1F2937',
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
        backgroundColor: '#A3D2F7',
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
    },
    socialText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    googleButton: {
        backgroundColor: '#DB4437',
    },
    facebookButton: {
        backgroundColor: '#4267B2',
    },
    socialButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
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
});

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

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://192.168.100.199:5000/api/forgot-password', {
                email,
            });

            const resetToken = response.data.token;

            // Show the token in an alert for testing purposes
            Alert.alert(
                'Success!',
                `The reset token has been generated. Use this token to reset your password:\n\n${resetToken}\n\nThis method is for testing only.`,
                [{ text: 'OK' }]
            );
            
            // Navigate to a new screen to enter the token and new password.
            // You'll need to create this 'ResetPassword' screen first.
            // navigation.navigate('ResetPassword', { token: resetToken });

        } catch (err) {
            console.log('AXIOS ERROR:', err.response?.data, err.message);
            Alert.alert('Error', err.response?.data?.message || 'Failed to generate reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#1F7A8C', '#1D9BF0']}
                style={styles.headerBackground}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.appName}>Parish App</Text>
                    <Text style={styles.welcomeText}>Forgot Password?</Text>
                </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.cardContainer}>
                    <Text style={styles.cardTitle}>Password Recovery</Text>
                    <Text style={styles.instructionsText}>
                        Enter the email address associated with your account and we'll provide a code to reset your password.
                    </Text>

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

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                        <Ionicons name="arrow-back-outline" size={16} color="#6B7280" />
                        <Text style={styles.backLinkText}>Back to Log In</Text>
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
        marginBottom: 10,
        textAlign: 'center',
    },
    instructionsText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 25,
        lineHeight: 20,
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
        marginBottom: 20,
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
    button: {
        backgroundColor: '#1D9BF0',
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
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backLinkText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
});
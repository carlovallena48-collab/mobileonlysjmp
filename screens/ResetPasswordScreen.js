// screens/ResetPasswordScreen.js
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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { token } = route.params; // Get token from URL params

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            console.log('📤 Resetting password...');
            const response = await axios.post(`http://192.168.1.42:5000/api/reset-password/${token}`, {
                newPassword: newPassword,
            });

            console.log('✅ Password reset successful:', response.data);
            
            Alert.alert(
                'Success', 
                'Your password has been reset successfully!',
                [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.navigate('Login') 
                    }
                ]
            );
            
        } catch (err) {
            console.log('❌ Reset password error:', err.response?.data || err.message);
            
            let errorMessage = 'Failed to reset password. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid or expired reset link. Please request a new one.';
            }
            
            Alert.alert('Error', errorMessage);
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
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.appName}>SJMP Parish App</Text>
                            <Text style={styles.welcomeText}>New Password</Text>
                        </View>
                    </LinearGradient>
                    
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.cardContainer}>
                            <Text style={styles.cardTitle}>Create New Password</Text>
                            <Text style={styles.subtitle}>
                                Enter your new password below.
                            </Text>

                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showNewPassword}
                                    autoComplete="password-new"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowNewPassword(!showNewPassword)} 
                                    style={styles.showPasswordButton}
                                >
                                    <Ionicons 
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={20} 
                                        color="#6B7280" 
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="password-new"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    style={styles.showPasswordButton}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={20} 
                                        color="#6B7280" 
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.passwordRequirements}>
                                • Password must be at least 6 characters long
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.button, 
                                    (loading || !newPassword || !confirmPassword) && styles.buttonDisabled
                                ]}
                                onPress={handleResetPassword}
                                disabled={loading || !newPassword || !confirmPassword}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Reset Password</Text>
                                )}
                            </TouchableOpacity>
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
    passwordRequirements: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 25,
        fontStyle: 'italic',
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
});
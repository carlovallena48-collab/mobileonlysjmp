import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

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

    const handleSignUp = async () => {
        if (!fullName || !email || !password || !confirmPassword || !address || !contact) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                'http://10.69.226.17:5000/api/signup',
                { fullName, email, password, address, contact, role: "Member" }
            );
            Alert.alert('Success', response.data.message);
            navigation.navigate('Login');
        } catch (err) {
            console.log('AXIOS ERROR DETAIL:', err.response?.data, err.message);
            Alert.alert('Error', err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <LinearGradient
                    colors={['#1F7A8C', '#10c330ff']}
                    style={styles.headerContainer}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <Text style={styles.headerText}>Create Account</Text>
                    <Text style={styles.subHeaderText}>Join our community today!</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="person-outline" size={20} color="#6b8079ff" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter full name"
                            placeholderTextColor="#9CA3AF"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Address */}
                    <Text style={styles.label}>Address</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="home-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter address"
                            placeholderTextColor="#9CA3AF"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>

                    {/* Contact */}
                    <Text style={styles.label}>Contact Number</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter contact number"
                            placeholderTextColor="#9CA3AF"
                            value={contact}
                            onChangeText={setContact}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            secureTextEntry={!showPassword}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm password"
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.toggleButton}>
                            <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.signUpButton, loading && styles.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Redirect */}
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLinkText}>Log In</Text>
                        </Text>
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
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    headerContainer: {
        width: '100%',
        height: height * 0.25,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#F9FAFB',
        fontWeight: '400',
    },
    formContainer: {
        marginHorizontal: 20,
        marginTop: 30,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        marginTop: 15,
        marginBottom: 8,
        fontWeight: '600',
        color: '#374151',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
    },
    toggleButton: {
        padding: 5,
    },
    signUpButton: {
        backgroundColor: '#0fc476ff',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: '#A3D2F7',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
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
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#6B7280',
        fontSize: 15,
    },
    loginLinkText: {
        color: '#1D9BF0',
        fontWeight: 'bold',
    },
});
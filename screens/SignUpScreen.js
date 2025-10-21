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

    // Premium Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const buttonGlow = useRef(new Animated.Value(0)).current;
    const formSlide = useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        // Entry animations
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
        if (!fullName || !email || !password || !confirmPassword || !address || !contact) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        // Button press animation
        Animated.sequence([
            Animated.parallel([
                Animated.spring(buttonScale, {
                    toValue: 0.95,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonGlow, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]),
            Animated.parallel([
                Animated.spring(buttonScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonGlow, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ])
        ]).start();

        setLoading(true);
        try {
            const response = await axios.post(
                'http://192.168.100.199:5000/api/signup',
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

    const handleLoginRedirect = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#0A1F0A', '#1A2F1A', '#2A3F2A']}
                style={styles.background}
            >
                
                {/* Animated Header Section */}
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
                            <View style={styles.headerDivider}>
                                <View style={styles.dividerDot} />
                                <View style={styles.dividerLine} />
                                <View style={styles.dividerDot} />
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <ScrollView 
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Animated Form Container */}
                    <Animated.View style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: formSlide }
                            ]
                        }
                    ]}>
                        
                        {/* Full Name Input with Premium Styling */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Full Name</Text>
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
                            <Text style={styles.label}>Email Address</Text>
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
                        </View>

                        {/* Address Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Address</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="home-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your address"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={address}
                                    onChangeText={setAddress}
                                    selectionColor="#10B981"
                                />
                            </View>
                        </View>

                        {/* Contact Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Contact Number</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="call-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter contact number"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={contact}
                                    onChangeText={setContact}
                                    keyboardType="phone-pad"
                                    selectionColor="#10B981"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputGroup}>
                                <Ionicons name="lock-closed-outline" size={22} color="#10B981" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create password"
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
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Confirm Password</Text>
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
                        </View>

                        {/* Premium Sign Up Button */}
                        <Animated.View 
                            style={[
                                styles.buttonWrapper,
                                {
                                    transform: [{ scale: buttonScale }],
                                    shadowOpacity: buttonGlow.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.4, 0.8]
                                    })
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
                                    <View style={styles.buttonShine} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Login Redirect with Premium Styling */}
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

                        {/* Premium Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>SAN JOSE MANGGAWA PARISH</Text>
                            <Text style={styles.footerSubtext}>Diocese of Antipolo</Text>
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
    // Premium Header
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
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5,
    },
    headerText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5,
        letterSpacing: 1,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 15,
        opacity: 0.9,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerDivider: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    dividerLine: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.6)',
        marginHorizontal: 8,
    },
    // Premium Form
    formContainer: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 25,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: '700',
        color: '#10B981',
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(16, 185, 129, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
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
    // Premium Button
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
        position: 'relative',
        flexDirection: 'row',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginRight: 8,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    buttonIcon: {
        fontWeight: 'bold',
    },
    buttonShine: {
        position: 'absolute',
        top: -50,
        left: -50,
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 50,
        transform: [{ rotate: '45deg' }],
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    // Login Link
    loginLink: {
        marginTop: 10,
        marginBottom: 30,
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
        textShadowColor: 'rgba(16, 185, 129, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    // Premium Footer
    footer: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(16, 185, 129, 0.3)',
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    footerSubtext: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '400',
        letterSpacing: 1,
    },
});
import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function StartingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Staggered animations for better visual hierarchy
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const handlePressIn = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const primaryButtonScale = useRef(new Animated.Value(1)).current;
  const secondaryButtonScale = useRef(new Animated.Value(1)).current;

  return (
    <LinearGradient
      colors={['#E6F0F4', '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[
            styles.header, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Logo with subtle scale animation */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Image
                source={require('../assets/LOGO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Text style={styles.title}>SJMP</Text>
            <Text style={styles.subtitle}>
              The official app of San Jose Manggagawa Parish
            </Text>
          </Animated.View>

          {/* Buttons with enhanced interactions */}
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: primaryButtonScale }] }}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Login')}
                onPressIn={() => handlePressIn(primaryButtonScale)}
                onPressOut={() => handlePressOut(primaryButtonScale)}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: secondaryButtonScale }] }}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('SignUp')}
                onPressIn={() => handlePressIn(secondaryButtonScale)}
                onPressOut={() => handlePressOut(secondaryButtonScale)}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryButtonText}>Create an Account</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer, 
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.footerText}>
            © 2025 San Jose Manggagawa Parish. All rights reserved.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Math.min(width * 0.08, 32), // Responsive padding
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.05, // Responsive top padding
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.08, // Responsive spacing
  },
  logo: {
    width: Math.min(width * 0.4, 160), // Responsive logo size
    height: Math.min(width * 0.4, 160),
    marginBottom: 24,
  },
  title: {
    fontSize: Math.min(width * 0.1, 38), // Responsive font size
    fontWeight: '800',
    color: '#1A531A',
    marginBottom: 8,
    letterSpacing: -0.5, // Better typography
  },
  subtitle: {
    fontSize: Math.min(width * 0.045, 16),
    color: '#4B5320',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22, // Better readability
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  primaryButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 18,
    borderRadius: 30,
    width: Math.min(width * 0.85, 320), // Responsive button width
    marginBottom: 16,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 18,
    width: Math.min(width * 0.85, 320),
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2E8B57',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#2E8B57',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footer: {
    marginBottom: Math.max(20, height * 0.03), // Responsive bottom margin
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#7B817A',
    textAlign: 'center',
    lineHeight: 16,
  },
});
import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StartingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <LinearGradient
      colors={['#E6F0F4', '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            {/* Logo */}
            <Image
              source={require('../assets/LOGO.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>SJMP</Text>
            <Text style={styles.subtitle}>The official app of San Jose Manggagawa Parish</Text>
          </Animated.View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.secondaryButtonText}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 San Jose Manggagawa Parish. All rights reserved.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '800', // Extra bold for a stronger presence
    color: '#1A531A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5320',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 18,
    borderRadius: 30,
    width: '85%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#eff1f2ff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 18,
    width: '85%',
  },
  secondaryButtonText: {
    color: '#2E8B57',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7B817A',
    textAlign: 'center',
  },
});
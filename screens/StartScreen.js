import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions, Easing, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function StartingScreen({ navigation }) {
  // Main animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleUp = useRef(new Animated.Value(0.8)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  
  // Simplified animations - FIXED: No complex particle arrays
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  
  // Button animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonGlow = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(0)).current;

  // Logo animations
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoGlowIntensity = useRef(new Animated.Value(0)).current;

  // Text animations
  const textReveal = useRef(new Animated.Value(0)).current;
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Background effects
  const parallax = useRef(new Animated.Value(0)).current;

  // Simple floating elements - FIXED: No complex arrays in useRef
  const floatingElements = [
    { anim: floatAnim1, size: 80, left: width * 0.1, top: height * 0.2 },
    { anim: floatAnim2, size: 50, left: width * 0.8, top: height * 0.4 },
    { anim: floatAnim3, size: 60, left: width * 0.15, top: height * 0.7 },
    { anim: floatAnim1, size: 45, left: width * 0.75, top: height * 0.15 },
    { anim: floatAnim2, size: 55, left: width * 0.85, top: height * 0.65 },
    { anim: floatAnim3, size: 70, left: width * 0.2, top: height * 0.55 },
  ];

  useEffect(() => {
    // Main content animation sequence
    const mainAnimation = Animated.sequence([
      // Background parallax intro
      Animated.timing(parallax, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      
      // Main content reveal
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleUp, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      ]),

      // Logo glow sequence
      Animated.sequence([
        Animated.timing(logoGlowIntensity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlowIntensity, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),

      // Text reveal animation
      Animated.timing(textReveal, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);

    // Continuous button pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(buttonPulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );

    // Continuous floating animations
    const float1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        })
      ])
    );

    const float2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        })
      ])
    );

    const float3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim3, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        })
      ])
    );

    // Continuous logo rotation
    const logoAnimation = Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );

    // Start all animations
    mainAnimation.start();
    pulseAnimation.start();
    float1Animation.start();
    float2Animation.start();
    float3Animation.start();
    logoAnimation.start();

    // Text cycling effect
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
      clearInterval(textInterval);
      // Clean up animations if needed
    };
  }, []);

  const handleButtonPress = () => {
    // Haptic feedback
    Vibration.vibrate(50);
    
    // Enhanced button press animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 0.92,
          useNativeDriver: true,
        }),
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]),
      Animated.delay(50),
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 200,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(buttonGlow, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      ])
    ]).start();

    // Navigate after animation
    setTimeout(() => {
      navigation.navigate('Login');
    }, 600);
  };

  const handleSignUpPress = () => {
    Vibration.vibrate(10);
    navigation.navigate('SignUp');
  };

  const inspirationalTexts = [
    "Where faith finds its home\nand souls find their peace",
    "A sanctuary for the spirit\nA beacon for the soul",
    "Building community\nStrengthening faith"
  ];

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <Animated.View style={[
        StyleSheet.absoluteFill,
        {
          opacity: parallax.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          })
        }
      ]}>
        <LinearGradient
          colors={['#0A0F1C', '#1A1F2E', '#2A2F3E', '#3A3F4E']}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Animated Gradient Overlay */}
        <Animated.View style={[
          StyleSheet.absoluteFill,
          {
            opacity: floatAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3]
            })
          }
        ]}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', 'transparent']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </Animated.View>

      {/* Floating Orbs - FIXED: Simple static positioning */}
      {floatingElements.map((element, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingOrb,
            {
              width: element.size,
              height: element.size,
              left: element.left,
              top: element.top,
              opacity: element.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.05, 0.2]
              }),
              transform: [
                { 
                  translateY: element.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40]
                  })
                },
                {
                  scale: element.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1]
                  })
                }
              ]
            }
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        
        {/* Main Content */}
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeIn,
            transform: [
              { scale: scaleUp }, 
              { translateY: slideUp },
              {
                translateY: parallax.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}>
          
          {/* Premium Logo Container with Advanced Effects */}
          <View style={styles.logoContainer}>
            {/* Outer Glow Ring */}
            <Animated.View 
              style={[
                styles.logoGlow,
                {
                  opacity: logoGlowIntensity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8]
                  }),
                  transform: [
                    { 
                      scale: logoGlowIntensity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3]
                      })
                    }
                  ]
                }
              ]} 
            />
            
            {/* Animated Ring */}
            <Animated.View 
              style={[
                styles.logoRing,
                {
                  transform: [
                    { 
                      rotate: logoRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ]
                }
              ]} 
            />

            {/* Glass Morphism Logo Container */}
            <View style={styles.glassLogo}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.glassGradient}
              >
                <Image
                  source={require('../assets/LOGO.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>

            {/* Inner Shine */}
            <Animated.View 
              style={[
                styles.logoShine,
                {
                  transform: [
                    {
                      translateX: floatAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 50]
                      })
                    }
                  ]
                }
              ]} 
            />
          </View>

          {/* Premium Text Content */}
          <View style={styles.textSection}>
            <Animated.Text style={[
              styles.title,
              {
                opacity: textReveal,
                transform: [
                  {
                    translateY: textReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}>
              SAN JOSE
            </Animated.Text>
            
            <Animated.Text style={[
              styles.subtitle,
              {
                opacity: textReveal,
                transform: [
                  {
                    translateY: textReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0]
                    })
                  }
                ]
              }
            ]}>
              Manggagawa Parish
            </Animated.Text>

            <Animated.View 
              style={[
                styles.divider,
                {
                  opacity: textReveal,
                  transform: [
                    {
                      scaleX: textReveal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
            </Animated.View>

            <Animated.Text style={[
              styles.description,
              {
                opacity: textReveal.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                }),
                transform: [
                  {
                    translateY: textReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0]
                    })
                  }
                ]
              }
            ]}>
              {inspirationalTexts[currentTextIndex]}
            </Animated.Text>
          </View>

          {/* Premium Buttons with Advanced Interactions */}
          <View style={styles.buttonSection}>
            {/* Main Button with Enhanced Effects */}
            <Animated.View 
              style={[
                styles.buttonWrapper,
                {
                  transform: [
                    { scale: buttonScale },
                    {
                      translateY: buttonPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5]
                      })
                    }
                  ],
                  shadowOpacity: Animated.add(
                    buttonGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1]
                    }),
                    buttonPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2]
                    })
                  )
                }
              ]}
            >
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={handleButtonPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#f7eb0fff', '#FFA500', '#FF8C00']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Animated Shine Effect */}
                  <Animated.View 
                    style={[
                      styles.buttonShine,
                      {
                        transform: [
                          {
                            translateX: buttonPulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-100, 100]
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                  
                  <Text style={styles.premiumButtonText}>ENTER THE PARISH APP</Text>
                  
                  {/* Button Icon/Arrow */}
                  <Animated.View 
                    style={[
                      styles.buttonIcon,
                      {
                        opacity: buttonPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1]
                        })
                      }
                    ]}
                  >
                    <Text style={styles.buttonIconText}></Text>
                  </Animated.View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Enhanced Secondary Option */}
            <TouchableOpacity
              style={styles.altOption}
              onPress={handleSignUpPress}
              activeOpacity={0.7}
            >
              <View style={styles.altOptionBlur}>
                <Text style={styles.altOptionText}>
                  New to our community?{' '}
                  <Text style={styles.altOptionHighlight}>Begin Your Journey</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* Enhanced Stats with Animation */}
            <Animated.View 
              style={[
                styles.statsContainer,
                {
                  opacity: textReveal,
                  transform: [
                    {
                      translateY: textReveal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              {[
                { number: '3', label: 'others' },
                { number: '7', label: 'Sacraments' },
                { number: '∞', label: 'Faith' }
              ].map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Animated.Text 
                    style={[
                      styles.statNumber,
                      {
                        transform: [
                          {
                            scale: buttonPulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.1]
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    {stat.number}
                  </Animated.Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </Animated.View>

        {/* Premium Footer */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: textReveal,
              transform: [
                {
                  translateY: textReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.footerText}>DIOCESE OF ANTIPOLO</Text>
          <Text style={styles.footerSubtext}>© 2024 San Jose Manggagawa Parish. All rights reserved.</Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  safeArea: {
    flex: 1,
  },
  // Floating orbs
  floatingOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(14, 223, 49, 0.3)',
    shadowColor: '#04f263ff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Math.min(width * 0.08, 32),
  },
  // Premium Logo Section
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.06,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
    backgroundColor: 'rgba(13, 224, 45, 0.15)',
    borderRadius: 100,
    zIndex: -1,
    shadowColor: '#07db2eff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 50,
    elevation: 25,
  },
  glassLogo: {
    width: Math.min(width * 0.3, 120),
    height: Math.min(width * 0.3, 120),
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(16, 162, 48, 0.4)',
    shadowColor: '#1feb52ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  glassGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: Math.min(width * 7.2, 120),
    height: Math.min(width * 7.2, 120),
    backgroundColor: 'white',
    borderRadius: 120,
  },
  logoRing: {
    position: 'absolute',
    width: Math.min(width * 0.35, 140),
    height: Math.min(width * 0.35, 140),
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    borderStyle: 'dashed',
  },
  // Premium Text Section
  textSection: {
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  title: {
    fontSize: Math.min(width * 0.12, 48),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 4,
    textShadowColor: 'rgba(255,215,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '300',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
  dividerLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,215,0,0.6)',
    marginHorizontal: 12,
  },
  description: {
    fontSize: Math.min(width * 0.04, 16),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  // Premium Buttons
  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: Math.min(width * 0.85, 340),
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#edf1eeff',
    shadowOffset: { width: 0, height: 15 },
    shadowRadius: 30,
    elevation: 25,
  },
  premiumButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 22,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  premiumButtonText: {
    color: '#1A1F2E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonShine: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(239, 242, 243, 0.4)',
    borderRadius: 100,
    transform: [{ rotate: '45deg' }],
  },
  buttonIcon: {
    position: 'absolute',
    right: 25,
  },
  buttonIconText: {
    color: '#1A1F2E',
    fontSize: 20,
    fontWeight: '900',
  },
  altOption: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
  },
  altOptionBlur: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  altOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  altOptionHighlight: {
    color: '#ecf5f6ff',
    fontWeight: '700',
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Premium Footer
  footer: {
    position: 'absolute',
    bottom: Math.max(30, height * 0.04),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  footerSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '400',
    letterSpacing: 1.2,
  },
});
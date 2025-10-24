import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
  Animated,
  Modal,
  Easing,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// Assuming these images are correctly imported
import annointing from "../assets/annointing.png";
import baptism from "../assets/baptism.png";
import confession from "../assets/confession.png";
import confirmation from "../assets/confirmation.png";
import eucharist from "../assets/eucharist.png";
import holyorders from "../assets/holyorders.png";
import matrimony from "../assets/matrimony.png";
import churchLogo from "../assets/LOGO.png";

const { width, height } = Dimensions.get("window");

// 📱 RESPONSIVE SIZING
const isSmallDevice = width < 375;
const isLargeDevice = width > 414;
const cardWidth = (width - 60) / (isSmallDevice ? 2 : 3);
const cardHeight = isSmallDevice ? 140 : 120;

// 🎨 CLEAN WHITE THEME COLOR PALETTE
const PRIMARY_COLOR = "#1a5e1a";           // Deep Forest Green
const PRIMARY_LIGHT = "#2e7d32";          // Medium Green
const ACCENT_COLOR = "#d4af37";           // Luxury Gold
const BACKGROUND_COLOR = "#ffffff";       // Pure White Background
const CARD_BACKGROUND = "#f8fafc";        // Light Card
const TEXT_PRIMARY = "#1e293b";           // Deep Navy
const TEXT_SECONDARY = "#64748b";         // Slate Gray
const BORDER_COLOR = "#e2e8f0";           // Light Border

// ✨ FLOATING ANIMATION COMPONENT
const FloatingElement = ({ children, duration = 2000 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
  };

  return <Animated.View style={floatStyle}>{children}</Animated.View>;
};

const sacraments = [
  { id: "s1", name: "Binyag", icon: "💧", color: "#00d4aa", gradient: ["#e0f7fa", "#b2ebf2"], route: "BaptismForm" },
  { id: "s2", name: "First Communion", icon: "🍞", color: "#fdcb6e", gradient: ["#fff8e1", "#ffecb3"], route: "FirstCommunionForm" },
  { id: "s3", name: "Kumpisal", icon: "🙏", color: "#74b9ff", gradient: ["#e8f5e9", "#c8e6c9"], route: "KumpisalForm" },
  { id: "s4", name: "Kumpil", icon: "🔥", color: "#ff7675", gradient: ["#fce4ec", "#f8bbd0"], route: "KumpilForm" },
  { id: "s5", name: "Wedding", icon: "💍", color: "#a29bfe", gradient: ["#fbe9e7", "#ffccbc"], route: "MarriageForm" },
  { id: "s6", name: "Holy Orders", icon: "⛪", color: "#fd79a8", gradient: ["#e3f2fd", "#bbdefb"], route: "HolyOrdenForm" },
  { id: "s7", name: "Annointing", icon: "🕊️", color: "#ffeaa7", gradient: ["#fbf2e5", "#ffe0b2"], route: "SickCallForm" },
  { id: "other", name: "More", icon: "✨", color: "#636e72", gradient: ["#f1f5f9", "#e2e8f0"], route: "OtherServices" },
];

// ⬇️ BOTTOM NAVIGATION ITEMS (SAME AS ORIGINAL)
const bottomNavItems = [
  { id: "1", name: "Home", icon: "home-outline", activeIcon: "home", route: "Home" },
  { id: "2", name: "Services", icon: "grid-outline", activeIcon: "grid", route: "Dashboard", active: true },
  { id: "4", name: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" },
];

const DashboardScreen = ({ navigation }) => {
  const [activeSacrament, setActiveSacrament] = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isOtherServicesModalVisible, setOtherServicesModalVisible] = useState(false);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  // 🎬 ENTRANCE ANIMATIONS
  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardsAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonsAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const headerStyle = {
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        }),
      },
    ],
    opacity: headerAnim,
  };

  const cardsStyle = {
    transform: [
      {
        translateY: cardsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: cardsAnim,
  };

  const buttonsStyle = {
    transform: [
      {
        translateY: buttonsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: buttonsAnim,
  };

  // 📝 HANDLERS
  const handleSacramentPress = (item) => {
    setActiveSacrament(item.id);
    setTimeout(() => setActiveSacrament(null), 300);

    if (item.route === "OtherServices") {
      setOtherServicesModalVisible(true);
      return;
    }
    if (item.route) navigation.navigate(item.route);
    else Alert.alert("Service Not Ready", `The form for ${item.name} is not yet available.`);
  };

  // ✅ ACTION HANDLERS
  const handleHistoryPress = () => navigation.navigate("ScheduleHistoryScreen");
  const handleCertificatePress = () => navigation.navigate("RequestCertificate");
  const handleViewCertificatePress = () => navigation.navigate("ViewRequestCertificate");
  const handleVolunteerPress = () => navigation.navigate("VolunteerFormScreen");
  const handleViewVolunteersPress = () => navigation.navigate("VolunteerHistory");

  const handleNavPress = (navItem) => {
    setActiveNav(navItem.route);
    if (navItem.route !== activeNav) {
      navigation.navigate(navItem.route);
    }
  };

  // 🎴 RESPONSIVE SACRAMENT CARD COMPONENT
  const SacramentCard3D = ({ item, index }) => {
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    const cardStyle = {
      transform: [
        { scale: cardScale },
      ],
    };

    return (
      <Animated.View style={[styles.sacramentCardWrapper, cardStyle]}>
        <TouchableOpacity
          style={[
            styles.sacramentCard,
            {
              borderColor: activeSacrament === item.id ? item.color : BORDER_COLOR,
            },
          ]}
          onPress={() => handleSacramentPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={[styles.sacramentGradient, { backgroundColor: item.gradient[0] }]}>
            <FloatingElement duration={1500 + index * 200}>
              <Text style={styles.sacramentEmoji}>{item.icon}</Text>
            </FloatingElement>
            <Text style={[styles.sacramentName, { color: TEXT_PRIMARY }]} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={[styles.cardGlow, { backgroundColor: item.color }]} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 🚀 RESPONSIVE ACTION BUTTON
  const PremiumActionButton = ({ icon, title, subtitle, onPress, gradient }) => {
    const btnScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(btnScale, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(btnScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity
          style={styles.premiumActionButton}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradient}
            style={styles.premiumButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name={icon} size={isSmallDevice ? 20 : 24} color="#fff" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.premiumButtonTitle}>{title}</Text>
              <Text style={styles.premiumButtonSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={isSmallDevice ? 18 : 20} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 🎪 RESPONSIVE MODAL
  const OtherServicesModal3D = () => {
    const modalScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, []);

    const modalStyle = {
      transform: [
        {
          scale: modalScale.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
      opacity: modalScale,
    };

    const handleServiceSelect = (service) => {
      setOtherServicesModalVisible(false);
      switch (service) {
        case "MassIntention":
          navigation.navigate("PamisaForm");
          break;
        case "Blessing":
          navigation.navigate("BlessingForm");
          break;
        case "BurialService":
          navigation.navigate("BurialServiceForm");
          break;
        default:
          Alert.alert("Error", "Invalid service selected.");
      }
    };

    const serviceButtons = [
      {
        name: "Mass Intention",
        icon: "book-outline",
        route: "MassIntention",
        gradient: ["#667eea", "#764ba2"]
      },
      {
        name: "Blessing",
        icon: "sparkles-outline",
        route: "Blessing",
        gradient: ["#f093fb", "#f5576c"]
      },
      {
        name: "Burial Service",
        icon: "heart-dislike-outline",
        route: "BurialService",
        gradient: ["#4facfe", "#00f2fe"]
      },
    ];

    return (
      <Modal animationType="fade" transparent visible={isOtherServicesModalVisible}>
        <View style={styles.modalOverlay3D}>
          <Animated.View style={[styles.modalContent3D, modalStyle]}>
            <LinearGradient
              colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
              style={styles.modalHeader3D}
            >
              <FloatingElement>
                <Ionicons name="sparkles" size={isSmallDevice ? 28 : 32} color={ACCENT_COLOR} />
              </FloatingElement>
              <Text style={styles.modalTitle3D}>Additional Services</Text>
              <Text style={styles.modalSubtitle3D}>Choose from our special services</Text>
            </LinearGradient>

            <View style={styles.modalButtons3D}>
              {serviceButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceButton3D}
                  onPress={() => handleServiceSelect(button.route)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={button.gradient}
                    style={styles.serviceGradient3D}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={button.icon} size={isSmallDevice ? 24 : 28} color="#fff" />
                    <Text style={styles.serviceButtonTitle3D}>{button.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton3D}
              onPress={() => setOtherServicesModalVisible(false)}
            >
              <Text style={styles.closeButtonText3D}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* 🌟 RESPONSIVE HEADER SECTION */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        <LinearGradient
          colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <FloatingElement>
              <Image source={churchLogo} style={styles.logo3D} />
            </FloatingElement>
            <View style={styles.parishInfo}>
              <Text style={styles.parishName3D} numberOfLines={1}>
                SAN JOSE MANGGAGAWA PARISH
              </Text>
              <Text style={styles.parishLocation3D}>Diocese of Antipolo</Text>
            </View>
          </View>

          <View style={styles.headerMain}>
            <Text style={styles.dashboardTitle3D}>DASHBOARD</Text>
            <Text style={styles.dashboardSubtitle3D}>Sacred moments await</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* 📱 MAIN CONTENT WITH RESPONSIVE DESIGN */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🎴 RESPONSIVE SACRAMENTS GRID */}
        <Animated.View style={[styles.section, cardsStyle]}>
          <Text style={styles.sectionTitle3D}>Holy Sacraments</Text>
          <View style={styles.sacramentsGrid3D}>
            {sacraments.map((item, index) => (
              <SacramentCard3D key={item.id} item={item} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* ✨ RESPONSIVE ACTION BUTTONS */}
        <Animated.View style={[styles.actionsSection, buttonsStyle]}>
          <Text style={styles.sectionTitle3D}>Quick Actions</Text>
          
          <View style={styles.premiumActionsGrid}>
            <PremiumActionButton
              icon="calendar-outline"
              title="Schedule History"
              subtitle="View your bookings"
              onPress={handleHistoryPress}
              gradient={['#2563eb', '#1e40af']}
            />
            
            <PremiumActionButton
              icon="document-text-outline"
              title="Request Certificate"
              subtitle="Get official documents"
              onPress={handleCertificatePress}
              gradient={['#059669', '#047857']}
            />
            
            <PremiumActionButton
              icon="eye-outline"
              title="View Certificates"
              subtitle="Check request status"
              onPress={handleViewCertificatePress}
              gradient={['#7c3aed', '#6d28d9']}
            />
            
            <PremiumActionButton
              icon="people-outline"
              title="Volunteer to Serve"
              subtitle="Join ministries"
              onPress={handleVolunteerPress}
              gradient={['#f59e0b', '#d97706']}
            />
            
            <PremiumActionButton
              icon="people-circle-outline"
              title="Volunteer History"
              subtitle="Check volunteers"
              onPress={handleViewVolunteersPress}
              gradient={['#ef4444', '#ba1a1a']}
            />
          </View>
        </Animated.View>
        
        <View style={{ height: isSmallDevice ? 20 : 30 }} />
      </ScrollView>

      <OtherServicesModal3D />

      {/* 💎 RESPONSIVE BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, activeNav === item.route && styles.navItemActive]}
            onPress={() => handleNavPress(item)}
            activeOpacity={0.7}
          >
            {activeNav === item.route ? (
              <LinearGradient
                colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
                style={styles.activeNavIcon}
              >
                <Ionicons
                  name={item.activeIcon}
                  size={isSmallDevice ? 22 : 24}
                  color="#fff"
                />
              </LinearGradient>
            ) : (
              <View style={styles.navIcon}>
                <Ionicons
                  name={item.icon}
                  size={isSmallDevice ? 22 : 24}
                  color={TEXT_SECONDARY}
                />
              </View>
            )}
            <Text style={[styles.navText, activeNav === item.route && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// 🎨 RESPONSIVE STYLES
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  
  // 🌟 RESPONSIVE HEADER STYLES
  headerContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  
  headerGradient: {
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: height > 800 ? 60 : (isSmallDevice ? 30 : 40),
    paddingBottom: isSmallDevice ? 20 : 30,
  },
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 15 : 25,
  },

  logo3D: {
    width: isSmallDevice ? 60 : 70,
    height: isSmallDevice ? 60 : 70,
    borderRadius: isSmallDevice ? 20 : 30,
    marginRight: isSmallDevice ? 12 : 16,
    borderWidth: 2,
    borderColor: ACCENT_COLOR,
    backgroundColor: '#ffffff',
  },

  parishInfo: {
    flex: 1,
  },

  parishName3D: {
    color: '#ffffff',
    fontSize: isSmallDevice ? 14 : 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  parishLocation3D: {
    fontSize: isSmallDevice ? 11 : 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  headerMain: {
    paddingTop: 5,
  },

  dashboardTitle3D: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 1,
  },

  dashboardSubtitle3D: {
    fontSize: isSmallDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  
  // 📱 CONTENT STYLES
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  
  scrollContent: {
    padding: isSmallDevice ? 16 : 20,
    paddingBottom: 100,
  },

  section: {
    marginBottom: isSmallDevice ? 25 : 40,
  },
  
  sectionTitle3D: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: isSmallDevice ? 15 : 20,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // 🎴 RESPONSIVE SACRAMENT CARD STYLES
  sacramentsGrid3D: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: isSmallDevice ? -4 : -6,
  },

  sacramentCardWrapper: {
    width: cardWidth,
    marginBottom: isSmallDevice ? 12 : 16,
    paddingHorizontal: isSmallDevice ? 4 : 6,
  },

  sacramentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    backgroundColor: CARD_BACKGROUND,
  },

  sacramentGradient: {
    padding: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    borderRadius: 14,
    height: cardHeight,
    justifyContent: 'center',
    position: 'relative',
  },

  sacramentEmoji: {
    fontSize: isSmallDevice ? 28 : 32,
    marginBottom: isSmallDevice ? 6 : 8,
  },

  sacramentName: {
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: isSmallDevice ? 12 : 14,
  },

  cardGlow: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.3,
  },

  // ✨ RESPONSIVE ACTION BUTTONS
  actionsSection: {
    marginBottom: isSmallDevice ? 20 : 30,
  },

  premiumActionsGrid: {
    gap: isSmallDevice ? 8 : 12,
  },

  premiumActionButton: {
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  premiumButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 16 : 20,
  },

  buttonIconContainer: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 12 : 15,
  },

  buttonTextContainer: {
    flex: 1,
  },

  premiumButtonTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  premiumButtonSubtitle: {
    fontSize: isSmallDevice ? 10 : 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // 💎 RESPONSIVE BOTTOM NAVIGATION
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: isSmallDevice ? 8 : 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingBottom: height > 800 ? 20 : (isSmallDevice ? 8 : 12),
  },

  navItem: {
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 3 : 5,
    paddingVertical: 2,
    borderRadius: 12,
    flex: 1,
  },

  navIcon: {
    width: isSmallDevice ? 45 : 50,
    height: isSmallDevice ? 45 : 50,
    borderRadius: isSmallDevice ? 22 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },

  activeNavIcon: {
    width: isSmallDevice ? 45 : 50,
    height: isSmallDevice ? 45 : 50,
    borderRadius: isSmallDevice ? 22 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  navText: {
    fontSize: isSmallDevice ? 10 : 11,
    marginTop: 2,
    color: TEXT_SECONDARY,
    fontWeight: '600',
  },

  navTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
  },
  
  // 🚀 RESPONSIVE MODAL STYLES
  modalOverlay3D: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: isSmallDevice ? 16 : 20,
  },
  
  modalContent3D: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: isSmallDevice ? 20 : 30,
    overflow: 'hidden',
    maxWidth: 400,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  
  modalHeader3D: {
    padding: isSmallDevice ? 20 : 30,
    alignItems: 'center',
  },
  
  modalTitle3D: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 4 : 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  modalSubtitle3D: {
    fontSize: isSmallDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  
  modalButtons3D: {
    padding: isSmallDevice ? 16 : 24,
    gap: isSmallDevice ? 8 : 12,
  },
  
  serviceButton3D: {
    borderRadius: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  
  serviceGradient3D: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 12 : 16,
  },
  
  serviceButtonTitle3D: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: isSmallDevice ? 10 : 12,
    flex: 1,
    letterSpacing: 0.3,
  },
  
  closeButton3D: {
    margin: isSmallDevice ? 16 : 24,
    marginTop: 0,
    padding: isSmallDevice ? 14 : 16,
    borderRadius: isSmallDevice ? 12 : 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  
  closeButtonText3D: {
    fontSize: isSmallDevice ? 14 : 16,
    color: TEXT_PRIMARY,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
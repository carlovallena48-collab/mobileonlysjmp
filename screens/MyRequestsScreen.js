import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  FlatList,
  Alert,
  Dimensions,
  Animated,
  Modal,
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

const otherservicesIcon = "add-circle-outline";
const { width, height } = Dimensions.get("window");

// 🌿 GREEN THEME COLOR PALETTE - Premium Design
const PRIMARY_COLOR = "#1a5e1a";           // Deep Forest Green
const PRIMARY_LIGHT = "#2e7d32";          // Medium Green
const PRIMARY_DARK = "#0d3d0d";           // Dark Green
const SECONDARY_COLOR = "#f2f2f0ff";        // Gold
const SECONDARY_LIGHT = "#f0f0eaff";        // Light Gold
const BACKGROUND_COLOR = "#f8fafc";       // Clean White/Light Gray
const CARD_BACKGROUND = "#ffffff";        // Pure White
const TEXT_PRIMARY = "#1e293b";           // Deep Navy
const TEXT_SECONDARY = "#64748b";         // Slate Gray

// 🎨 UPDATED SACRAMENT COLORS - Green Theme Harmony
const SACRAMENT_COLORS = {
  Baptism: { main: "#e0f2fe", dark: "#065f46", gradient: ["#e0f2fe", "#bae6fd"] },
  Eucharist: { main: "#fef3c7", dark: "#92400e", gradient: ["#fef3c7", "#fde68a"] },
  Reconciliation: { main: "#d1fae5", dark: "#059669", gradient: ["#d1fae5", "#a7f3d0"] },
  Confirmation: { main: "#fce7f6", dark: "#9d174d", gradient: ["#fce7f6", "#fbcfe8"] },
  Matrimony: { main: "#fee2e2", dark: "#dc2626", gradient: ["#fee2e2", "#fecaca"] },
  HolyOrders: { main: "#dbeafe", dark: "#1e40af", gradient: ["#dbeafe", "#bfdbfe"] },
  Annointing: { main: "#fff7ed", dark: "#d97706", gradient: ["#fff7ed", "#fed7aa"] },
  Other: { main: "#e5e7eb", dark: "#4b5563", gradient: ["#e5e7eb", "#d1d5db"] },
};

const sacraments = [
  { id: "s1", name: "Binyag", shortName: "Baptism", image: baptism, route: "BaptismForm", colors: SACRAMENT_COLORS.Baptism },
  { id: "s2", name: "First Communion", shortName: "Eucharist", image: eucharist, route: "FirstCommunionForm", colors: SACRAMENT_COLORS.Eucharist },
  { id: "s3", name: "Kumpisal", shortName: "Reconciliation", image: confession, route: "KumpisalForm", colors: SACRAMENT_COLORS.Reconciliation },
  { id: "s4", name: "Kumpil", shortName: "Confirmation", image: confirmation, route: "KumpilForm", colors: SACRAMENT_COLORS.Confirmation },
  { id: "s5", name: "Wedding", shortName: "Matrimony", image: matrimony, route: "MarriageForm", colors: SACRAMENT_COLORS.Matrimony },
  { id: "s6", name: "Banal na Orden", shortName: "Holy Orders", image: holyorders, route: "HolyOrdenForm", colors: SACRAMENT_COLORS.HolyOrders },
  { id: "s7", name: "Pagpapahid ng Langis", shortName: "Annointing", image: annointing, route: "SickCallForm", colors: SACRAMENT_COLORS.Annointing },
  { id: "other", name: "Other Services", shortName: "Requests", image: null, route: "OtherServices", colors: SACRAMENT_COLORS.Other },
];

// ⬇️ BOTTOM NAVIGATION ITEMS
const bottomNavItems = [
  { id: "1", name: "Home", icon: "home-outline", activeIcon: "home", route: "Home" },
  { id: "2", name: "Services", icon: "grid-outline", activeIcon: "grid", route: "Dashboard", active: true },
  { id: "4", name: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" },
];

const DashboardScreen = ({ navigation }) => {
  const [activeSacrament, setActiveSacrament] = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isOtherServicesModalVisible, setOtherServicesModalVisible] = useState(false);

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

  // 🖼️ ENHANCED SACRAMENT CARD COMPONENT
  const SacramentCard = ({ item }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isActive = activeSacrament === item.id;
    const cardBackgroundColor = item.colors.main;
    const cardTextColor = item.colors.dark;
    const isOtherServices = item.id === "other";

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], width: (width - 60) / 2, marginHorizontal: 5, marginBottom: 15 }}>
        <TouchableOpacity
          style={[
            styles.sacramentCard,
            {
              backgroundColor: cardBackgroundColor,
              shadowColor: cardTextColor,
              borderColor: cardTextColor + '30',
            },
            isActive && styles.sacramentCardActive,
          ]}
          onPress={() => handleSacramentPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={item.colors.gradient}
            style={[
              styles.sacramentIconContainer,
              {
                borderColor: cardTextColor + '80',
                shadowColor: cardTextColor,
              },
            ]}
          >
            {isOtherServices ? (
              <Ionicons name={otherservicesIcon} size={30} color={cardTextColor} />
            ) : (
              <Image source={item.image} style={styles.sacramentImage} />
            )}
          </LinearGradient>
          <Text style={[styles.sacramentName, { color: cardTextColor }, isOtherServices && styles.otherServiceName]}>
            {item.name}
          </Text>
          <Text style={styles.sacramentSubtext}>{item.shortName}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 🚪 ENHANCED OTHER SERVICES MODAL
  const OtherServicesModal = () => {
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
        description: "Request for special masses (Pamisa)",
        color: PRIMARY_COLOR
      },
      {
        name: "Blessing",
        icon: "sparkles-outline",
        route: "Blessing",
        description: "Blessing of houses, vehicles, or items",
        color: SECONDARY_COLOR
      },
      {
        name: "Burial Service",
        icon: "heart-dislike-outline",
        route: "BurialService",
        description: "Funeral masses and necessary services",
        color: "#6b7280"
      },
    ];

    return (
      <Modal animationType="slide" transparent visible={isOtherServicesModalVisible} onRequestClose={() => setOtherServicesModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>More Church Services</Text>
              <Text style={styles.modalSubtitle}>Select an additional service to request</Text>
              <TouchableOpacity onPress={() => setOtherServicesModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalButtonContainer}>
              {serviceButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceButton}
                  onPress={() => handleServiceSelect(button.route)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f8fafc', '#f1f5f9']}
                    style={styles.serviceIconContainer}
                  >
                    <Ionicons name={button.icon} size={28} color={button.color} />
                  </LinearGradient>
                  <View style={styles.serviceTextContainer}>
                    <Text style={styles.serviceButtonTitle}>{button.name}</Text>
                    <Text style={styles.serviceButtonDescription}>{button.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOtherServicesModalVisible(false)}
            >
              <LinearGradient
                colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
                style={styles.gradientButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* ENHANCED HEADER SECTION */}
      <LinearGradient
        colors={[PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_DARK]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTopSection}>
          <LinearGradient
            colors={[SECONDARY_COLOR, SECONDARY_LIGHT]}
            style={styles.logoContainer}
          >
            <Image source={churchLogo} style={styles.logo} />
          </LinearGradient>
          <View style={styles.parishInfo}>
            <Text style={styles.parishName}>SAN JOSE MANGGAGAWA PARISH</Text>
            <Text style={styles.parishLocation}>Diocese of Antipolo</Text>
          </View>
        </View>

        <View style={styles.dashboardTitleContainer}>
          <Text style={styles.dashboardTitle}>Services Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Book services and manage your requests</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* SACRAMENTS SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Holy Sacraments</Text>
              <Text style={styles.sectionSubtitle}>Initiate or complete your church sacraments</Text>
            </View>

            <FlatList
              data={sacraments}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => <SacramentCard item={item} />}
              columnWrapperStyle={styles.sacramentsRow}
            />
          </View>

          {/* ENHANCED ACTION BUTTONS SECTION */}
          <View style={styles.buttonsSection}>
            <Text style={styles.actionSectionTitle}>Quick Actions</Text>
            
            {/* ✅ SCHEDULE HISTORY BUTTON */}
            <View style={styles.singleButtonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.historyButton]} 
                onPress={handleHistoryPress} 
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.gradientActionButton}
                >
                  <Ionicons name="calendar-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.actionButtonText}>View Schedule History</Text>
                    <Text style={styles.actionButtonSubtext}>Check previous service bookings</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonsRow}>
              {/* Request Certificate Button */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.certificateButton]} 
                onPress={handleCertificatePress} 
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[PRIMARY_COLOR, PRIMARY_LIGHT]}
                  style={styles.gradientActionButton}
                >
                  <Ionicons name="document-text-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.actionButtonText}>Request Certificate</Text>
                    <Text style={styles.actionButtonSubtext}>Baptism, Marriage, etc.</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
                </LinearGradient>
              </TouchableOpacity>

              {/* View Certificate Button */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewCertificateButton]} 
                onPress={handleViewCertificatePress} 
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#1e40af', '#1e3a8a']}
                  style={styles.gradientActionButton}
                >
                  <Ionicons name="eye-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.actionButtonText}>View Certificates</Text>
                    <Text style={styles.actionButtonSubtext}>Check status of requests</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonsRow}>
              {/* Volunteer Button */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.volunteerButton]} 
                onPress={handleVolunteerPress} 
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.gradientActionButton}
                >
                  <Ionicons name="people-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.actionButtonText}>Volunteer to Serve</Text>
                    <Text style={styles.actionButtonSubtext}>Join our church ministries</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
                </LinearGradient>
              </TouchableOpacity>

              {/* View Volunteers Button */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewVolunteersButton]} 
                onPress={handleViewVolunteersPress} 
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#7c3aed', '#6d28d9']}
                  style={styles.gradientActionButton}
                >
                  <Ionicons name="list-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.actionButtonText}>My Volunteers</Text>
                    <Text style={styles.actionButtonSubtext}>View my applications</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ height: 30 }} /> 
        </ScrollView>
      </View>

      <OtherServicesModal />

      {/* ENHANCED BOTTOM NAVIGATION */}
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
        style={styles.bottomNav}
      >
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
                  size={24}
                  color="#fff"
                />
              </LinearGradient>
            ) : (
              <View style={styles.navIcon}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={TEXT_SECONDARY}
                />
              </View>
            )}
            <Text style={[styles.navText, activeNav === item.route && styles.navTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// --- PREMIUM STYLESHEET WITH GREEN THEME ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR, 
  },
  
  // 1. ENHANCED HEADER STYLES
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: height > 800 ? 50 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  
  headerTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  parishInfo: {
    flex: 1,
  },

  parishName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  parishLocation: {
    fontSize: 13,
    color: SECONDARY_COLOR,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  dashboardTitleContainer: {
    paddingTop: 10,
  },

  dashboardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  dashboardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // 2. CONTENT STYLES
  contentContainer: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 20,
    paddingTop: 25,
    paddingBottom: 100,
  },

  section: {
    marginBottom: 30,
  },
  
  sectionHeader: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: -0.5,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },

  sacramentsRow: {
    justifyContent: 'space-between',
  },

  // 3. ENHANCED SACRAMENT CARD STYLES
  sacramentCard: {
    flex: 1, 
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  sacramentIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  sacramentImage: {
    width: '150%',
    height: '150%',
    resizeMode: 'contain',
  },

  sacramentName: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
  },
  
  otherServiceName: {
    fontSize: 16, 
  },
  
  sacramentSubtext: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  
  // 4. PREMIUM ACTION BUTTON STYLES
  buttonsSection: {
    marginBottom: 30,
  },
  
  actionSectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: -5,
  },

  singleButtonRow: {
    marginBottom: 12,
    marginHorizontal: 0,
  },

  actionButton: {
    flex: 1,
    borderRadius: 25,
    elevation: 5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginHorizontal: 5,
    overflow: 'hidden',
  },

  gradientActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
  },

  buttonIcon: {
    marginRight: 12,
  },

  // 🎨 ENHANCED COLOR COMBINATIONS
  historyButton: {
    marginHorizontal: 0,
  },

  volunteerButton: {},
  certificateButton: {},
  viewCertificateButton: {},
  viewVolunteersButton: {},

  buttonTextContainer: {
    flex: 1,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: CARD_BACKGROUND,
    marginBottom: 3,
    letterSpacing: -0.3,
  },

  actionButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 14,
    fontWeight: '500',
  },

  // 5. PREMIUM BOTTOM NAV STYLES
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    paddingBottom: height > 800 ? 25 : 12,
  },

  navItem: {
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 16,
    flex: 1,
  },

  navItemActive: {
    // Background handled by gradient icon
  },

  navIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  activeNavIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  navText: {
    fontSize: 11,
    marginTop: 2,
    color: TEXT_SECONDARY,
    fontWeight: '600',
  },

  navTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
  },
  
  // 6. PREMIUM MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  modalContent: {
    width: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    maxHeight: height * 0.85,
  },
  
  modalHeader: {
    padding: 30,
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'relative',
  },
  
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  
  modalSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  modalCloseButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  modalButtonContainer: {
    padding: 25,
    paddingBottom: 20,
  },
  
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  serviceTextContainer: {
    flex: 1,
  },
  
  serviceButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  
  serviceButtonDescription: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 16,
    fontWeight: '500',
  },
  
  closeButton: {
    margin: 25,
    marginTop: 0,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  
  closeButtonText: {
    fontSize: 16,
    color: CARD_BACKGROUND,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
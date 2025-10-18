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
const { width } = Dimensions.get("window");

// 🌈 COLOR PALETTE - Modern & Spiritual
const PRIMARY_COLOR = "#047857"; // Deep Green (Growth, Life)
const SECONDARY_COLOR = "#34d399"; // Light Green (Harmony)
const BACKGROUND_COLOR = "#f5f5f5"; // Very Light Gray/White (Clean canvas)
const CARD_BACKGROUND = "#ffffff"; // Pure White

// 🎨 UPDATED SACRAMENT COLORS - Paired with the primary theme
// The 'main' color will be the card's background (lighter), and 'dark' will be for text/icons (stronger)
const SACRAMENT_COLORS = {
  Baptism: { main: "#e0f2fe", dark: "#065f46" }, // Light Blue - Water
  Eucharist: { main: "#fef3c7", dark: "#92400e" }, // Light Gold - Bread/Wine
  Reconciliation: { main: "#d1fae5", dark: "#059669" }, // Light Mint - Peace
  Confirmation: { main: "#fce7f6", dark: "#9d174d" }, // Light Pink/Violet - Spirit
  Matrimony: { main: "#fee2e2", dark: "#dc2626" }, // Light Red - Love
  HolyOrders: { main: "#dbeafe", dark: "#1e40af" }, // Light Deep Blue - Calling
  Annointing: { main: "#fff7ed", dark: "#d97706" }, // Light Orange/Yellow - Oil
  Other: { main: "#e5e7eb", dark: "#4b5563" }, // Light Gray - General
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

// ⬇️ REVERTED TO 3 ITEMS FOR SIMPLICITY ⬇️
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

  // ✅ ETO ANG DINAGDAG KO
  const handleHistoryPress = () => navigation.navigate("ScheduleHistoryScreen");
  
  const handleCertificatePress = () => navigation.navigate("RequestCertificate");
  const handleViewCertificatePress = () => navigation.navigate("ViewRequestCertificate");
  const handleVolunteerPress = () => navigation.navigate("VolunteerFormScreen");
  const handleViewVolunteersPress = () => navigation.navigate("VolunteerHistory");

  const handleNavPress = (navItem) => {
    setActiveNav(navItem.route);
    // Only navigate if it's not the current screen (or implement stack logic)
    if (navItem.route !== activeNav) {
        navigation.navigate(navItem.route);
    }
  };

  // 🖼️ SACRAMENT CARD COMPONENT
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
              shadowColor: cardTextColor, // Use the dark color for a distinct shadow
              borderColor: cardTextColor + '30', // A lighter border
            },
            isActive && styles.sacramentCardActive,
          ]}
          onPress={() => handleSacramentPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.sacramentIconContainer,
              {
                backgroundColor: CARD_BACKGROUND,
                borderColor: cardTextColor + '80', // Stronger border for the icon
                shadowColor: cardTextColor,
              },
            ]}
          >
            {isOtherServices ? (
              <Ionicons name={otherservicesIcon} size={30} color={cardTextColor} />
            ) : (
              <Image source={item.image} style={styles.sacramentImage} />
            )}
          </View>
          <Text style={[styles.sacramentName, { color: cardTextColor }, isOtherServices && styles.otherServiceName]}>
            {item.name}
          </Text>
          <Text style={styles.sacramentSubtext}>{item.shortName}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 🚪 OTHER SERVICES MODAL
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
        description: "Request for special masses (Pamisa)"
      },
      {
        name: "Blessing",
        icon: "sparkles-outline",
        route: "Blessing",
        description: "Blessing of houses, vehicles, or items"
      },
      {
        name: "Burial Service",
        icon: "heart-dislike-outline",
        route: "BurialService",
        description: "Funeral masses and necessary services"
      },
    ];

    return (
      <Modal animationType="slide" transparent visible={isOtherServicesModalVisible} onRequestClose={() => setOtherServicesModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>More Church Services</Text>
            <Text style={styles.modalSubtitle}>Select an additional service to request</Text>

            <View style={styles.modalButtonContainer}>
              {serviceButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceButton}
                  onPress={() => handleServiceSelect(button.route)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name={button.icon} size={28} color={PRIMARY_COLOR} />
                  </View>
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
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* HEADER SECTION - More prominent and branded */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopSection}>
          <Image source={churchLogo} style={styles.logo} />
          <View style={styles.parishInfo}>
            <Text style={styles.parishName}>SAN JOSE MANGGAGAWA PARISH</Text>
            <Text style={styles.parishLocation}>Diocese of Antipolo</Text>
          </View>
        </View>

        <View style={styles.dashboardTitleContainer}>
          <Text style={styles.dashboardTitle}>Services Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Book services and manage your requests</Text>
        </View>
      </View>

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

          {/* ACTION BUTTONS SECTION */}
          <View style={styles.buttonsSection}>
            <Text style={styles.actionSectionTitle}>Quick Actions</Text>
            
            {/* ✅ SCHEDULE HISTORY BUTTON - ETO YUNG HINAHANAP MO */}
            <View style={styles.singleButtonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.historyButton]} 
                onPress={handleHistoryPress} 
                activeOpacity={0.9}
              >
                <Ionicons name="calendar-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>View Schedule History</Text>
                  <Text style={styles.actionButtonSubtext}>Check previous service bookings</Text>
                </View>
                <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
              </TouchableOpacity>
            </View>
            {/* END OF SCHEDULE HISTORY BUTTON */}
            

            <View style={styles.buttonsRow}>
              {/* Request Certificate Button - Primary Action */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.certificateButton]} 
                onPress={handleCertificatePress} 
                activeOpacity={0.9}
              >
                <Ionicons name="document-text-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>Request Certificate</Text>
                  <Text style={styles.actionButtonSubtext}>Baptism, Marriage, etc.</Text>
                </View>
                <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
              </TouchableOpacity>

              {/* View Certificate Button */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewCertificateButton]} 
                onPress={handleViewCertificatePress} 
                activeOpacity={0.9}
              >
                <Ionicons name="eye-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>View Certificates</Text>
                  <Text style={styles.actionButtonSubtext}>Check status of requests</Text>
                </View>
                <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonsRow}>
              {/* Volunteer Button */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.volunteerButton]} 
                onPress={handleVolunteerPress} 
                activeOpacity={0.9}
              >
                <Ionicons name="people-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>Volunteer to Serve</Text>
                  <Text style={styles.actionButtonSubtext}>Join our church ministries</Text>
                </View>
                <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
              </TouchableOpacity>

              {/* View Volunteers Button - NEW */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewVolunteersButton]} 
                onPress={handleViewVolunteersPress} 
                activeOpacity={0.9}
              >
                <Ionicons name="list-outline" size={26} color={CARD_BACKGROUND} style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>My Volunteers</Text>
                  <Text style={styles.actionButtonSubtext}>View my applications</Text>
                </View>
                <Feather name="arrow-right" size={20} color={CARD_BACKGROUND} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ height: 30 }} /> 
        </ScrollView>
      </View>

      <OtherServicesModal />

      {/* ⬇️ BOTTOM NAVIGATION - 3 ITEMS ONLY ⬇️ */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, activeNav === item.route && styles.navItemActive]}
            onPress={() => handleNavPress(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeNav === item.route ? item.activeIcon : item.icon}
              size={26} // Slightly bigger icon
              color={activeNav === item.route ? PRIMARY_COLOR : "#4b5563"}
            />
            <Text style={[styles.navText, activeNav === item.route && styles.navTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// --- UPDATED AND ENHANCED STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR, 
  },
  
  // 1. HEADER STYLES
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  
  headerTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: SECONDARY_COLOR,
    backgroundColor: CARD_BACKGROUND,
    marginRight: 15,
  },

  parishInfo: {
    flex: 1,
  },

  parishName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  parishLocation: {
    fontSize: 13,
    color: SECONDARY_COLOR, 
    fontWeight: '600',
    marginTop: 2,
  },

  dashboardTitleContainer: {
    paddingTop: 10,
  },

  dashboardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },

  dashboardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  sacramentsRow: {
    justifyContent: 'space-between',
  },

  // 3. SACRAMENT CARD STYLES
  sacramentCard: {
    flex: 1, 
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  sacramentIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  sacramentImage: {
    width: '65%',
    height: '65%',
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
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  
  // 4. ACTION BUTTON STYLES (Color Combination Update)
  buttonsSection: {
    marginBottom: 30,
  },
  
  actionSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 15,
  },
  
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: -5, // Para ma-counter ang marginHorizontal ng actionButton
  },

  // Added a specific style for the full-width button row
  singleButtonRow: {
    marginBottom: 12,
    marginHorizontal: 0, 
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginHorizontal: 5,
  },
  
  buttonIcon: {
    marginRight: 10,
  },

  // 🎨 UPDATED COLOR COMBINATIONS: Used more distinct and high-contrast colors
  historyButton: {
    // Ginawa kong full width and ginamitan ng Blue color
    backgroundColor: '#3b82f6', // Bright Blue for History/Tracking
    shadowColor: '#3b82f6',
    marginHorizontal: 0, // Inalis ang side margin para maging full width sa loob ng section padding
    padding: 20, // Slightly bigger padding
  },

  volunteerButton: {
    backgroundColor: '#f59e0b', // Amber/Orange for Action/Opportunity
    shadowColor: '#f59e0b',
  },

  certificateButton: {
    backgroundColor: PRIMARY_COLOR, // Deep Green (Primary Action)
    shadowColor: PRIMARY_COLOR,
  },

  viewCertificateButton: {
    backgroundColor: '#1e40af', // Deep Blue for tracking/status
    shadowColor: '#1e40af',
  },

  viewVolunteersButton: {
    backgroundColor: '#7c3aed', // Purple for volunteer history
    shadowColor: '#7c3aed',
  },

  buttonTextContainer: {
    flex: 1,
  },

  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: CARD_BACKGROUND,
    marginBottom: 2,
  },

  actionButtonSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 14,
  },

  // 5. BOTTOM NAV STYLES (Adjusted for 3 items)
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: CARD_BACKGROUND,
    borderTopWidth: 0,
    elevation: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    paddingBottom: Dimensions.get('window').height > 800 ? 25 : 10, 
  },

  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1, // Equally distributes 3 items
  },

  navItemActive: {
    backgroundColor: SECONDARY_COLOR + '20', 
  },

  navText: {
    fontSize: 11,
    marginTop: 4,
    color: '#4b5563',
    fontWeight: '600',
  },

  navTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
  },
  
  // 6. MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  serviceButtonDescription: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
  closeButton: {
    paddingVertical: 15,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: CARD_BACKGROUND,
    fontWeight: '700',
  }
});
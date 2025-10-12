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

const PRIMARY_COLOR = "#047857";
const SECONDARY_COLOR = "#34d399";
const BACKGROUND_COLOR = "#f0fdfa";
const CARD_BACKGROUND = "#ffffff";

const SACRAMENT_COLORS = {
  Baptism: { main: "#42a5f5", light: "#e3f2fd" },
  Eucharist: { main: "#ef5350", light: "#ffebee" },
  Reconciliation: { main: "#66bb6a", light: "#e8f5e9" },
  Confirmation: { main: "#fbc02d", light: "#fffde7" },
  Matrimony: { main: "#ec407a", light: "#fce4ec" },
  HolyOrders: { main: "#4e342e", light: "#efebe9" },
  Annointing: { main: "#9e9e9e", light: "#f5f5f5" },
  Other: { main: PRIMARY_COLOR, light: BACKGROUND_COLOR },
};

const sacraments = [
  { id: "s1", name: "Binyag", image: baptism, description: "", route: "BaptismForm", colors: SACRAMENT_COLORS.Baptism },
  { id: "s2", name: "First Communion", image: eucharist, description: "", route: "FirstCommunionForm", colors: SACRAMENT_COLORS.Eucharist },
  { id: "s3", name: "Kumpisal", image: confession, description: "", route: "KumpisalForm", colors: SACRAMENT_COLORS.Reconciliation },
  { id: "s4", name: "Kumpil", image: confirmation, description: "", route: "KumpilForm", colors: SACRAMENT_COLORS.Confirmation },
  { id: "s5", name: "Wedding", image: matrimony, description: "", route: "MarriageForm", colors: SACRAMENT_COLORS.Matrimony },
  { id: "s6", name: "Banal na Orden", image: holyorders, description: "", route: "HolyOrdenForm", colors: SACRAMENT_COLORS.HolyOrders },
  { id: "s7", name: "Pagpapahid ng Langis sa May Sakit", image: annointing, description: "", route: "SickCallForm", colors: SACRAMENT_COLORS.Annointing },
  { id: "other", name: "Other Services", image: null, description: "", route: "OtherServices", colors: SACRAMENT_COLORS.Other },
];

const bottomNavItems = [
  { id: "1", name: "Home", icon: "home-outline", activeIcon: "home", route: "Home" },
  { id: "2", name: "Dashboard", icon: "grid-outline", activeIcon: "grid", route: "Dashboard", active: true },
  { id: "4", name: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" },
];

const DashboardScreen = ({ navigation }) => {
  const [activeSacrament, setActiveSacrament] = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isOtherServicesModalVisible, setOtherServicesModalVisible] = useState(false);

  const handleSacramentPress = (item) => {
    setActiveSacrament(item.id);
    setTimeout(() => setActiveSacrament(null), 300);

    if (item.route === "OtherServices") {
      setOtherServicesModalVisible(true);
      return;
    }
    if (item.route) navigation.navigate(item.route);
    else Alert.alert("Service", `${item.name} form is not yet available.`);
  };

  const handleHistoryPress = () => navigation.navigate("ScheduleHistoryScreen");

  const handleNavPress = (navItem) => {
    setActiveNav(navItem.route);
    if (navItem.route !== "Dashboard") navigation.navigate(navItem.route);
  };

  const SacramentCard = ({ item }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isActive = activeSacrament === item.id;
    const cardColor = item.colors.main;
    const lightColor = item.colors.light;
    const isOtherServices = item.id === "other";

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.sacramentCard,
            {
              backgroundColor: lightColor,
              borderColor: cardColor,
              borderWidth: 1,
              shadowColor: cardColor,
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
              shadowOffset: { width: 0, height: 4 },
            },
            isActive && styles.sacramentCardActive,
          ]}
          onPress={() => handleSacramentPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.sacramentIconContainer,
              {
                backgroundColor: CARD_BACKGROUND,
                borderColor: cardColor,
                borderWidth: 2,
                elevation: 10,
                shadowColor: cardColor,
                shadowOpacity: 0.5,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
              },
            ]}
          >
            {isOtherServices ? (
              <Ionicons name={otherservicesIcon} size={36} color={cardColor} />
            ) : (
              <Image source={item.image} style={styles.sacramentImage} />
            )}
            {isActive && <View style={styles.sacramentActiveOverlay} />}
          </View>
          <Text style={[styles.sacramentName, { color: cardColor }, isOtherServices && styles.otherServiceName]}>
            {item.name}
          </Text>
          <Text style={styles.sacramentDescription}>{item.description}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
        description: "Request for special masses"
      },
      { 
        name: "Blessing", 
        icon: "hand-left-outline", 
        route: "Blessing",
        description: "Blessing of items, houses, vehicles"
      },
      { 
        name: "Burial Service", 
        icon: "heart-outline", 
        route: "BurialService",
        description: "Funeral masses and services"
      },
    ];

    return (
      <Modal animationType="fade" transparent visible={isOtherServicesModalVisible} onRequestClose={() => setOtherServicesModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOtherServicesModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Other Services</Text>
            <Text style={styles.modalSubtitle}>Select the service you need</Text>

            <View style={styles.modalButtonContainer}>
              {serviceButtons.map((button, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.serviceButton,
                    { 
                      backgroundColor: CARD_BACKGROUND,
                      borderColor: PRIMARY_COLOR,
                      borderWidth: 1
                    }
                  ]} 
                  onPress={() => handleServiceSelect(button.route)}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name={button.icon} size={28} color={PRIMARY_COLOR} />
                  </View>
                  <View style={styles.serviceTextContainer}>
                    <Text style={styles.serviceButtonTitle}>{button.name}</Text>
                    <Text style={styles.serviceButtonDescription}>{button.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={PRIMARY_COLOR} />
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
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      <View style={styles.headerContainer}>
        <View style={styles.headerTopSection}>
          <View style={styles.logoContainer}>
            <Image source={churchLogo} style={styles.logo} />
          </View>

          <View style={styles.parishInfo}>
            <Text style={styles.parishName}>SAN JOSE MANGGAGAWA PARISH</Text>
            <Text style={styles.parishLocation}>Diocese of Antipolo</Text>
          </View>
        </View>

        <View style={styles.dashboardTitleContainer}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Manage your spiritual journey</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Holy Sacraments & Services</Text>
              <Text style={styles.sectionSubtitle}>Book a service for your spiritual needs</Text>
            </View>

            <FlatList
              data={sacraments}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => <SacramentCard item={item} />}
              contentContainerStyle={styles.sacramentsGrid}
            />
          </View>

          <View style={styles.historySection}>
            <TouchableOpacity style={styles.historyButton} onPress={handleHistoryPress} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={24} color={CARD_BACKGROUND} />
              <Text style={styles.historyButtonText}>My Requests History</Text>
              <Feather name="chevron-right" size={24} color={CARD_BACKGROUND} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <OtherServicesModal />

      <View style={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, activeNav === item.route && styles.navItemActive]}
            onPress={() => handleNavPress(item)}
          >
            <Ionicons
              name={activeNav === item.route ? item.activeIcon : item.icon}
              size={22}
              color={activeNav === item.route ? PRIMARY_COLOR : "#6b7280"}
            />
            <Text style={[styles.navText, activeNav === item.route && styles.navTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// --- Updated Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  
  headerTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },

  logoContainer: {
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'white',
  },

  parishInfo: {
    marginTop: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    flex: 1, 
  },

  parishName: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap',
  },

  parishLocation: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },

  dashboardTitleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },

  dashboardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },

  dashboardSubtitle: {
    fontSize: 14,
    color: '#a7f3d0',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 30,
  },
  
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  sacramentsGrid: {
    justifyContent: 'space-between',
  },

  sacramentCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  sacramentCardActive: {
    transform: [{ scale: 0.95 }],
  },

  sacramentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  sacramentImage: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },

  sacramentActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    borderRadius: 30,
  },

  sacramentName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  otherServiceName: {
    fontSize: 16, 
  },

  sacramentDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14,
  },

  historySection: {
    marginBottom: 20,
  },
  
  historyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR, 
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 6,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  
  historyButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: CARD_BACKGROUND,
    flex: 1, 
    textAlign: 'center',
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
  },

  navItemActive: {
    backgroundColor: '#ecfdf5',
  },

  navText: {
    fontSize: 11,
    marginTop: 4,
    color: '#6b7280',
    fontWeight: '600',
  },

  navTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
  },
  
  // ⭐️ UPDATED MODAL STYLES ⭐️
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
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
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginBottom: 4,
  },
  serviceButtonDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: CARD_BACKGROUND,
    fontWeight: '700',
  }
});
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const PRIMARY_COLOR = "#047857";
const SECONDARY_COLOR = "#34d399";
const BACKGROUND_COLOR = "#f0fdfa";
const CARD_BACKGROUND = "#ffffff";

// Your API base URL
const API_BASE_URL = "http://192.168.1.42:5000";

const SERVER_ICONS = {
  "Mother Butler Guild": "flower-outline",
  "Knights of the Altar": "shield-outline",
  "Eucharistic Ministers of the Holy Communion": "wine-outline",
  "Ministry of Lectors, Commentators and Psalmist": "mic-outline",
  "Ministry of Ushers and Greeters": "people-outline",
  "Liturgical Music Ministry Cathechist": "musical-notes-outline",
  "Catholic Womens League": "heart-outline",
  "Social Communication Ministry": "megaphone-outline",
  "Social Service Ministry": "hand-left-outline",
  "Ministry of Marshals": "walk-outline"
};

const VolunteerHistoryScreen = ({ navigation, route }) => {
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get currently logged-in user data
  const getCurrentUserData = async () => {
    try {
      console.log('🔍 [VOLUNTEER HISTORY] Getting current user data...');
      
      // 1. Try from AsyncStorage first (most reliable)
      const storedUser = await AsyncStorage.getItem('@userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.email) {
          console.log('✅ [VOLUNTEER HISTORY] Got user data from AsyncStorage:', userData.email);
          setUserEmail(userData.email);
          setCurrentUserData(userData);
          return userData;
        }
      }

      // 2. Try from navigation params
      const paramsEmail = route.params?.userEmail;
      const paramsUserData = route.params?.userData;
      
      if (paramsEmail) {
        console.log('✅ [VOLUNTEER HISTORY] Got email from params:', paramsEmail);
        setUserEmail(paramsEmail);
        setCurrentUserData(paramsUserData || { email: paramsEmail });
        return { email: paramsEmail, ...paramsUserData };
      }

      if (paramsUserData?.email) {
        console.log('✅ [VOLUNTEER HISTORY] Got user data from params:', paramsUserData.email);
        setUserEmail(paramsUserData.email);
        setCurrentUserData(paramsUserData);
        return paramsUserData;
      }

      console.log('❌ [VOLUNTEER HISTORY] No user data found anywhere');
      return null;
    } catch (error) {
      console.error('❌ [VOLUNTEER HISTORY] Error getting user data:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🎯 VolunteerHistoryScreen mounted');
    console.log('📧 Route params:', route.params);
    
    const initializeData = async () => {
      const userData = await getCurrentUserData();
      if (userData && userData.email) {
        console.log('📧 Current user email found:', userData.email);
        await loadVolunteerData(userData.email);
      } else {
        console.log('❌ No user data found');
        setLoading(false);
      }
    };

    initializeData();
    
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
    ]).start();
  }, []);

  const loadVolunteerData = async (email = null) => {
    try {
      setLoading(true);
      
      // Always use the currently logged-in user's email
      const userEmailToUse = email || userEmail;
      
      if (!userEmailToUse) {
        console.log('❌ No user email available');
        setLoading(false);
        return;
      }

      console.log(`🔍 Loading ALL volunteer applications to filter for: ${userEmailToUse}`);
      
      // CHANGED: Use the main endpoint and filter on frontend
      const API_URL = `${API_BASE_URL}/api/volunteer-applications`;
      console.log(`🌐 API URL: ${API_URL}`);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📡 Response status: ${response.status}`);
      
      if (response.ok) {
        const allApplications = await response.json();
        console.log(`✅ Loaded ${allApplications.length} total volunteer applications`);
        
        // CHANGED: Filter applications submitted by current user
        const userApplications = allApplications.filter(app => 
          app.submittedByEmail && app.submittedByEmail.toLowerCase() === userEmailToUse.toLowerCase()
        );
        
        console.log(`✅ Found ${userApplications.length} applications submitted by ${userEmailToUse}`);
        console.log('📋 User applications:', userApplications);
        
        // Sort by date (newest first)
        const sortedApplications = userApplications.sort((a, b) => 
          new Date(b.createdAt || b.applicationDate) - new Date(a.createdAt || a.applicationDate)
        );
        
        setVolunteerApplications(sortedApplications);
      } else if (response.status === 404) {
        console.log('📭 No applications found');
        setVolunteerApplications([]);
      } else {
        const errorText = await response.text();
        console.log('❌ Server error:', errorText);
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error loading volunteer data:', error);
      
      // Set empty array for better UX
      setVolunteerApplications([]);
      
      // Only show alert for network errors
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        Alert.alert(
          "Connection Error", 
          "Cannot connect to server. Please check your connection.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    loadVolunteerData();
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'in-process': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      case 'in-process': return 'sync';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return formatDate(dateString);
    } catch (error) {
      return '';
    }
  };

  const VolunteerCard = ({ application, index }) => {
    return (
      <Animated.View 
        style={[
          styles.volunteerCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10 * index]
              })}
            ]
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.ministryInfo}>
            <View style={[
              styles.ministryIconContainer,
              { backgroundColor: getStatusColor(application.status) + '20' }
            ]}>
              <Ionicons 
                name={SERVER_ICONS[application.ministry] || 'help-circle'} 
                size={24} 
                color={getStatusColor(application.status)} 
              />
            </View>
            <View style={styles.ministryText}>
              <Text style={styles.ministryName} numberOfLines={1}>
                {application.ministry}
              </Text>
              <Text style={styles.applicationDate}>
                Applied {getTimeAgo(application.applicationDate)}
              </Text>
              <Text style={styles.requestNumber}>{application.requestNumber}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(application.status)} 
              size={16} 
              color={getStatusColor(application.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {application.status?.charAt(0)?.toUpperCase() + application.status?.slice(1) || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText} numberOfLines={1}>{application.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {application.email}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{application.contactNumber}</Text>
          </View>
          
          {/* Show who submitted this application */}
          <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.submittedByText}>
              Submitted by: {application.submittedByEmail || userEmail}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => handleViewDetails(application)}
          activeOpacity={0.7}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Feather name="arrow-right" size={16} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const DetailModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={detailModalVisible}
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setDetailModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedApplication && (
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Current user info */}
              <View style={styles.userInfoBanner}>
                <Ionicons name="person-circle" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.userInfoText}>
                  Viewing as: {userEmail}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Ministry Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ministry:</Text>
                  <Text style={styles.detailValue}>{selectedApplication.ministry}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedApplication.status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(selectedApplication.status)} 
                      size={14} 
                      color={getStatusColor(selectedApplication.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(selectedApplication.status) }]}>
                      {selectedApplication.status?.charAt(0)?.toUpperCase() + selectedApplication.status?.slice(1) || 'Pending'}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Request Number:</Text>
                  <Text style={[styles.detailValue, styles.monoText]}>{selectedApplication.requestNumber}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Application Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Full Name:</Text>
                  <Text style={styles.detailValue}>{selectedApplication.fullName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact Email:</Text>
                  <Text style={styles.detailValue}>{selectedApplication.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact Number:</Text>
                  <Text style={styles.detailValue}>{selectedApplication.contactNumber}</Text>
                </View>
                
                {/* Submitted By information */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submitted By:</Text>
                  <Text style={styles.detailValue}>{selectedApplication.submittedByEmail || userEmail}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Application Timeline</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date Applied:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedApplication.applicationDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Updated:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedApplication.lastUpdated)}</Text>
                </View>
                {selectedApplication.processedDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Processed Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedApplication.processedDate)}</Text>
                  </View>
                )}
              </View>

              {selectedApplication.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Admin Notes</Text>
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{selectedApplication.notes}</Text>
                  </View>
                </View>
              )}

              {selectedApplication.requirements && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Requirements Status</Text>
                  <View style={styles.requirementsContainer}>
                    {Object.entries(selectedApplication.requirements).map(([key, value]) => (
                      <View key={key} style={styles.requirementRow}>
                        <Ionicons 
                          name={value ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={value ? "#10b981" : "#6b7280"} 
                        />
                        <Text style={[
                          styles.requirementText,
                          value && styles.requirementCompleted
                        ]}>
                          {key.split(/(?=[A-Z])/).join(' ')}: {value ? "Completed" : "Pending"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setDetailModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const handleVolunteerNow = () => {
    navigation.navigate('VolunteerFormScreen', { 
      userEmail: userEmail,
      userData: currentUserData 
    });
  };

  const renderContent = () => {
    // No user email case
    if (!userEmail) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="log-in-outline" size={80} color="#d1d5db" />
          <Text style={styles.centeredTitle}>Login Required</Text>
          <Text style={styles.centeredText}>
            Please login to view your volunteer applications.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('LoginScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Loading state
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading your applications...</Text>
        </View>
      );
    }

    // Empty state
    if (volunteerApplications.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="people-outline" size={80} color="#d1d5db" />
          <Text style={styles.centeredTitle}>No Applications Yet</Text>
          <Text style={styles.centeredText}>
            You haven't submitted any volunteer applications yet. Start your journey by volunteering to serve.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleVolunteerNow}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Volunteer Now</Text>
          </TouchableOpacity>
          
          {/* Debug Info */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Current User: {userEmail}</Text>
            <Text style={styles.debugText}>Your Applications: {volunteerApplications.length}</Text>
            <Text style={styles.debugText}>Server: {API_BASE_URL}</Text>
          </View>
        </View>
      );
    }

    // Applications list
    return (
      <View style={styles.applicationsList}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{volunteerApplications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>
              {volunteerApplications.filter(app => app.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
              {volunteerApplications.filter(app => app.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Applications You Submitted ({volunteerApplications.length})</Text>
        
        {volunteerApplications.map((application, index) => (
          <VolunteerCard 
            key={application._id || application.requestNumber || index}
            application={application}
            index={index}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Volunteer Applications</Text>
          <Text style={styles.headerSubtitle}>
            {userEmail ? `Applications submitted by ${userEmail}` : 'Track your ministry applications'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color="#fff" 
            style={refreshing && styles.refreshingIcon} 
          />
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
              tintColor={PRIMARY_COLOR}
              title="Pull to refresh"
            />
          }
        >
          {renderContent()}
        </ScrollView>
      </Animated.View>

      <DetailModal />
    </SafeAreaView>
  );
};

// ... (styles remain the same, just copy from your existing code) ...

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: PRIMARY_COLOR,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: height * 0.6,
  },
  centeredTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  centeredText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: CARD_BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  debugInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'stretch',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  applicationsList: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 15,
  },
  volunteerCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  ministryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ministryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ministryText: {
    flex: 1,
  },
  ministryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  requestNumber: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  submittedByText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  detailModal: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeModalButton: {
    padding: 4,
    borderRadius: 4,
  },
  modalContent: {
    padding: 20,
  },
  userInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  monoText: {
    fontFamily: 'monospace',
  },
  notesContainer: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  requirementsContainer: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 12,
    borderRadius: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  requirementCompleted: {
    color: '#10b981',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modalCloseButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: CARD_BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VolunteerHistoryScreen;
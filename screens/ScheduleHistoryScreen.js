import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_COLOR = "#047857";
const SECONDARY_COLOR = "#34d399";
const BACKGROUND_COLOR = "#f0fdfa";
const CARD_BACKGROUND = "#ffffff";

// API URL - Updated to use user email
const API_URL = "http://10.173.231.17:5000/api";
const USER_STORAGE_KEY = '@userData';

// Enhanced Status Badge with Payment Status
const StatusBadge = ({ status, paymentStatus }) => {
  let color = "#9ca3af";
  let text = status;

  switch (status) {
    case "completed":
    case "approved":
      color = "#10b981";
      text = status.charAt(0).toUpperCase() + status.slice(1);
      break;
    case "confirmed":
    case "scheduled":
      color = "#3b82f6";
      break;
    case "pending":
      color = "#f59e0b";
      break;
    case "rejected":
    case "cancelled":
      color = "#ef4444";
      break;
    default:
      color = "#9ca3af";
      text = status || 'Pending';
  }

  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{text}</Text>
      </View>
      {paymentStatus && (
        <View style={[
          styles.paymentBadge, 
          { backgroundColor: paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }
        ]}>
          <Text style={styles.paymentText}>
            {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </Text>
        </View>
      )}
    </View>
  );
};

// Reason Modal Component
const ReasonModal = ({ visible, onClose, reason, type }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {type === 'rejected' ? 'Rejection Reason' : 'Cancellation Reason'}
        </Text>
        <Text style={styles.reasonText}>
          {reason || 'No reason provided'}
        </Text>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const ScheduleHistoryScreen = ({ navigation, route }) => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Function to get icon based on sacrament type
  const getSacramentIcon = (sacrament) => {
    switch (sacrament) {
      case 'Baptism':
        return 'water-outline';
      case 'Matrimony':
      case 'Kasal':
        return 'heart-outline';
      case 'Eucharist':
        return 'wine-outline';
      case 'Confirmation':
      case 'Kumpil':
        return 'flame-outline';
      case 'Reconciliation':
        return 'chatbubbles-outline';
      case 'Anointing of the Sick':
        return 'medkit-outline';
      case 'Holy Orders':
        return 'person-add-outline';
      default:
        return 'calendar-outline';
    }
  };

  // Function to format date from API
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      let date;
      if (dateString.$date && dateString.$date.$numberLong) {
        date = new Date(parseInt(dateString.$date.$numberLong, 10));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not set';
    }
  };

  // Enhanced function to get sacrament-specific details with payment and reason data
  const getSacramentDetails = (sacrament, data) => {
    // IMPORTANT FIX: Include 'reason' field along with rejectionReason and cancellationReason
    const rejectionReason = data.rejectionReason || data.reason || '';
    const cancellationReason = data.cancellationReason || data.reason || '';
    
    const baseDetails = {
      name: 'Not specified',
      date: 'Date not set',
      time: 'Time not set',
      details: `${sacrament} request`,
      paymentStatus: data.paymentStatus || 'unpaid',
      rejectionReason: rejectionReason,
      cancellationReason: cancellationReason,
      adminNotes: data.adminNotes || '',
      amount: data.amount || '0',
      paymentDate: data.paymentDate ? formatDate(data.paymentDate) : null,
      submittedDate: formatDate(data.createdAt || data.submittedDate),
    };

    switch (sacrament) {
      case 'Baptism':
        return {
          ...baseDetails,
          name: data.name || 'Not specified',
          date: formatDate(data.baptismDate),
          time: data.baptismTime || 'Time not set',
          details: `Baptismal request for ${data.name}. ${data.fatherName ? `Father: ${data.fatherName}` : ''} ${data.motherName ? `Mother: ${data.motherName}` : ''}`,
          amount: data.amount || '500',
        };
      case 'Kumpil':
        return {
          ...baseDetails,
          name: data.confirmandName || 'Not specified',
          date: formatDate(data.kumpilDate),
          time: data.kumpilTime || 'Time not set',
          details: `Confirmation request for ${data.confirmandName}. ${data.age ? `Age: ${data.age}` : ''}`,
          amount: data.amount || '300',
        };
      case 'Kasal':
        return {
          ...baseDetails,
          name: `${data.groomName || 'Groom'} & ${data.brideName || 'Bride'}`,
          date: formatDate(data.marriageDate),
          time: data.marriageTime || 'Time not set',
          details: `Marriage request for ${data.groomName || 'Groom'} and ${data.brideName || 'Bride'}`,
          amount: data.amount || '2000',
        };
      default:
        return baseDetails;
    }
  };

  // Function to show reason modal
  const showReasonModal = (reason, type) => {
    console.log('Showing reason modal:', { reason, type });
    setSelectedReason(reason);
    setSelectedType(type);
    setModalVisible(true);
  };

  // Enhanced function to fetch ALL sacrament requests from API by USER EMAIL
  const fetchAllRequests = async (email) => {
    if (!email) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('Fetching all sacrament requests for:', email);
      
      // Fetch requests from all sacrament endpoints
      const endpoints = [
        `${API_URL}/baptismrequests/${email}`,
        `${API_URL}/kumpil_requests`,
        `${API_URL}/marriage_requests`
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(endpoint).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
        )
      );

      let allData = [];

      // Process baptism requests
      if (responses[0].status === 'fulfilled' && Array.isArray(responses[0].value)) {
        const baptismRequests = responses[0].value
          .filter(item => item.submittedByEmail === email)
          .map(item => {
            console.log('Baptism item reason:', item.reason); // Debug log
            return {
              id: item._id?.$oid || item._id || Math.random().toString(),
              sacrament: 'Baptism',
              ...getSacramentDetails('Baptism', item),
              status: item.status || 'pending',
              icon: getSacramentIcon('Baptism'),
              fullData: item,
              collection: 'baptismrequests'
            };
          });
        allData = [...allData, ...baptismRequests];
      }

      // Process kumpil requests
      if (responses[1].status === 'fulfilled' && Array.isArray(responses[1].value)) {
        const kumpilRequests = responses[1].value
          .filter(item => item.submittedByEmail === email)
          .map(item => {
            console.log('Kumpil item reason:', item.reason); // Debug log
            return {
              id: item._id?.$oid || item._id || Math.random().toString(),
              sacrament: 'Kumpil',
              ...getSacramentDetails('Kumpil', item),
              status: item.status || 'pending',
              icon: getSacramentIcon('Kumpil'),
              fullData: item,
              collection: 'kumpilrequests'
            };
          });
        allData = [...allData, ...kumpilRequests];
      }

      // Process marriage requests
      if (responses[2].status === 'fulfilled' && Array.isArray(responses[2].value)) {
        const marriageRequests = responses[2].value
          .filter(item => item.submittedByEmail === email)
          .map(item => {
            console.log('Marriage item reason:', item.reason); // Debug log
            return {
              id: item._id?.$oid || item._id || Math.random().toString(),
              sacrament: 'Kasal',
              ...getSacramentDetails('Kasal', item),
              status: item.status || 'pending',
              icon: getSacramentIcon('Kasal'),
              fullData: item,
              collection: 'marriagerequests'
            };
          });
        allData = [...allData, ...marriageRequests];
      }

      // Sort by date (newest first)
      allData.sort((a, b) => {
        const dateA = new Date(a.fullData.createdAt || 0);
        const dateB = new Date(b.fullData.createdAt || 0);
        return dateB - dateA;
      });

      setAllRequests(allData);
      
      console.log(`✅ Loaded ${allData.length} total requests`);
      // Debug: Check if reasons are being captured
      allData.forEach((item, index) => {
        if (item.status === 'rejected' || item.status === 'cancelled') {
          console.log(`Item ${index} - Status: ${item.status}, RejectionReason: ${item.rejectionReason}, CancellationReason: ${item.cancellationReason}`);
        }
      });

    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to load your requests. Please check your connection.');
      setAllRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load user data and fetch all requests
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
          await fetchAllRequests(user.email);
        } else {
          setLoading(false);
          setAllRequests([]);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Handler for refreshing data
  const handleRefresh = async () => {
    if (userEmail) {
      setRefreshing(true);
      await fetchAllRequests(userEmail);
    }
  };

  // Handler for item press
  const handleItemPress = (item) => {
    navigation.navigate("ScheduleDetailScreen", { 
      scheduleData: item 
    });
  };

  // Function to navigate to specific sacrament form
  const navigateToSacramentForm = (sacrament) => {
    switch (sacrament) {
      case 'Baptism':
        navigation.navigate('BaptismForm');
        break;
      case 'Kumpil':
        navigation.navigate('KumpilForm');
        break;
      case 'Kasal':
        navigation.navigate('MarriageForm');
        break;
      default:
        Alert.alert('Info', 'Form not available for this sacrament.');
    }
  };

  const renderItemCard = (item) => {
    console.log('Rendering item:', { 
      status: item.status, 
      rejectionReason: item.rejectionReason,
      cancellationReason: item.cancellationReason 
    }); // Debug log
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={item.icon} size={28} color={PRIMARY_COLOR} />
          <View style={styles.titleContainer}>
            <Text style={styles.sacramentName}>{item.sacrament}</Text>
            <Text style={styles.requestName}>{item.name}</Text>
          </View>
          <StatusBadge status={item.status} paymentStatus={item.paymentStatus} />
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailText}>Schedule: {item.date} at {item.time}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            Payment: {item.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} 
            {item.amount && ` - ₱${item.amount}`}
            {item.paymentDate && ` on ${item.paymentDate}`}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="information-circle-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailText} numberOfLines={2}>{item.details}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailText}>Submitted: {item.submittedDate}</Text>
        </View>

        {/* Show rejection/cancellation reason if available */}
        {(item.status === 'rejected' && item.rejectionReason) && (
          <TouchableOpacity 
            style={styles.reasonButton}
            onPress={() => showReasonModal(item.rejectionReason, 'rejected')}
          >
            <Ionicons name="warning-outline" size={16} color="#ef4444" />
            <Text style={styles.reasonButtonText}>View Rejection Reason</Text>
          </TouchableOpacity>
        )}

        {(item.status === 'cancelled' && item.cancellationReason) && (
          <TouchableOpacity 
            style={styles.reasonButton}
            onPress={() => showReasonModal(item.cancellationReason, 'cancelled')}
          >
            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            <Text style={styles.reasonButtonText}>View Cancellation Reason</Text>
          </TouchableOpacity>
        )}

        {/* Show admin notes if available */}
        {item.adminNotes && (
          <View style={styles.adminNotesContainer}>
            <Ionicons name="document-text-outline" size={16} color="#3b82f6" />
            <Text style={styles.adminNotesText}>Admin Notes: {item.adminNotes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND_COLOR} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>My Sacrament Requests</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {userEmail ? (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>Viewing requests for: {userEmail}</Text>
        </View>
      ) : null}

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Loading your requests...</Text>
          </View>
        ) : allRequests.length > 0 ? (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[PRIMARY_COLOR]}
              />
            }
          >
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                You have {allRequests.length} total sacrament request{allRequests.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.summarySubtext}>
                Track your requests, payment status, and any updates here
              </Text>
            </View>
            
            {allRequests.map(renderItemCard)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={50} color="#9ca3af" />
            <Text style={styles.emptyText}>No sacrament requests found.</Text>
            <Text style={styles.emptySubtext}>
              {userEmail 
                ? `You haven't submitted any sacrament requests yet.`
                : 'Please login to view your requests.'
              }
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => navigateToSacramentForm('Baptism')}
              >
                <Ionicons name="water-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Baptism Request</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => navigateToSacramentForm('Kumpil')}
              >
                <Ionicons name="flame-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Kumpil Request</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => navigateToSacramentForm('Kasal')}
              >
                <Ionicons name="heart-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Marriage Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Reason Modal */}
      <ReasonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        reason={selectedReason}
        type={selectedType}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 2,
  },
  backButton: { padding: 5 },
  refreshButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: "800", color: PRIMARY_COLOR },
  userInfo: {
    padding: 10,
    backgroundColor: SECONDARY_COLOR,
    alignItems: 'center',
  },
  userText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  contentContainer: { flex: 1, paddingTop: 10 },
  scrollContainer: { flex: 1 },
  scrollViewContent: { paddingHorizontal: 20, paddingBottom: 20 },
  summaryContainer: {
    backgroundColor: '#e0f2fe',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: SECONDARY_COLOR,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  sacramentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  requestName: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 15,
    marginBottom: 4,
  },
  statusText: { 
    color: CARD_BACKGROUND, 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paymentText: {
    color: CARD_BACKGROUND,
    fontSize: 10,
    fontWeight: "bold",
  },
  detailRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    marginTop: 8 
  },
  detailIcon: { 
    marginRight: 8, 
    marginTop: 2 
  },
  detailText: { 
    fontSize: 14, 
    color: "#374151", 
    fontWeight: "500",
    flex: 1,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  reasonButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  adminNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  adminNotesText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: PRIMARY_COLOR,
  },
  emptyState: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 40 
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#6b7280", 
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: { 
    fontSize: 14, 
    color: "#9ca3af", 
    marginTop: 5, 
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    gap: 10,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 15,
    textAlign: 'center',
  },
  reasonText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'left',
  },
  modalCloseButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScheduleHistoryScreen;
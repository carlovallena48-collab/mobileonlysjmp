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
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PRIMARY_COLOR = "#047857";
const SECONDARY_COLOR = "#34d399";
const BACKGROUND_COLOR = "#f0fdfa";
const CARD_BACKGROUND = "#ffffff";

// API URL
const API_URL = "http://10.173.231.17:5000/api";
const USER_STORAGE_KEY = '@userData';

// Enhanced Status Badge with Payment Status
const StatusBadge = ({ status, paymentStatus }) => {
  let color = "#9ca3af";
  let text = status;

  switch (status?.toLowerCase()) {
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
    case "canceled":
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
        <ScrollView style={styles.reasonScroll}>
          <Text style={styles.reasonText}>
            {reason || 'No reason provided'}
          </Text>
        </ScrollView>
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
      case 'Kumpil':
        return 'flame-outline';
      case 'Kasal':
        return 'heart-outline';
      case 'Pamisa':
        return 'book-outline';
      case 'Blessing':
        return 'star-outline';
      case 'Holy Orders':
        return 'person-add-outline';
      case 'First Communion':
        return 'wine-outline';
      case 'Funeral Service':
        return 'flower-outline';
      default:
        return 'calendar-outline';
    }
  };

  // IMPROVED function to format date from API - FIXED FOR ALL DATE FORMATS
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      let date;
      
      console.log('📅 Formatting date:', dateString, 'Type:', typeof dateString);
      
      // Handle MongoDB date format
      if (dateString?.$date?.$numberLong) {
        date = new Date(parseInt(dateString.$date.$numberLong, 10));
      } 
      // Handle string dates in MM/DD/YYYY format (from Funeral form)
      else if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1; // Months are 0-indexed
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          date = new Date(year, month, day);
        } else {
          // Return the original string if it's already in readable format
          return dateString;
        }
      }
      // Handle ISO string dates
      else if (typeof dateString === 'string') {
        date = new Date(dateString);
      }
      // Handle Date objects
      else if (dateString instanceof Date) {
        date = dateString;
      }
      // Handle timestamp
      else if (typeof dateString === 'number') {
        date = new Date(dateString);
      }
      else {
        return dateString; // Return as is if we can't parse it
      }
      
      if (isNaN(date.getTime())) {
        console.warn('❌ Invalid date:', dateString);
        return dateString || 'Date not set';
      }
      
      const formatted = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return formatted;
    } catch (error) {
      console.error('❌ Date formatting error:', error, dateString);
      return dateString || 'Date not set';
    }
  };

  // Improved function to format time
  const formatTime = (timeString) => {
    if (!timeString) return 'Time not set';
    
    try {
      // If it's already in a readable format, return as is
      if (typeof timeString === 'string' && (timeString.includes(':') || timeString.includes('AM') || timeString.includes('PM'))) {
        return timeString;
      }
      
      // Handle time objects or other formats
      return String(timeString);
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Time not set';
    }
  };

  // ENHANCED function to get sacrament-specific details - COMPLETELY REWRITTEN
  const getSacramentDetails = (sacrament, data) => {
    console.log(`🔍 Processing ${sacrament} data:`, data);

    const baseDetails = {
      name: 'Not specified',
      date: 'Date not set',
      time: 'Time not set',
      details: `${sacrament} request`,
      paymentStatus: data.paymentStatus || 'unpaid',
      rejectionReason: data.rejectionReason || data.reason || '',
      cancellationReason: data.cancellationReason || data.reason || '',
      adminNotes: data.adminNotes || '',
      amount: data.amount || data.fee || data.donation || '0',
      paymentDate: data.paymentDate ? formatDate(data.paymentDate) : null,
      submittedDate: formatDate(data.createdAt || data.submittedDate || data.requestDate),
      status: data.status || 'pending',
    };

    switch (sacrament) {
      case 'Baptism':
        return {
          ...baseDetails,
          name: data.name || 'Not specified',
          date: formatDate(data.baptismDate || data.dateOfWedding || data.date),
          time: formatTime(data.baptismTime || data.timeOfWedding || data.time),
          details: `Baptismal request for ${data.name}`,
          amount: data.fee || data.amount || '500',
          baptismType: data.baptismType || 'Common Baptism',
          // Additional baptism details
          birthDate: data.birthDate ? formatDate(data.birthDate) : 'Not specified',
          fatherName: data.fatherName || 'Not specified',
          motherName: data.motherName || 'Not specified',
          godfather: data.godfather || 'Not specified',
          godmother: data.godmother || 'Not specified',
        };
      
      case 'Kumpil':
        return {
          ...baseDetails,
          name: data.confirmandName || data.name || 'Not specified',
          date: formatDate(data.kumpilDate || data.date),
          time: formatTime(data.kumpilTime || data.time),
          details: `Confirmation request for ${data.confirmandName || data.name}`,
          amount: data.fee || data.amount || '300',
          // Additional kumpil details
          age: data.age || 'Not specified',
          baptismDate: data.baptismDate ? formatDate(data.baptismDate) : 'Not specified',
          baptismChurch: data.baptismChurch || 'Not specified',
          godfatherName: data.godfatherName || 'Not specified',
          godmotherName: data.godmotherName || 'Not specified',
        };
      
      case 'Kasal':
        return {
          ...baseDetails,
          name: `${data.groomName || 'Groom'} & ${data.brideName || 'Bride'}`,
          date: formatDate(data.dateOfWedding || data.marriageDate || data.date),
          time: formatTime(data.timeOfWedding || data.marriageTime || data.time),
          details: `Marriage request`,
          amount: data.reservationFee || data.fee || data.amount || '2000',
          // Additional marriage details
          groomName: data.groomName || 'Not specified',
          brideName: data.brideName || 'Not specified',
          groomAge: data.groomAge || 'Not specified',
          brideAge: data.brideAge || 'Not specified',
          interviewDate: data.interviewDate ? formatDate(data.interviewDate) : 'Not scheduled',
          seminarDate: data.seminarDate ? formatDate(data.seminarDate) : 'Not scheduled',
          balance: data.balance || '0',
        };
      
      case 'Pamisa':
        return {
          ...baseDetails,
          name: Array.isArray(data.names) ? data.names.join(', ') : (data.names || 'Not specified'),
          date: data.displayDate || formatDate(data.date) || 'Date not set',
          time: data.displayTime || formatTime(data.time) || 'Time not set',
          details: `Mass intention: ${data.intention || 'Not specified'}`,
          amount: data.donation || data.amount || '0',
          // Additional pamisa details
          intention: data.intention || 'Not specified',
          massSponsor: data.massSponsor || 'Not specified',
        };
      
      case 'Blessing':
        return {
          ...baseDetails,
          name: data.name || 'Not specified',
          date: data.displayDate || formatDate(data.date) || 'Date not set',
          time: data.displayTime || formatTime(data.time) || 'Time not set',
          details: `Blessing for: ${data.blessingType || 'Not specified'}`,
          amount: data.donation || data.amount || '0',
          // Additional blessing details
          blessingType: data.blessingType || 'Not specified',
          requestForDetails: data.requestForDetails || 'Not specified',
          address: data.address || 'Not specified',
        };
      
      case 'Holy Orders':
        return {
          ...baseDetails,
          name: data.name || 'Not specified',
          date: 'To be scheduled',
          time: 'To be scheduled',
          details: `Vocational calling application - ${data.name}`,
          amount: '0',
          // Additional holy orders details
          contactNumber: data.contactNumber || 'Not specified',
          references: data.references || [],
        };
      
      case 'First Communion':
        return {
          ...baseDetails,
          name: data.childName || data.name || 'Not specified',
          date: formatDate(data.communionDate || data.date),
          time: formatTime(data.communionTime || data.time),
          details: `First Communion request for ${data.childName || data.name}`,
          amount: data.fee || data.amount || '300',
          // Additional first communion details
          age: data.age || 'Not specified',
          birthDate: data.birthDate ? formatDate(data.birthDate) : 'Not specified',
          parentsName: data.parentsName || 'Not specified',
        };
      
      case 'Funeral Service':
        return {
          ...baseDetails,
          name: data.nameOfDeceased || 'Not specified',
          date: formatDate(data.scheduleDate || data.date) || 'Date not set',
          time: formatTime(data.scheduleTime || data.time) || 'Time not set',
          details: `Funeral service for ${data.nameOfDeceased || 'deceased'}`,
          amount: data.donation || data.amount || '0',
          // Additional funeral details
          causeOfDeath: data.causeOfDeath || '',
          placeOfBurial: data.placeOfBurialCemetery || '',
          informant: data.informant || '',
          relationship: data.relationship || '',
          age: data.age || '',
          birthday: data.birthday ? formatDate(data.birthday) : 'Not specified',
          dateDied: data.dateDied ? formatDate(data.dateDied) : 'Not specified',
        };
      
      default:
        return baseDetails;
    }
  };

  // Function to show reason modal
  const showReasonModal = (reason, type) => {
    setSelectedReason(reason);
    setSelectedType(type);
    setModalVisible(true);
  };

  // CRITICAL FIX: Enhanced function to verify request belongs to current user
  const verifyRequestOwnership = (request, userEmail) => {
    const submittedBy = request.submittedByEmail || request.email;
    console.log(`🔍 Verifying ownership: ${submittedBy} vs ${userEmail}`);
    
    return submittedBy && submittedBy.toLowerCase() === userEmail.toLowerCase();
  };

  // IMPROVED: Fetch all requests using API endpoints with OWNERSHIP VERIFICATION
  const fetchAllRequestsByEmail = async (email) => {
    if (!email) {
      console.log('❌ No email provided for fetching requests');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('🔍 Fetching all requests for logged-in user:', email);
      
      const endpoints = [
        { url: `${API_URL}/baptismrequests/${email}`, type: 'Baptism' },
        { url: `${API_URL}/kumpil_requests/${email}`, type: 'Kumpil' },
        { url: `${API_URL}/marriage_requests/${email}`, type: 'Kasal' },
        { url: `${API_URL}/pamisa_requests/${email}`, type: 'Pamisa' },
        { url: `${API_URL}/blessing_requests/${email}`, type: 'Blessing' },
        { url: `${API_URL}/holy_orders_requests/${email}`, type: 'Holy Orders' },
        { url: `${API_URL}/first_communion_requests/${email}`, type: 'First Communion' },
        { url: `${API_URL}/funeral_requests/${email}`, type: 'Funeral Service' }
      ];

      let allData = [];
      let successfulFetches = 0;

      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Fetching ${endpoint.type} from: ${endpoint.url}`);
          
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });
          
          if (!response.ok) {
            console.log(`❌ ${endpoint.type} endpoint failed:`, response.status, response.statusText);
            continue;
          }

          const data = await response.json();
          console.log(`✅ ${endpoint.type} raw response count:`, Array.isArray(data) ? data.length : 'Not array');

          if (Array.isArray(data)) {
            // CRITICAL: Filter requests to only include those belonging to the current user
            const userRequests = data.filter(request => 
              verifyRequestOwnership(request, email)
            );

            console.log(`👤 ${endpoint.type} user-specific requests:`, userRequests.length);

            const formattedRequests = userRequests.map(item => {
              const details = getSacramentDetails(endpoint.type, item);
              return {
                id: item._id?.$oid || item._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sacrament: endpoint.type,
                ...details,
                status: item.status || 'pending',
                icon: getSacramentIcon(endpoint.type),
                fullData: item,
                collection: endpoint.type.toLowerCase().replace(' ', '_') + 'requests',
                requestNumber: item.requestNumber || `REQ-${Date.now()}`,
                submittedBy: item.submittedByEmail || item.email,
              };
            });

            allData = [...allData, ...formattedRequests];
            successfulFetches++;
            
            console.log(`✅ ${endpoint.type} user requests after filtering:`, formattedRequests.length);
          } else {
            console.log(`⚠️ ${endpoint.type} response is not an array:`, typeof data);
          }
        } catch (error) {
          console.error(`❌ Error fetching ${endpoint.type}:`, error.message);
        }
      }

      console.log(`📊 REQUEST SUMMARY:`);
      console.log(`   ✅ Successful fetches: ${successfulFetches}/${endpoints.length}`);
      console.log(`   🎯 Final user requests: ${allData.length}`);

      // Sort by date (newest first)
      allData.sort((a, b) => {
        const dateA = new Date(a.fullData.createdAt || a.fullData.requestDate || 0);
        const dateB = new Date(b.fullData.createdAt || b.fullData.requestDate || 0);
        return dateB - dateA;
      });

      setAllRequests(allData);
      
      console.log(`✅ FINAL: Loaded ${allData.length} requests for user: ${email}`);
      console.log('📊 Breakdown by sacrament:');
      endpoints.forEach(endpoint => {
        const count = allData.filter(item => item.sacrament === endpoint.type).length;
        console.log(`   ${endpoint.type}: ${count}`);
      });

    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to load your requests. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
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
        setLoading(true);
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 CURRENT LOGGED-IN USER:', user.email);
          setUserEmail(user.email);
          await fetchAllRequestsByEmail(user.email);
        } else {
          console.log('❌ No user data found in storage - user not logged in');
          setLoading(false);
          setAllRequests([]);
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data.');
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userEmail) {
        console.log('🔄 Screen focused, refreshing data for user:', userEmail);
        handleRefresh();
      }
    });

    return unsubscribe;
  }, [navigation, userEmail]);

  // Handler for refreshing data
  const handleRefresh = async () => {
    if (userEmail) {
      console.log('🔄 Manual refresh triggered for user:', userEmail);
      setRefreshing(true);
      await fetchAllRequestsByEmail(userEmail);
    } else {
      setRefreshing(false);
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
    const formRoutes = {
      'Baptism': 'BaptismForm',
      'Kumpil': 'KumpilForm',
      'Kasal': 'MarriageForm',
      'Pamisa': 'PamisaForm',
      'Blessing': 'BlessingForm',
      'Holy Orders': 'HolyOrdersForm',
      'First Communion': 'FirstCommunionForm',
      'Funeral Service': 'FuneralForm'
    };

    const route = formRoutes[sacrament];
    if (route) {
      navigation.navigate(route);
    } else {
      Alert.alert('Info', 'Form not available for this sacrament.');
    }
  };

  // ENHANCED function to render sacrament-specific details
  const renderSacramentSpecificDetails = (item) => {
    const details = [];

    switch (item.sacrament) {
      case 'Baptism':
        if (item.baptismType) {
          details.push(`Type: ${item.baptismType}`);
        }
        if (item.birthDate && item.birthDate !== 'Not specified') {
          details.push(`Birth: ${item.birthDate}`);
        }
        if (item.fatherName && item.fatherName !== 'Not specified') {
          details.push(`Father: ${item.fatherName}`);
        }
        if (item.motherName && item.motherName !== 'Not specified') {
          details.push(`Mother: ${item.motherName}`);
        }
        break;
      
      case 'Kumpil':
        if (item.age && item.age !== 'Not specified') {
          details.push(`Age: ${item.age}`);
        }
        if (item.baptismDate && item.baptismDate !== 'Not specified') {
          details.push(`Baptized: ${item.baptismDate}`);
        }
        if (item.godfatherName && item.godfatherName !== 'Not specified') {
          details.push(`Godfather: ${item.godfatherName}`);
        }
        break;
      
      case 'Kasal':
        if (item.groomName && item.groomName !== 'Not specified') {
          details.push(`Groom: ${item.groomName}`);
        }
        if (item.brideName && item.brideName !== 'Not specified') {
          details.push(`Bride: ${item.brideName}`);
        }
        if (item.interviewDate && item.interviewDate !== 'Not scheduled') {
          details.push(`Interview: ${item.interviewDate}`);
        }
        if (item.balance && item.balance !== '0') {
          details.push(`Balance: ₱${item.balance}`);
        }
        break;
      
      case 'Pamisa':
        if (item.intention && item.intention !== 'Not specified') {
          details.push(`Intention: ${item.intention}`);
        }
        if (item.massSponsor && item.massSponsor !== 'Not specified') {
          details.push(`Sponsor: ${item.massSponsor}`);
        }
        break;
      
      case 'Blessing':
        if (item.blessingType && item.blessingType !== 'Not specified') {
          details.push(`Type: ${item.blessingType}`);
        }
        if (item.requestForDetails && item.requestForDetails !== 'Not specified') {
          details.push(`For: ${item.requestForDetails}`);
        }
        break;
      
      case 'Funeral Service':
        if (item.causeOfDeath) {
          details.push(`Cause: ${item.causeOfDeath}`);
        }
        if (item.placeOfBurial) {
          details.push(`Burial: ${item.placeOfBurial}`);
        }
        if (item.informant) {
          details.push(`Informant: ${item.informant}`);
        }
        if (item.age) {
          details.push(`Age: ${item.age}`);
        }
        break;
      
      case 'First Communion':
        if (item.age && item.age !== 'Not specified') {
          details.push(`Age: ${item.age}`);
        }
        if (item.parentsName && item.parentsName !== 'Not specified') {
          details.push(`Parents: ${item.parentsName}`);
        }
        break;
    }

    return details.map((detail, index) => (
      <View key={index} style={styles.specificDetailRow}>
        <Ionicons name="ellipse" size={8} color="#6b7280" style={styles.detailIcon} />
        <Text style={styles.specificDetailText}>{detail}</Text>
      </View>
    ));
  };

  const renderItemCard = (item, index) => {
    const isHolyOrders = item.sacrament === 'Holy Orders';
    const isFuneralService = item.sacrament === 'Funeral Service';
    
    return (
      <TouchableOpacity
        key={item.id || `item-${index}`}
        style={[
          styles.card,
          isHolyOrders && styles.holyOrdersCard,
          isFuneralService && styles.funeralCard
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Ionicons 
            name={item.icon} 
            size={28} 
            color={isHolyOrders ? PRIMARY_COLOR : (isFuneralService ? '#7e22ce' : SECONDARY_COLOR)}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.sacramentName}>{item.sacrament}</Text>
            <Text style={styles.requestName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <StatusBadge status={item.status} paymentStatus={item.paymentStatus} />
        </View>

        {/* Schedule Information */}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {isHolyOrders ? 'Application Date:' : 'Schedule:'} {item.date} {!isHolyOrders && `at ${item.time}`}
          </Text>
        </View>

        {/* Sacrament Specific Details */}
        {renderSacramentSpecificDetails(item)}

        {/* Payment Information */}
        {item.amount !== '0' && item.amount !== '0' && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#6b7280" style={styles.detailIcon} />
            <Text style={styles.detailText}>
              Payment: {item.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} 
              {item.amount && ` - ₱${item.amount}`}
            </Text>
          </View>
        )}

        {/* Request Details */}
        <View style={styles.detailRow}>
          <Ionicons name="information-circle-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailText} numberOfLines={2}>{item.details}</Text>
        </View>

        {/* Submission Date */}
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

        {/* Special note for Holy Orders */}
        {isHolyOrders && (
          <View style={styles.specialNote}>
            <Ionicons name="information-circle" size={16} color={PRIMARY_COLOR} />
            <Text style={styles.specialNoteText}>
              This is a vocational application. The parish will contact you for further steps.
            </Text>
          </View>
        )}

        {/* Special note for Funeral Service */}
        {isFuneralService && (
          <View style={styles.specialNote}>
            <Ionicons name="information-circle" size={16} color="#7e22ce" />
            <Text style={styles.specialNoteText}>
              Funeral service request. The parish will contact you for confirmation.
            </Text>
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
                tintColor={PRIMARY_COLOR}
              />
            }
          >
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                You have {allRequests.length} sacrament request{allRequests.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.summarySubtext}>
                These are all requests submitted by you ({userEmail})
              </Text>
            </View>
            
            {allRequests.map((item, index) => renderItemCard(item, index))}
            
            <View style={styles.footerNote}>
              <Text style={styles.footerNoteText}>
                💡 Pull down to refresh and see the latest updates
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color="#9ca3af" />
            <Text style={styles.emptyText}>No Sacrament Requests</Text>
            <Text style={styles.emptySubtext}>
              {userEmail 
                ? `You haven't submitted any sacrament requests yet using ${userEmail}. Start by choosing a sacrament below.`
                : 'Please login to view your sacrament requests.'
              }
            </Text>
            
            {userEmail && (
              <View style={styles.buttonContainer}>
                {[
                  { sacrament: 'Baptism', icon: 'water-outline' },
                  { sacrament: 'Kumpil', icon: 'flame-outline' },
                  { sacrament: 'Kasal', icon: 'heart-outline' },
                  { sacrament: 'Pamisa', icon: 'book-outline' },
                  { sacrament: 'Blessing', icon: 'star-outline' },
                  { sacrament: 'Holy Orders', icon: 'person-add-outline' },
                  { sacrament: 'First Communion', icon: 'wine-outline' },
                  { sacrament: 'Funeral Service', icon: 'flower-outline' },
                ].map(({ sacrament, icon }) => (
                  <TouchableOpacity 
                    key={sacrament}
                    style={styles.submitButton}
                    onPress={() => navigateToSacramentForm(sacrament)}
                  >
                    <Ionicons name={icon} size={20} color="white" />
                    <Text style={styles.submitButtonText}>{sacrament}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  safeArea: { 
    flex: 1, 
    backgroundColor: BACKGROUND_COLOR 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: { 
    padding: 8 
  },
  refreshButton: { 
    padding: 8 
  },
  title: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: PRIMARY_COLOR 
  },
  userInfo: {
    padding: 12,
    backgroundColor: SECONDARY_COLOR + '20',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: SECONDARY_COLOR + '40',
  },
  userText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
  contentContainer: { 
    flex: 1, 
    paddingTop: 8 
  },
  scrollContainer: { 
    flex: 1 
  },
  scrollViewContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 20 
  },
  summaryContainer: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: SECONDARY_COLOR,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  holyOrdersCard: {
    borderLeftColor: PRIMARY_COLOR,
    backgroundColor: '#f0f9ff',
  },
  funeralCard: {
    borderLeftColor: '#7e22ce',
    backgroundColor: '#faf5ff',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  sacramentName: {
    fontSize: 16,
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
    minWidth: 80,
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: { 
    color: CARD_BACKGROUND, 
    fontSize: 11, 
    fontWeight: "700",
    textAlign: 'center',
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentText: {
    color: CARD_BACKGROUND,
    fontSize: 10,
    fontWeight: "700",
  },
  detailRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    marginTop: 6 
  },
  specificDetailRow: {
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4,
    marginLeft: 8,
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
    lineHeight: 18,
  },
  specificDetailText: {
    fontSize: 13, 
    color: "#6b7280", 
    fontWeight: "400",
    flex: 1,
    lineHeight: 16,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  reasonButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  adminNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  adminNotesText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  specialNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  specialNoteText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  emptyState: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 24 
  },
  emptyText: { 
    fontSize: 20, 
    fontWeight: "600", 
    color: "#6b7280", 
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: { 
    fontSize: 16, 
    color: "#9ca3af", 
    marginTop: 8, 
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
    gap: 8,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  footerNote: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  footerNoteText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
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
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  reasonText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
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
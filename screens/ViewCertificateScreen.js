import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#047857';
const SECONDARY_COLOR = '#34d399';
const BACKGROUND_COLOR = '#f0fdfa';
const CARD_BACKGROUND = '#ffffff';

const API_URL = "http://192.168.100.199:5000/api";
const USER_STORAGE_KEY = '@userData';

// Reason Modal Component
const ReasonModal = ({ visible, onClose, reason, type }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.reasonModalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {type === 'rejected' ? 'Rejection Reason' : 
             type === 'cancelled' ? 'Cancellation Reason' : 
             'Reason'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
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

const ViewCertificateScreen = ({ navigation, route }) => {
  const [userEmail, setUserEmail] = useState('');
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedReasonType, setSelectedReasonType] = useState('');

  // Load user data first
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 CURRENT LOGGED-IN USER for Certificates:', user.email);
          setUserEmail(user.email);
        } else {
          console.log('❌ No user data found in storage');
          Alert.alert('Error', 'Please login to view your certificate requests');
          navigation.goBack();
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserData();
  }, [navigation]);

  // Load certificate requests when user email is available
  useEffect(() => {
    if (userEmail) {
      loadCertificateRequests();
    }
  }, [userEmail]);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userEmail) {
        console.log('🔄 Certificate screen focused, refreshing data for user:', userEmail);
        loadCertificateRequests();
      }
    });

    return unsubscribe;
  }, [navigation, userEmail]);

  // ENHANCED REASON EXTRACTION - Same as ScheduleHistoryScreen
  const extractReasons = (data) => {
    console.log(`🔍 [CERTIFICATE REASON DEBUG] Extracting reasons from:`, {
      status: data.status,
      hasRejectionReason: !!data.rejectionReason,
      hasCancellationReason: !!data.cancellationReason,
      hasAdminNotes: !!data.adminNotes,
      hasRemarks: !!data.remarks
    });
    
    // Check ALL possible field names for rejection reasons
    const rejectionReason = 
      data.rejectionReason || 
      data.reason || 
      data.adminNotes || 
      data.remarks ||
      data.rejectionNotes ||
      data.rejection_message ||
      data.rejection_note ||
      data.rejection_reason ||
      data.rejected_reason ||
      data.cancel_reason || // Sometimes used for both
      data.notes || // General notes field
      data.admin_notes ||
      data.status_reason ||
      data.rejection_notes ||
      data.rejectionMessage ||
      '';
    
    // Check ALL possible field names for cancellation reasons  
    const cancellationReason = 
      data.cancellationReason ||
      data.cancelReason || 
      data.cancel_reason ||
      data.cancelled_reason ||
      data.cancellation_reason ||
      data.cancellation_notes ||
      data.cancel_notes ||
      data.cancellationMessage ||
      data.reason || // Fallback to general reason
      data.adminNotes || // Fallback to admin notes
      data.remarks || // Fallback to remarks
      '';

    // Additional admin notes from any field
    const adminNotes = 
      data.adminNotes ||
      data.remarks ||
      data.notes ||
      data.admin_notes ||
      data.additional_notes ||
      data.comments ||
      '';

    console.log(`📝 [CERTIFICATE REASON DEBUG] Extracted reasons:`, {
      rejectionReason: rejectionReason.substring(0, 50) + (rejectionReason.length > 50 ? '...' : ''),
      cancellationReason: cancellationReason.substring(0, 50) + (cancellationReason.length > 50 ? '...' : ''),
      adminNotes: adminNotes.substring(0, 50) + (adminNotes.length > 50 ? '...' : ''),
      hasRejection: !!rejectionReason,
      hasCancellation: !!cancellationReason,
      hasAdminNotes: !!adminNotes,
      status: data.status
    });
    
    return { 
      rejectionReason, 
      cancellationReason, 
      adminNotes 
    };
  };

  const loadCertificateRequests = async () => {
    try {
      if (!userEmail) {
        console.log('❌ No user email available for loading certificate requests');
        return;
      }

      console.log('🔍 Loading certificate requests for user:', userEmail);
      setIsLoading(true);
      
      // Load user-specific requests - CRITICAL: Only show requests submitted by this user
      const response = await fetch(`${API_URL}/certificate-requests/user/${userEmail}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Loaded certificate requests:', result.data?.length || 0);
      
      if (result.success) {
        // ENHANCED: Add reason extraction to each certificate request
        const requestsWithReasons = (result.data || []).map(request => {
          const { rejectionReason, cancellationReason, adminNotes } = extractReasons(request);
          return {
            ...request,
            rejectionReason,
            cancellationReason,
            adminNotes
          };
        });

        console.log(`📊 Certificate requests with reasons:`, requestsWithReasons.length);
        
        // DEBUG: Check for rejected/cancelled certificate requests
        const rejectedCertificates = requestsWithReasons.filter(req => 
          req.status === 'Rejected' || req.status === 'Cancelled'
        );
        
        console.log(`🚨 REJECTED/CANCELLED CERTIFICATES FOUND: ${rejectedCertificates.length}`);
        rejectedCertificates.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.certificateType} - ${req.status}`);
          console.log(`      Rejection Reason: ${req.rejectionReason}`);
          console.log(`      Cancellation Reason: ${req.cancellationReason}`);
        });

        setCertificateRequests(requestsWithReasons);
      } else {
        throw new Error(result.message || 'Failed to load requests');
      }
    } catch (error) {
      console.error('❌ Error loading certificate requests:', error);
      Alert.alert(
        'Error', 
        `Failed to load certificate requests: ${error.message}`
      );
      setCertificateRequests([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCertificateRequests();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10b981';
      case 'In Progress':
        return '#f59e0b';
      case 'Pending':
        return '#6b7280';
      case 'Rejected':
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return 'checkmark-circle';
      case 'In Progress':
        return 'time';
      case 'Pending':
        return 'hourglass';
      case 'Rejected':
      case 'Cancelled':
        return 'close-circle';
      default:
        return 'document-text';
    }
  };

  const filteredRequests = certificateRequests.filter(request => {
    const matchesFilter = filter === 'All' || request.status === filter;
    const matchesSearch = 
      request.certificateType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  // Function to show reason modal
  const showReasonModal = (reason, type) => {
    console.log(`📱 Showing ${type} reason modal for certificate:`, reason);
    setSelectedReason(reason);
    setSelectedReasonType(type);
    setReasonModalVisible(true);
  };

  // ENHANCED: Function to render reason buttons for certificate requests
  const renderReasonButtons = (request) => {
    const reasonButtons = [];

    // DEBUG: Log reasons for rejected/cancelled certificate requests
    if (request.status === 'Rejected' || request.status === 'Cancelled') {
      console.log(`🔍 [CERTIFICATE REASON CHECK] ${request.certificateType} - Status: ${request.status}`);
      console.log(`   Rejection Reason: ${request.rejectionReason}`);
      console.log(`   Cancellation Reason: ${request.cancellationReason}`);
      console.log(`   Admin Notes: ${request.adminNotes}`);
    }

    // Show rejection reason for ALL rejected certificate requests
    if ((request.status === 'Rejected') && request.rejectionReason) {
      reasonButtons.push(
        <TouchableOpacity 
          key="rejection"
          style={styles.reasonButton}
          onPress={() => showReasonModal(request.rejectionReason, 'rejected')}
        >
          <Ionicons name="warning-outline" size={14} color="#ef4444" />
          <Text style={styles.reasonButtonText}>View Rejection Reason</Text>
        </TouchableOpacity>
      );
    }

    // Show cancellation reason for ALL cancelled certificate requests
    if ((request.status === 'Cancelled') && request.cancellationReason) {
      reasonButtons.push(
        <TouchableOpacity 
          key="cancellation"
          style={styles.reasonButton}
          onPress={() => showReasonModal(request.cancellationReason, 'cancelled')}
        >
          <Ionicons name="close-circle-outline" size={14} color="#ef4444" />
          <Text style={styles.reasonButtonText}>View Cancellation Reason</Text>
        </TouchableOpacity>
      );
    }

    // Show admin notes if available for ANY certificate request
    if (request.adminNotes) {
      reasonButtons.push(
        <View key="adminNotes" style={styles.adminNotesContainer}>
          <Ionicons name="document-text-outline" size={14} color="#3b82f6" />
          <Text style={styles.adminNotesText}>Admin Notes: {request.adminNotes}</Text>
        </View>
      );
    }

    // If status is rejected/cancelled but no specific reason found, show a generic message
    if ((request.status === 'Rejected' || request.status === 'Cancelled') && 
        !request.rejectionReason && !request.cancellationReason && !request.adminNotes) {
      reasonButtons.push(
        <View key="noReason" style={styles.noReasonContainer}>
          <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
          <Text style={styles.noReasonText}>
            No specific reason provided for {request.status} status.
          </Text>
        </View>
      );
    }

    return reasonButtons;
  };

  const handleDownload = async (request) => {
    if (request.status === 'Completed') {
      Alert.alert(
        'Download Certificate',
        `Would you like to download ${request.certificateType}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => {
              // Simulate download - you can implement actual download logic here
              Alert.alert('Success', 'Certificate download started!');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Not Available', 
        `Certificate is not yet available for download. Current status: ${request.status}`
      );
    }
  };

  const handleContact = (request) => {
    Alert.alert(
      'Contact Information',
      `Name: ${request.fullName}\nContact: ${request.contactNumber || 'Not provided'}\nAddress: ${request.address || 'Not provided'}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteRequest = async (requestId) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this certificate request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/certificate-requests/${requestId}`, {
                method: 'DELETE'
              });
              
              const result = await response.json();
              
              if (result.success) {
                Alert.alert('Success', 'Certificate request deleted successfully');
                loadCertificateRequests(); // Refresh the list
              } else {
                throw new Error(result.message);
              }
            } catch (error) {
              console.error('Error deleting certificate request:', error);
              Alert.alert('Error', 'Failed to delete certificate request');
            }
          }
        }
      ]
    );
  };

  const RequestCard = ({ request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => handleRequestPress(request)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.requestType}>{request.certificateType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Ionicons 
              name={getStatusIcon(request.status)} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>
        <Text style={styles.certificateNumber}>{request.certificateNumber}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText} numberOfLines={1}>{request.fullName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>Requested: {request.requestDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="copy-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>Copies: {request.requestedCopies}</Text>
        </View>
        
        {/* CRITICAL FIX: Show rejection/cancellation reasons for certificate requests */}
        {renderReasonButtons(request)}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.purposeText} numberOfLines={1}>{request.purpose}</Text>
        </View>
        <View style={styles.footerRight}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContact(request)}
          >
            <Ionicons name="call-outline" size={16} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDownload(request)}
          >
            <Feather name="download" size={16} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDetailModalVisible}
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedRequest && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Certificate Details</Text>
                <TouchableOpacity 
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Certificate Type</Text>
                  <Text style={styles.detailValue}>{selectedRequest.certificateType}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Certificate Number</Text>
                  <Text style={styles.detailValue}>{selectedRequest.certificateNumber}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{selectedRequest.fullName}</Text>
                </View>

                {selectedRequest.dateOfSacrament && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Date of Sacrament</Text>
                    <Text style={styles.detailValue}>{selectedRequest.dateOfSacrament}</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Purpose</Text>
                  <Text style={styles.detailValue}>{selectedRequest.purpose}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Requested Copies</Text>
                  <Text style={styles.detailValue}>{selectedRequest.requestedCopies}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Request Date</Text>
                  <Text style={styles.detailValue}>{selectedRequest.requestDate}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Scheduled Date</Text>
                  <Text style={styles.detailValue}>{selectedRequest.scheduledDate}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                    <Ionicons name={getStatusIcon(selectedRequest.status)} size={12} color="#fff" />
                    <Text style={styles.statusText}>{selectedRequest.status}</Text>
                  </View>
                </View>

                {/* CRITICAL: Show reasons in detail modal */}
                {(selectedRequest.status === 'Rejected' || selectedRequest.status === 'Cancelled') && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>
                      {selectedRequest.status === 'Rejected' ? 'Rejection Reason' : 'Cancellation Reason'}
                    </Text>
                    <Text style={styles.reasonValue}>
                      {selectedRequest.rejectionReason || selectedRequest.cancellationReason || 'No reason provided'}
                    </Text>
                  </View>
                )}

                {selectedRequest.adminNotes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Admin Notes</Text>
                    <Text style={styles.reasonValue}>{selectedRequest.adminNotes}</Text>
                  </View>
                )}

                {(selectedRequest.contactNumber || selectedRequest.address) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Contact Information</Text>
                    {selectedRequest.contactNumber && (
                      <Text style={styles.contactText}>{selectedRequest.contactNumber}</Text>
                    )}
                    {selectedRequest.address && (
                      <Text style={styles.contactText}>{selectedRequest.address}</Text>
                    )}
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Submitted By</Text>
                  <Text style={styles.detailValue}>{selectedRequest.submittedByEmail || userEmail}</Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.secondaryButton]}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={styles.secondaryButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    setDetailModalVisible(false);
                    handleDownload(selectedRequest);
                  }}
                >
                  <Feather name="download" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Certificate Requests</Text>
            <Text style={styles.headerSubtitle}>
              {userEmail ? `Requests for: ${userEmail}` : 'Loading...'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search certificates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{certificateRequests.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {certificateRequests.filter(req => req.status === 'Completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {certificateRequests.filter(req => req.status === 'In Progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {certificateRequests.filter(req => req.status === 'Pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {filter !== 'All' && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterText}>Showing: {filter}</Text>
            <TouchableOpacity onPress={() => setFilter('All')}>
              <Ionicons name="close" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.requestsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
              tintColor={PRIMARY_COLOR}
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              <Text style={styles.loadingText}>Loading certificate requests...</Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No certificates found' : 'No certificate requests'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Your certificate requests will appear here'
                }
              </Text>
              <TouchableOpacity 
                style={styles.requestNowButton}
                onPress={() => navigation.navigate('RequestCertificate', { userEmail })}
              >
                <Text style={styles.requestNowText}>Request a Certificate Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))
          )}
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptions}>
              {['All', 'Pending', 'In Progress', 'Completed', 'Rejected', 'Cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filter === status && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    setFilter(status);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filter === status && styles.filterOptionTextActive
                  ]}>
                    {status}
                  </Text>
                  {filter === status && (
                    <Ionicons name="checkmark" size={18} color={PRIMARY_COLOR} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <DetailModal />
      
      {/* Reason Modal */}
      <ReasonModal
        visible={reasonModalVisible}
        onClose={() => setReasonModalVisible(false)}
        reason={selectedReason}
        type={selectedReasonType}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: PRIMARY_COLOR,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    fontWeight: '500',
  },
  filterButton: {
    padding: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    padding: 0,
  },
  content: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 15,
  },
  activeFilterText: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginRight: 6,
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  certificateNumber: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  // REASON BUTTON STYLES
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignSelf: 'flex-start',
  },
  reasonButtonText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  adminNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  adminNotesText: {
    color: '#1e40af',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
    flex: 1,
    lineHeight: 12,
  },
  noReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  noReasonText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerLeft: {
    flex: 1,
    marginRight: 10,
  },
  purposeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  footerRight: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  requestNowButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  requestNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    maxHeight: '80%',
  },
  reasonModalContent: {
    width: '90%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    maxHeight: '60%',
  },
  filterModalContent: {
    width: '80%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    padding: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  reasonValue: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
    fontStyle: 'italic',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  filterOptions: {
    marginTop: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#ecfdf5',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#6b7280',
  },
  filterOptionTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  reasonScroll: {
    maxHeight: 200,
    marginBottom: 20,
    paddingHorizontal: 20,
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
    margin: 20,
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ViewCertificateScreen;
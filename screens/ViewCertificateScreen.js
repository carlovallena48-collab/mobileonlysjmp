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

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#047857';
const SECONDARY_COLOR = '#34d399';
const BACKGROUND_COLOR = '#f0fdfa';
const CARD_BACKGROUND = '#ffffff';

const API_URL = "http://10.69.226.17:5000/api";

const ViewCertificateScreen = ({ navigation, route }) => {
  const userEmail = route.params?.userEmail || "guest@example.com";
  
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCertificateRequests();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadCertificateRequests();
    });

    return unsubscribe;
  }, [navigation, userEmail]);

  const loadCertificateRequests = async () => {
    try {
      console.log('Loading certificate requests for user:', userEmail);
      
      // Load user-specific requests
      const response = await fetch(`${API_URL}/certificate-requests/user/${userEmail}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('Loaded certificate requests:', result);
      
      if (result.success) {
        setCertificateRequests(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load requests');
      }
    } catch (error) {
      console.error('Error loading certificate requests:', error);
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
            <Text style={styles.headerSubtitle}>Track your certificate applications</Text>
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
              {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
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
});

export default ViewCertificateScreen;
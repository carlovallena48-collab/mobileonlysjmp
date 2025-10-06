import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Image, // Added Image import for the header
} from 'react-native';
import { Feather } from '@expo/vector-icons';
// import AppHeader from '../components/AppHeader'; // Removed AppHeader import
import { useNavigation } from '@react-navigation/native';

const Colors = {
  churchGreenPrimary: '#4CAF50',
  churchGreenLightBg: '#E8F5E9',
  churchGreenDarkText: '#1B5E20',
  churchGrayText: '#757575',
  white: '#FFFFFF', // Renamed from pureWhite for consistency with original code
  inputBg: '#F5F5F5',
  inputBorder: '#D0D0D0',
  shadowColor: '#000',
  modalBg: 'rgba(0,0,0,0.6)',
  cancelButton: '#E0E0E0',
  cancelButtonText: '#333',
  lightGray: '#F0F0F0',
  darkRedHeader: '#8B0000',
  // Header colors (aligned with other screens)
  headerBg: '#FFFFFF', // Header background should be white
  headerText: '#000000', // Header text and icon should be black
};

export default function MyRequestsScreen({
  pendingRequests = [],
  approvedRequests = [],
  onUpdateRequest,
}) {
  const navigation = useNavigation();
  const [tab, setTab] = useState('pending');
  const [editData, setEditData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const openEdit = (r) => setEditData({ ...r });

  const saveEdit = async () => {
    setIsUpdating(true);
    if (!editData.confirmandName?.trim() && !editData.childName?.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      setIsUpdating(false);
      return;
    }
    try {
      await onUpdateRequest(editData);
      setEditData(null);
      Alert.alert('Update Successful', 'Your request has been updated.');
    } catch (error) {
      console.error("Error updating request:", error);
      Alert.alert('Update Failed', 'An error occurred while updating your request.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try {
      const dateObj = typeof d === 'string' ? new Date(d + 'T00:00:00') : new Date(d);
      return dateObj.toLocaleDateString('en-US');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (t) => {
    if (!t) return 'N/A';
    if (typeof t === 'string' && t.match(/\d{1,2}:\d{2} (AM|PM)/i)) return t;
    try {
      const timeObj = typeof t === 'string' ? new Date(`2000/01/01 ${t}`) : new Date(t);
      return timeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid Time';
    }
  };

  const renderRequestCard = (req) => (
    <TouchableOpacity
      key={req.id}
      style={[styles.requestCard, { backgroundColor: Colors.white, borderColor: Colors.inputBorder }]}
      onPress={() => openEdit(req)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Feather name="bookmark" size={22} color={Colors.churchGreenPrimary} style={styles.cardIcon} />
        <Text style={[styles.cardTitle, { color: Colors.churchGreenDarkText }]}>{req.sacrament} Request</Text>
        <Text style={[styles.cardDateText, { color: Colors.churchGrayText }]}>{formatDate(req.date)}</Text>
      </View>

      <Text style={[styles.cardTimeText, { color: Colors.churchGrayText }]}>
        <Feather name="clock" size={14} color={Colors.churchGrayText} /> {formatTime(req.time)}
      </Text>

      <View style={styles.cardBody}>
        {req.sacrament === 'Kumpil' && (
          <>
            <View style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>Confirmand Details</Text>
              <DetailRow icon="user" label="Name" value={req.confirmandName} boldValue />
              <DetailRow icon="phone" label="Contact" value={req.contactNo} />
              <DetailRow icon="map-pin" label="Birth Place" value={req.birthPlace} />
              <DetailRow icon="hash" label="Age" value={req.age} />
              <DetailRow icon="calendar" label="Baptism Date" value={formatDate(req.baptismDate)} />
              <DetailRow icon="church" label="Baptism Church" value={req.baptismChurch} />
            </View>
            <View style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>Family</Text>
              <DetailRow icon="users" label="Parents" value={`${req.fatherName || 'N/A'}, ${req.motherName || 'N/A'}`} />
              <DetailRow icon="home" label="Address" value={req.currentAddress} />
            </View>
            <View style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>Godparents</Text>
              <DetailRow icon="user-plus" label="Godfather" value={req.godfatherName} />
              <DetailRow icon="user-plus" label="Godmother" value={req.godmotherName} />
            </View>
          </>
        )}

        {req.sacrament === 'Binyag' && (
          <>
            <View style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>Baptism Details</Text>
              <DetailRow icon="user" label="Child's Name" value={req.childName} boldValue />
              <DetailRow icon="calendar" label="Date of Birth" value={formatDate(req.dateOfBirth)} />
              <DetailRow icon="map-pin" label="Birth Place" value={req.birthPlace} />
              <DetailRow icon="church" label="Church" value={req.baptismChurch} />
            </View>
            <View style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>Parents</Text>
              <DetailRow icon="users" label="Father" value={req.fatherName} />
              <DetailRow icon="users" label="Mother" value={req.motherName} />
              <DetailRow icon="home" label="Address" value={req.currentAddress} />
            </View>
            <View style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>Godparents</Text>
              <DetailRow icon="user-plus" label="Godfather" value={req.godfatherName} />
              <DetailRow icon="user-plus" label="Godmother" value={req.godmotherName} />
            </View>
          </>
        )}
      </View>

      <Text style={styles.tapToEditText}>
        Tap to edit <Feather name="edit-3" size={10} color={Colors.churchGrayText} />
      </Text>
    </TouchableOpacity>
  );

  const DetailRow = ({ icon, label, value, boldValue }) => (
    <View style={styles.detailRow}>
      <Feather name={icon} size={15} color={Colors.churchGrayText} style={styles.detailIcon} />
      <Text style={styles.cardText}>
        <Text style={styles.detailLabel}>{label}: </Text>
        <Text style={boldValue ? styles.detailValueBold : styles.detailValue}>{value || 'N/A'}</Text>
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.churchGreenLightBg }]}>
      {/* --- Detailed Header (Copied from KumpilFormScreen/MassScheduleScreen) --- */}
      <View style={[styles.header, { backgroundColor: Colors.headerBg }]}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.headerText} />
        </TouchableOpacity>

        {/* Header Content: Left Logo, Text Container, Right Logo */}
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/LOGO.png')} // IMPORTANT: Replace with your actual path for the left logo
            style={styles.headerSmallLogo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerSmallText, { color: Colors.headerText }]}>Diocese of Antipolo</Text>
            <Text style={[styles.headerParishName, { color: Colors.headerText }]}>San Jose Manggagawa Parish</Text>
            <Text style={[styles.headerAddress, { color: Colors.churchGrayText }]}>
              E. Rodriguez Highway, Cor. E. Manuel St.,{'\n'}Brgy. San Jose, Rodriguez, Rizal
            </Text>
            <Text style={[styles.headerContact, { color: Colors.churchGrayText }]}>Cellphone#: 0967-431-6482</Text>
          </View>
          <Image
            source={require('../assets/Diocese.png')} // This is the general Diocese logo
            style={styles.headerSmallLogo}
          />
        </View>
        <Text style={[styles.headerMemorandumTitle, { color: Colors.headerText }]}>MY REQUESTS</Text>
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: Colors.lightGray }]}>
        {['pending', 'approved'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabButton, tab === t ? styles.activeTabButton : styles.inactiveTabButton]}
          >
            <Text style={[styles.tabText, tab === t ? styles.activeTabText : styles.inactiveTabText]}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {tab === 'pending'
          ? pendingRequests.length > 0
            ? pendingRequests.map(renderRequestCard)
            : <Text style={styles.emptyText}>No pending requests found.</Text>
          : approvedRequests.length > 0
            ? approvedRequests.map(renderRequestCard)
            : <Text style={styles.emptyText}>No approved requests yet.</Text>}
      </ScrollView>

      {!!editData && (
        <Modal transparent animationType="fade">
          <View style={[styles.modalOverlay, { backgroundColor: Colors.modalBg }]}>
            <View style={[styles.modalContainer, { backgroundColor: Colors.white }]}>
              <Text style={[styles.modalTitle, { color: Colors.churchGreenDarkText }]}>Edit Request</Text>

              <ScrollView style={styles.modalScrollContent}>
                {Object.entries(editData).map(([k, v]) => (
                  <View
                    key={k}
                    style={[styles.modalInputContainer, {
                      backgroundColor: Colors.inputBg,
                      borderColor: Colors.inputBorder,
                    }]}
                  >
                    <Feather name="edit" size={20} color={Colors.churchGrayText} style={styles.modalInputIcon} />
                    <TextInput
                      style={styles.modalTextInput}
                      value={v?.toString()}
                      onChangeText={(val) => setEditData((prev) => ({ ...prev, [k]: val }))}
                      placeholder={k}
                      placeholderTextColor={Colors.churchGrayText}
                    />
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setEditData(null)}
                  style={[styles.modalButton, { backgroundColor: Colors.cancelButton }]}
                  disabled={isUpdating}
                >
                  <Text style={[styles.modalButtonText, { color: Colors.cancelButtonText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveEdit}
                  style={[styles.modalButton, { backgroundColor: Colors.churchGreenPrimary }]}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: Colors.white }]}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // --- Detailed Header styles (Copied from KumpilFormScreen for consistency) ---
  header: {
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    alignItems: 'center', // Center content horizontally
    backgroundColor: Colors.headerBg, // Apply header background color
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 40 : 15,
    zIndex: 1, // Ensure it's above other content
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', // Take full width
    marginBottom: 10,
  },
  headerSmallLogo: {
    width: 60, // Size for the logos
    height: 60,
    resizeMode: 'contain',
  },
  headerTextContainer: {
    flex: 1, // Allow text to take available space
    alignItems: 'center', // Center text horizontally
    marginHorizontal: 10, // Space between logos and text
  },
  headerSmallText: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  headerParishName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  headerAddress: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
  },
  headerContact: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  headerMemorandumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.churchGreenPrimary, // Highlight title
    paddingBottom: 5,
  },
  // --- End Detailed Header styles ---

  tabsContainer: { flexDirection: 'row', margin: 15, borderRadius: 12 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTabButton: { backgroundColor: Colors.churchGreenPrimary },
  inactiveTabButton: { backgroundColor: 'transparent' },
  tabText: { fontSize: 16, fontWeight: '700' },
  activeTabText: { color: Colors.white },
  inactiveTabText: { color: Colors.churchGrayText },
  listContent: { padding: 15 },
  requestCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: Colors.shadowColor, // Added shadow properties
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { marginRight: 10 },
  cardTitle: { fontSize: 19, fontWeight: 'bold', flex: 1 },
  cardDateText: { fontSize: 14, fontWeight: '600' },
  cardTimeText: { fontSize: 14, fontWeight: '500', marginLeft: 32, marginBottom: 10 },
  cardBody: { marginTop: 5 },
  detailGroup: { marginBottom: 10 },
  detailGroupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailIcon: { marginRight: 10, width: 20 },
  cardText: { flex: 1, fontSize: 14 },
  detailLabel: { fontWeight: '600' },
  detailValue: { fontWeight: '400' },
  detailValueBold: { fontWeight: '700' },
  tapToEditText: { fontSize: 12, marginTop: 15, textAlign: 'right', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 80, fontSize: 18, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 20,
    padding: 25,
    shadowColor: Colors.shadowColor, // Added shadow properties
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  modalScrollContent: { maxHeight: Platform.OS === 'ios' ? 300 : 250 },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 55,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    shadowColor: Colors.shadowColor, // Added shadow properties
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  modalInputIcon: { marginRight: 10 },
  modalTextInput: { flex: 1, height: '100%', fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  modalButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 130,
    shadowColor: Colors.shadowColor, // Added shadow properties
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: { fontSize: 17, fontWeight: 'bold' },
});

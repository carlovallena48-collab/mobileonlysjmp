// screens/KumpisalFormScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const KumpisalFormScreen = ({ navigation }) => {
  const handleCallChurch = () => {
    Linking.openURL('tel:09631626316');
  };

  const handleOpenMap = () => {
    const address = "St. Joseph Mary Parish, Your City, Philippines";
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Icon name="healing" size={50} color="#2E7D32" />
        <Text style={styles.title}>Sakramento ng Kumpisal</Text>
        <Text style={styles.subtitle}>Reconciliation / Confession</Text>
      </View>

      {/* Main Content Card */}
      <View style={styles.card}>
        {/* Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="schedule" size={24} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Oras ng Kumpisal</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Icon name="access-time" size={20} color="#666" />
            <View style={styles.scheduleText}>
              <Text style={styles.scheduleDay}>Linggo</Text>
              <Text style={styles.scheduleTime}>30 minuto bago at pagkatapos ng bawat Misa</Text>
            </View>
          </View>
          <View style={styles.scheduleItem}>
            <Icon name="access-time" size={20} color="#666" />
            <View style={styles.scheduleText}>
              <Text style={styles.scheduleDay}>Biyernes</Text>
              <Text style={styles.scheduleTime}>5:00 PM - 6:00 PM</Text>
            </View>
          </View>
          <View style={styles.scheduleItem}>
            <Icon name="access-time" size={20} color="#666" />
            <View style={styles.scheduleText}>
              <Text style={styles.scheduleDay}>Sabado</Text>
              <Text style={styles.scheduleTime}>3:00 PM - 4:30 PM</Text>
            </View>
          </View>
        </View>

        {/* Reminder Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info" size={24} color="#D32F2F" />
            <Text style={styles.sectionTitle}>Mga Paalala</Text>
          </View>
          <View style={styles.reminderItem}>
            <Icon name="check-circle" size={18} color="#2E7D32" />
            <Text style={styles.reminderText}>
              Ang kumpisal ay available 30 minuto bago at pagkatapos ng bawat Misa
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Icon name="check-circle" size={18} color="#2E7D32" />
            <Text style={styles.reminderText}>
              Maghanda sa pamamagitan ng pagsusuri ng konsensya
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Icon name="check-circle" size={18} color="#2E7D32" />
            <Text style={styles.reminderText}>
              Magsuot ng angkop na damit kapag magkukumpisal
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Icon name="check-circle" size={18} color="#2E7D32" />
            <Text style={styles.reminderText}>
              Magdasal ng Act of Contrition bago kumpisal
            </Text>
          </View>
        </View>

        {/* Guide Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="menu-book" size={24} color="#1976D2" />
            <Text style={styles.sectionTitle}>Gabay sa Kumpisal</Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Pagsusuri ng Konsensya</Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Pagsisisi sa mga Kasalanan</Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Pagkumpisal sa Pari</Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Pagtanggap ng Absolution</Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>5</Text>
            <Text style={styles.stepText}>Pagganap ng Penitensya</Text>
          </View>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Para sa Karagdagang Impormasyon</Text>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleCallChurch}>
          <Icon name="phone" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>Tawagan ang Parish Office</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton} onPress={handleOpenMap}>
          <Icon name="location-on" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>Pumunta sa Simbahan</Text>
        </TouchableOpacity>
      </View>

      {/* Bible Verse */}
      <View style={styles.bibleVerseCard}>
        <Icon name="format-quote" size={30} color="#7CB342" />
        <Text style={styles.bibleVerse}>
          "Ipagdiinan ninyo ito sa mga tao: Magbalik-loob sila sa Diyos at talikdan ang kanilang mga kasalanan, upang magpatawad sa inyo ang Diyos at pagpalain kayo ng masagana."
        </Text>
        <Text style={styles.bibleReference}>- Gawa 3:19</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={20} color="#2E7D32" />
        <Text style={styles.backButtonText}>Bumalik</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5E8',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  scheduleText: {
    marginLeft: 10,
    flex: 1,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    padding: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bibleVerseCard: {
    backgroundColor: '#E8F5E8',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  bibleVerse: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 10,
  },
  bibleReference: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default KumpisalFormScreen;
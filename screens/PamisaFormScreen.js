import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated
} from 'react-native';

const { width } = Dimensions.get('window');

const PamisaFormScreen = () => {
  const [selectedIntention, setSelectedIntention] = useState('');
  const [names, setNames] = useState(['', '', '']);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [massSponsor, setMassSponsor] = useState('');
  const [donation, setDonation] = useState('');

  const intentions = [
    { id: 1, name: 'Thanksgiving', icon: '🙏', color: '#4CAF50' },
    { id: 2, name: 'Birthday', icon: '🎂', color: '#FF9800' },
    { id: 3, name: 'Wedding Anniversary', icon: '💍', color: '#E91E63' },
    { id: 4, name: 'Special Intention', icon: '⭐', color: '#9C27B0' },
    { id: 5, name: 'Speedy Recovery', icon: '🏥', color: '#2196F3' },
    { id: 6, name: 'Safe Travel', icon: '✈️', color: '#009688' },
    { id: 7, name: 'Soul', icon: '😇', color: '#795548' }
  ];

  const handleNameChange = (text, index) => {
    const newNames = [...names];
    newNames[index] = text;
    setNames(newNames);
  };

  const handleSubmit = () => {
    if (!selectedIntention) {
      Alert.alert('Missing Information', 'Please select an intention for the Mass');
      return;
    }

    if (names.every(name => name.trim() === '')) {
      Alert.alert('Missing Information', 'Please enter at least one name');
      return;
    }

    if (!date || !time) {
      Alert.alert('Missing Information', 'Please select date and time');
      return;
    }

    const formData = {
      intention: selectedIntention,
      names: names.filter(name => name.trim() !== ''),
      date,
      time,
      massSponsor,
      donation
    };

    console.log('Form submitted:', formData);
    
    Alert.alert(
      'Success!',
      'Your Pamisa request has been submitted successfully.\n\nWe will contact you for confirmation.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedIntention('');
            setNames(['', '', '']);
            setDate('');
            setTime('');
            setMassSponsor('');
            setDonation('');
          }
        }
      ]
    );
  };

  const renderIntentionOption = (intention) => (
    <TouchableOpacity
      key={intention.id}
      style={[
        styles.optionButton,
        selectedIntention === intention.name && [
          styles.selectedOption,
          { borderColor: intention.color }
        ]
      ]}
      onPress={() => setSelectedIntention(intention.name)}
    >
      <Text style={styles.optionIcon}>{intention.icon}</Text>
      <Text style={[
        styles.optionText,
        selectedIntention === intention.name && [
          styles.selectedOptionText,
          { color: intention.color }
        ]
      ]}>
        {intention.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Background */}
        <View style={styles.header}>
          <View style={styles.churchIcon}>
            <Text style={styles.churchIconText}>⛪</Text>
          </View>
          <Text style={styles.dioceseText}>Diocese of Antipolo</Text>
          <Text style={styles.parishText}>SAN JOSE MANGGAGAWA PARISH</Text>
          <Text style={styles.addressText}>
            E. Rodriguez Highway, San Jose, Rodriguez, Rizal
          </Text>
        </View>

        {/* Main Form Card */}
        <View style={styles.formCard}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Pamisa Request</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Intention Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mass Intention</Text>
            <Text style={styles.sectionSubtitle}>Select the purpose of this Mass</Text>
            
            <View style={styles.intentionsGrid}>
              {intentions.map((intention, index) => (
                <View key={intention.id} style={styles.intentionItem}>
                  {renderIntentionOption(intention)}
                </View>
              ))}
            </View>
          </View>

          {/* Names Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Names for Intention</Text>
              <Text style={styles.counterText}>{names.filter(name => name.trim() !== '').length}/3</Text>
            </View>
            
            {names.map((name, index) => (
              <View key={index} style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    name.trim() !== '' && styles.filledInput
                  ]}
                  placeholder={`Name of person ${index + 1}`}
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => handleNameChange(text, index)}
                />
                {name.trim() !== '' && (
                  <View style={styles.inputCheckmark}>
                    <Text>✓</Text>
                  </View>
                )}
              </View>
            ))}
            
            {selectedIntention === 'Soul' && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>💡 Please enter first name only for soul intentions</Text>
              </View>
            )}
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Date</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#999"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <View style={styles.halfInputContainer}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Time</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM AM/PM"
                  placeholderTextColor="#999"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>
          </View>

          {/* Mass Sponsor */}
          <View style={styles.section}>
            <View style={styles.inputLabel}>
              <Text style={styles.labelText}>Mass Sponsor (Optional)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter sponsor's name"
              placeholderTextColor="#999"
              value={massSponsor}
              onChangeText={setMassSponsor}
            />
          </View>

          {/* Donation */}
          <View style={styles.section}>
            <View style={styles.inputLabel}>
              <Text style={styles.labelText}>Donation (Optional)</Text>
            </View>
            <View style={styles.donationContainer}>
              <View style={styles.pesoContainer}>
                <Text style={styles.pesoSign}>₱</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.donationInput]}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={donation}
                onChangeText={setDonation}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedIntention || names.every(name => name.trim() === '') || !date || !time) && 
              styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!selectedIntention || names.every(name => name.trim() === '') || !date || !time}
          >
            <Text style={styles.submitButtonText}>Submit Pamisa Request</Text>
            <Text style={styles.submitButtonSubtext}>We'll contact you for confirmation</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>San Jose Manggagawa Parish • Serving with Faith</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  churchIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  churchIconText: {
    fontSize: 30,
  },
  dioceseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 5,
  },
  parishText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginTop: -40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  counterText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  intentionItem: {
    width: '48%',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filledInput: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  inputCheckmark: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  donationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pesoContainer: {
    backgroundColor: '#667eea',
    padding: 16,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: -2,
  },
  pesoSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  donationInput: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    flex: 1,
  },
  noteBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submitButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default PamisaFormScreen;
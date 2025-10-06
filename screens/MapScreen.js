import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';

const Colors = {
  churchGreenPrimary: '#4CAF50',
  churchGreenLightBg: '#E8F5E9',
  churchGreenDarkText: '#1B5E20',
  churchGrayText: '#757575',
  white: '#FFFFFF',
  inputBorder: '#E0E0E0',
  shadowColor: '#000',
  headerBg: '#FFFFFF',
  headerText: '#000000',
};

export default function MapScreen({ navigation }) {
  const churchLocation = {
    latitude: 14.7313932,     // from your map link
    longitude: 121.1354846,   // from your map link
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${churchLocation.latitude},${churchLocation.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.churchGreenLightBg }]}>
      <View style={[styles.header, { backgroundColor: Colors.headerBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.headerText }]}>CHURCH LOCATION</Text>
      </View>

      <View style={[styles.mapCard, { backgroundColor: Colors.white, shadowColor: Colors.shadowColor }]}>
        <Text style={[styles.sectionTitle, { color: Colors.churchGreenDarkText }]}>
          San Jose Manggagawa Parish
        </Text>
        <Text style={[styles.addressText, { color: Colors.churchGrayText }]}>
          Montalban, Rizal, Philippines
        </Text>

        <MapView style={styles.map} initialRegion={churchLocation}>
          <Marker
            coordinate={{ latitude: churchLocation.latitude, longitude: churchLocation.longitude }}
            title="San Jose Manggagawa Parish"
            description="Parish Location"
            pinColor={Colors.churchGreenPrimary}
          />
        </MapView>

        <TouchableOpacity
          style={[styles.directionsButton, { backgroundColor: Colors.churchGreenPrimary }]}
          onPress={handleGetDirections}
          activeOpacity={0.8}
        >
          <Feather name="map" size={24} color={Colors.white} style={styles.directionsIcon} />
          <Text style={[styles.directionsButtonText, { color: Colors.white }]}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 4,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 40 : 15,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.churchGrayText,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  directionsIcon: {
    marginRight: 10,
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

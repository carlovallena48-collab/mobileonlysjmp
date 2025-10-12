import React from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    Platform, 
    Linking,
    Alert,
    Dimensions,
    ScrollView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const Colors = {
  primary: '#1a365d',
  secondary: '#d69e2e',
  background: '#f7fafc',
  cardBackground: '#ffffff',
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  accentGreen: '#48bb78',
};

export default function MapScreen({ navigation }) {
  // Exact coordinates from your Google Maps embed
  const churchLocation = {
    latitude: 14.7313932,
    longitude: 121.1354846,
  };

  // Google Maps Embed HTML
  const mapEmbedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.6671946268625!2d121.13290967457532!3d14.731398373862058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bbdd79b996d7%3A0x9a4fc72d4712bf77!2sSAN%20JOSE%20MANGGAGAWA%20PARISH%20MONTALBAN!5e0!3m2!1sen!2sph!4v1759937880446!5m2!1sen!2sph" 
        width="100%" 
        height="100%" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </body>
    </html>
  `;

  const handleGetDirections = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${churchLocation.latitude},${churchLocation.longitude}`,
      android: `google.navigation:q=${churchLocation.latitude},${churchLocation.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${churchLocation.latitude},${churchLocation.longitude}`
    });

    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps website
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${churchLocation.latitude},${churchLocation.longitude}`;
      Linking.openURL(webUrl);
    });
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=San+Jose+Manggagawa+Parish+Montalban`;
    Linking.openURL(url);
  };

  const openWaze = () => {
    const url = `https://waze.com/ul?ll=${churchLocation.latitude},${churchLocation.longitude}&navigate=yes`;
    Linking.openURL(url);
  };

  const showLocationOptions = () => {
    Alert.alert(
      "Get Directions",
      "Choose your preferred navigation app",
      [
        {
          text: "Google Maps",
          onPress: openGoogleMaps
        },
        {
          text: "Waze",
          onPress: openWaze
        },
        {
          text: "Apple Maps",
          onPress: handleGetDirections
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Church Location</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Interactive Map View */}
          <View style={styles.mapCard}>
            <Text style={styles.sectionTitle}>
              San Jose Manggagawa Parish
            </Text>
            <Text style={styles.addressText}>
              Montalban, Rizal, Philippines
            </Text>

            {/* Embedded Google Maps */}
            <View style={styles.mapContainer}>
              <WebView
                source={{ html: mapEmbedHtml }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
              <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayText}>Interactive Map - Pinch to zoom</Text>
              </View>
            </View>

            {/* Location Details */}
            <View style={styles.locationInfo}>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={18} color={Colors.accentGreen} />
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>San Jose Manggagawa Parish, Montalban</Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="crosshair" size={18} color={Colors.accentGreen} />
                <Text style={styles.infoLabel}>Coordinates:</Text>
                <Text style={styles.infoValue}>
                  {churchLocation.latitude.toFixed(6)}° N, {churchLocation.longitude.toFixed(6)}° E
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={showLocationOptions}
              activeOpacity={0.8}
            >
              <Feather name="navigation" size={20} color={Colors.cardBackground} />
              <Text style={styles.primaryButtonText}>Get Directions</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={openGoogleMaps}
                activeOpacity={0.8}
              >
                <Feather name="map" size={18} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={openWaze}
                activeOpacity={0.8}
              >
                <Feather name="compass" size={18} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Waze</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Parish Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Parish Details</Text>
            
            <View style={styles.infoItem}>
              <Feather name="clock" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Open Daily: 6:00 AM - 8:00 PM</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Feather name="phone" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>(02) 123-4567</Text>
            </View>

            <View style={styles.infoItem}>
              <Feather name="info" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Established: May 1, 1978</Text>
            </View>

            <View style={styles.infoItem}>
              <Feather name="users" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Patron Saint: St. Joseph the Worker</Text>
            </View>
          </View>

          {/* Landmarks */}
          <View style={styles.landmarksCard}>
            <Text style={styles.landmarksTitle}>Nearby Landmarks</Text>
            <View style={styles.landmarkItem}>
              <Feather name="flag" size={14} color={Colors.accentGreen} />
              <Text style={styles.landmarkText}>Near Montalban Town Proper</Text>
            </View>
            <View style={styles.landmarkItem}>
              <Feather name="flag" size={14} color={Colors.accentGreen} />
              <Text style={styles.landmarkText}>Close to Rodriguez Municipal Hall</Text>
            </View>
            <View style={styles.landmarkItem}>
              <Feather name="flag" size={14} color={Colors.accentGreen} />
              <Text style={styles.landmarkText}>Accessible via Marcos Highway</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mapCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapOverlayText: {
    color: Colors.cardBackground,
    fontSize: 10,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
    marginRight: 8,
    width: 90,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: Colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginHorizontal: 4,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  landmarksCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  landmarksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  landmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  landmarkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
});
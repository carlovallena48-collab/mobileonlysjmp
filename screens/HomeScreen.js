import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    Dimensions,
    ScrollView,
} from 'react-native';
// Note: Assuming 'react-native-safe-area-context' and '@expo/vector-icons' are installed.
// For the purpose of this file, we assume they are available.
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import church6 from '../assets/church6.png';
import annointing from '../assets/annointing.png';
import baptism from '../assets/baptism.png';
import confession from '../assets/confession.png';
import confirmation from '../assets/confirmation.png';
import eucharist from '../assets/eucharist.png';
import holyorders from '../assets/holyorders.png';
import matrimony from '../assets/matrimony.png';
const { width } = Dimensions.get('window');

// --- NEW PROFESSIONAL GREEN COLOR PALETTE ---
const Colors = {
    // Primary Color: Deep Emerald Green (Dominant Brand Color)
    primary: '#047857', 
    // Secondary Accent: Light Gold/Amber (For alerts, active items)
    secondary: '#FBBF24', 
    // Background: Very light, airy off-white
    background: '#F9FAFB', 
    // Card & Surface Backgrounds: Pure White
    cardBackground: '#FFFFFF', 
    // Text Colors
    textPrimary: '#1F2937', // Dark Gray
    textSecondary: '#6B7280', // Medium Gray
    // Status/Success (Uses Primary Green)
    success: '#047857', 
    // Lightest green accent for subtle backgrounds
    lightGreen: '#ECFDF5', 
};

// Data for the 7 Sacraments (unchanged)
const sacraments = [
    { id: 's1', name: 'Baptism', image: baptism },
    { id: 's2', name: 'Eucharist', image: eucharist },
    { id: 's3', name: 'Reconciliation', image: confession },
    { id: 's4', name: 'Confirmation', image: confirmation },
    { id: 's5', name: 'Matrimony', image: matrimony },
    { id: 's6', name: 'Holy Orders', image: holyorders },
    { id: 's7', name: 'Anointing of the Sick', image: annointing },
];

const massSchedules = [
    { id: 'ms1', day: 'Tuesday - Friday', time: ['6:00 PM'], image: church6 },
    { id: 'ms2', day: 'Saturday', time: ['6:00 AM', '6:00 PM'], image: church6 },
    { id: 'ms3', day: 'Sunday', time: ['6:00 AM', '7:30 AM', '9:00 AM', '5:00 PM', '6:30 PM'], image: church6 },
];

const HomeScreen = ({ navigation }) => {
    
    // Placeholder navigation handlers
    const handleSeeAllPress = () => {
        Alert.alert("Navigation", "Going to 'See All' services.");
    };

    const handleMapPress = () => {
        Alert.alert(
            "Parish Location", 
            "Ito ang magbubukas ng Google Maps o magdadala sa iyo sa dedikadong map screen ng app.",
            [{ text: "OK" }]
        );
    };

    // Card Component for Sacraments
    const ServiceCard = ({ item }) => (
        <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => {
                // Navigation logic (unchanged)
                if (item.name === "Baptism") {
                    navigation.navigate("BaptismForm");
                } else if (item.name === "Confirmation") {
                    navigation.navigate("KumpilForm");
                } else if (item.name === "Matrimony") {
                    navigation.navigate("MarriageForm");
                } else if (item.name === "Anointing of the Sick") {
                    navigation.navigate("SickCallForm");
                } else {
                    Alert.alert("Service", `${item.name} form is not yet available.`);
                }
            }}
        >
            <View style={styles.serviceIconContainer}>
                <Image source={item.image} style={styles.serviceImage} />
            </View>
            <Text style={styles.serviceName}>{item.name}</Text>
        </TouchableOpacity>
    );

    // Card Component for Schedules
    const ScheduleCard = ({ item }) => (
        <TouchableOpacity style={styles.scheduleCard}>
            <View style={styles.scheduleImageContainer}>
                {/* Image Placeholder with an overlay */}
                <Image source={item.image} style={styles.scheduleImage} />
                <View style={styles.scheduleImageOverlay} />
            </View>
            <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleDay}>{item.day}</Text>
                <View style={styles.scheduleTimeList}>
                    {item.time.map((time, index) => (
                        <View key={index} style={styles.scheduleTimeRow}>
                            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.scheduleTimeText}>{time}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.locationContainer}>
                            <Text style={styles.locationText}>Your Parish Location</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                                <Text style={styles.locationDetail}>SAN JOSE MANGGAGAWA PARISH</Text>
                                <Ionicons name="chevron-down-outline" size={16} color={Colors.primary} />
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.notificationButton} 
                            onPress={() => Alert.alert("Notifications", "No new notifications.")}
                        >
                            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.searchInputText}>Search announcements, masses...</Text>
                        <TouchableOpacity style={styles.filterButton}>
                            <Ionicons name="options-outline" size={24} color={Colors.cardBackground} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* UPCOMING EVENTS SECTION */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Events</Text>
                        <TouchableOpacity onPress={() => Alert.alert('Events', 'This will navigate to the Events/Announcements list screen.')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.eventCard}>
                        <Ionicons name="megaphone-outline" size={24} color={Colors.primary} />
                        <View style={{ marginLeft: 15 }}>
                            <Text style={styles.eventTitle}>Lent 2024 Schedule</Text>
                            <Text style={styles.eventSubtitle}>View the complete schedule for Holy Week and activities.</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* PARISH SERVICES (Sacraments) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Parish Services</Text>
                        <TouchableOpacity onPress={handleSeeAllPress}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={sacraments}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => <ServiceCard item={item} />}
                        contentContainerStyle={{ paddingHorizontal: 4 }}
                    />
                </View>

                {/* DAILY MASS SCHEDULES */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Daily Mass Schedules</Text>
                        <TouchableOpacity onPress={handleSeeAllPress}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={massSchedules}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => <ScheduleCard item={item} />}
                        contentContainerStyle={{ paddingHorizontal: 4 }}
                    />
                </View>

                {/* QUICK ACTIONS/CONTACT CARD */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={{ marginTop: 10 }}>
                         {/* Request Certificate */}
                        <TouchableOpacity 
                            style={[styles.quickActionCard, { backgroundColor: Colors.lightGreen }]} 
                            onPress={() => navigation.navigate('RequestCertificate')}
                        >
                            <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                            <View style={{ marginLeft: 15 }}>
                                <Text style={styles.quickActionTitle}>Request Certificate Online</Text>
                                <Text style={styles.quickActionSubtitle}>Baptismal, Confirmation, etc.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.primary} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        
                        {/* Call Office */}
                        <TouchableOpacity 
                            style={[styles.quickActionCard, { backgroundColor: Colors.cardBackground, marginTop: 12 }]} 
                            onPress={() => Alert.alert('Call Office', 'Dialing Parish Office: (02) 123-4567')}
                        >
                            <Ionicons name="call-outline" size={24} color={Colors.textPrimary} />
                            <View style={{ marginLeft: 15 }}>
                                <Text style={styles.quickActionTitle}>Parish Office Number</Text>
                                <Text style={styles.quickActionSubtitle}>(02) 123-4567 | Mon-Sat (9am-5pm)</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* MAP LOCATION CARD (Styled as a button) */}
                <View style={[styles.section, {marginBottom: 30}]}>
                    <TouchableOpacity 
                        style={styles.mapCard} 
                        onPress={handleMapPress}
                    >
                        <Ionicons name="map-outline" size={24} color={Colors.cardBackground} />
                        <Text style={styles.mapText}>Locate San Jose Manggagawa Parish</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.cardBackground} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navItem}>
                    <Ionicons name="home" size={24} color={Colors.primary} />
                    <Text style={styles.navTextActive}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('MyRequests')} style={styles.navItem}>
                    <Ionicons name="calendar-outline" size={24} color={Colors.textSecondary} />
                    <Text style={styles.navText}>Request Sched</Text>
                </TouchableOpacity>

             

                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    scrollViewContent: { paddingBottom: 20 },
    
    // --- HEADER: Clean, Elevated, Focused on Location ---
    header: {
        backgroundColor: Colors.cardBackground,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        // Softer corner radius
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20,
        // Pro-level subtle shadow
        elevation: 6, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    locationText: { 
        fontSize: 13, 
        color: Colors.textSecondary, 
        fontWeight: '500' 
    },
    locationRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    locationDetail: { 
        fontSize: 18, // Slightly smaller, cleaner title font
        fontWeight: '800', 
        marginHorizontal: 4, 
        color: Colors.textPrimary, 
    },
    notificationButton: { 
        padding: 10, 
        borderRadius: 25, 
        backgroundColor: Colors.lightGreen, // Light green accent
    },
    
    // --- SEARCH BAR: Highly Rounded and Clean ---
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 28, 
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderColor: '#E5E7EB',
        borderWidth: 1,
    },
    searchInputText: { 
        flex: 1, 
        marginLeft: 8, 
        color: Colors.textSecondary, 
        fontWeight: '500' 
    },
    filterButton: {
        padding: 8,
        backgroundColor: Colors.primary, // Deep Green
        borderRadius: 20,
        marginLeft: 10,
    },
    
    // --- GENERAL SECTION STYLES ---
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    sectionTitle: { 
        fontSize: 20, // Clean title size
        fontWeight: '700', 
        color: Colors.textPrimary 
    },
    seeAllText: { 
        fontSize: 15, 
        color: Colors.primary, // Primary Green link
        fontWeight: '700' 
    },
    
    // --- EVENT CARD: Green Primary Accent ---
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBackground, 
        padding: 18,
        borderRadius: 16,
        elevation: 5,
        shadowColor: Colors.primary, // Subtle shadow from primary color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        borderLeftWidth: 5,
        borderLeftColor: Colors.primary, // Primary Green accent line
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary, 
    },
    eventSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary, 
        marginTop: 4,
        width: width * 0.7,
    },
    
    // --- SERVICE (SACRAMENT) CARDS: Clean, Elevated Icons ---
    serviceCard: {
        alignItems: 'center',
        marginRight: 15,
        width: 80,
    },
    serviceIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGreen, // Light green background for icon
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    serviceImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        // Optional: add a slight tint to images if they are pure white/B&W for consistency
        tintColor: undefined, 
    },
    serviceName: { 
        marginTop: 8, 
        fontSize: 12, 
        fontWeight: '600', 
        textAlign: 'center',
        color: Colors.textPrimary,
    },
    
    // --- SCHEDULE CARDS: Clearer Structure & Overlay ---
    scheduleCard: {
        width: width * 0.45,
        marginRight: 15,
        borderRadius: 12, 
        backgroundColor: Colors.cardBackground,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    scheduleImageContainer: {
        width: '100%',
        height: 100,
        overflow: 'hidden',
    },
    scheduleImage: { 
        width: '100%', 
        height: '100%', 
        resizeMode: 'cover' 
    },
    scheduleImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Dark overlay for text clarity
    },
    scheduleInfo: { padding: 14 },
    scheduleDay: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        color: Colors.primary, 
        marginBottom: 8,
    },
    scheduleTimeList: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 8,
    },
    scheduleTimeRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 4 
    },
    scheduleTimeText: { 
        marginLeft: 6, 
        fontSize: 13, 
        color: Colors.textSecondary,
        fontWeight: '600'
    },

    // --- QUICK ACTION CARDS: Distinct background colors ---
    quickActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quickActionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    quickActionSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
    },

    // --- MAP CARD: Strong, Primary Green Button Style ---
    mapCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary, 
        padding: 20,
        borderRadius: 15,
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    mapText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.cardBackground, // White text on green
        marginLeft: 10,
    },
    
    // --- BOTTOM NAVIGATION: Elevated and Focused ---
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        backgroundColor: Colors.cardBackground,
        elevation: 15, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    navItem: { alignItems: 'center', width: '20%' },
    navText: { 
        fontSize: 10, 
        marginTop: 4, 
        color: Colors.textSecondary, 
        fontWeight: '600' 
    },
    navTextActive: { 
        fontSize: 10, 
        marginTop: 4, 
        color: Colors.primary, // Active link uses Primary Green
        fontWeight: '800' 
    },
});

export default HomeScreen;

// Header.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './Colors';

const Header = ({ 
    navigation, 
    showNotification = true, 
    unreadCount = 0,
    title = null 
}) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerMain}>
                {/* Left Logo - Parish Logo */}
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/LOGO.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Center Text Content */}
                <View style={styles.headerText}>
                    {title ? (
                        <>
                            <Text style={styles.diocese}>{title.diocese}</Text>
                            <Text style={styles.parishName}>{title.main}</Text>
                            {title.subtitle && (
                                <Text style={styles.location}>{title.subtitle}</Text>
                            )}
                            {title.contact && (
                                <Text style={styles.contact}>{title.contact}</Text>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.diocese}>DIOCESE OF ANTIPOLO</Text>
                            <Text style={styles.parishName}>SAN JOSE MANGGAGAWA PARISH</Text>
                            <Text style={styles.location}>San Jose, Rodriguez, Rizal</Text>
                            <Text style={styles.contact}>Cellphone No.: 0967-431-6482</Text>
                        </>
                    )}
                </View>

                {/* Right Side - Diocese Logo and Notification */}
                <View style={styles.rightContainer}>
                    {/* Diocese Logo */}
                    <View style={styles.dioceseLogoContainer}>
                        <Image 
                            source={require('../assets/Diocese.png')} 
                            style={styles.dioceseLogo}
                            resizeMode="contain"
                        />
                    </View>
                    
                    {/* Notification Button */}
                    {showNotification && (
                        <TouchableOpacity 
                            style={styles.notificationBtn} 
                            onPress={() => navigation.navigate('NotificationScreen')}
                        >
                            <Ionicons name="notifications" size={26} color={Colors.primary} />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.cardBackground,
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 10,
    },
    headerMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    diocese: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    parishName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 4,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        lineHeight: 20,
        textAlign: 'center',
    },
    location: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '500',
        marginBottom: 2,
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    contact: {
        fontSize: 11,
        color: Colors.secondary,
        fontWeight: '600',
        textAlign: 'center',
    },
    rightContainer: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    dioceseLogoContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dioceseLogo: {
        width: '100%',
        height: '100%',
    },
    notificationBtn: {
        padding: 10,
        borderRadius: 16,
        backgroundColor: Colors.lightBlue,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: Colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.cardBackground,
    },
    badgeText: {
        color: Colors.cardBackground,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default Header;
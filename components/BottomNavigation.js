// BottomNavigation.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './Colors';

const BottomNavigation = ({ navigation, activeRoute }) => {
    const navItems = [
        {
            id: '1',
            name: 'Home',
            icon: 'home',
            activeIcon: 'home',
            route: 'Home'
        },
        {
            id: '2',
            name: 'Dashboard',
            icon: 'grid-outline',
            activeIcon: 'grid',
            route: 'Dashboard'
        },
        {
            id: '3',
            name: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            route: 'Profile'
        },
    ];

    const handleNavPress = (route) => {
        if (route !== activeRoute) {
            navigation.navigate(route);
        }
    };

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = activeRoute === item.route;
                return (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.navItem, isActive && styles.navItemActive]}
                        onPress={() => handleNavPress(item.route)}
                    >
                        <View style={[styles.navIcon, isActive && styles.navIconActive]}>
                            <Ionicons
                                name={isActive ? item.activeIcon : item.icon}
                                size={24}
                                color={isActive ? Colors.primary : Colors.textSecondary}
                            />
                        </View>
                        <Text style={[styles.navText, isActive && styles.navTextActive]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: Colors.cardBackground,
        paddingVertical: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    navItemActive: {
        // Active state styling
    },
    navIcon: {
        padding: 8,
        borderRadius: 12,
    },
    navIconActive: {
        backgroundColor: Colors.lightBlue,
    },
    navText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    navTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
});

export default BottomNavigation;
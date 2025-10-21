import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, RefreshControl, Alert,
    Dimensions, Platform, Animated, StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// 🎨 MODERN COLOR PALETTE
const Colors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    textWhite: '#ffffff',
    approved: '#10b981',
    rejected: '#ef4444',
    border: '#e2e8f0',
    shadow: 'rgba(37, 99, 235, 0.1)',
    gradientStart: '#2563eb',
    gradientEnd: '#3b82f6',
};

const NOTIFICATION_STORAGE_KEY = '@notificationHistory';
const API_BASE_URL = "http://192.168.100.199:5000";

export default function NotificationScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const fadeAnim = useState(new Animated.Value(0))[0];
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        loadUserData();
        loadNotifications();
        animateHeader();
    }, []);

    const animateHeader = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const loadUserData = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@userData');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUserEmail(userData.email);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            setRefreshing(true);
            
            const storedNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
            let parsedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
            
            if (userEmail) {
                const approvedRequests = await fetchApprovedRequests();
                const rejectedRequests = await fetchRejectedRequests();
                
                const allNotifications = mergeNotifications(parsedNotifications, [
                    ...approvedRequests,
                    ...rejectedRequests
                ]);
                
                const sortedNotifications = allNotifications.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                
                setNotifications(sortedNotifications);
                await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(sortedNotifications));
            } else {
                setNotifications(parsedNotifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            const storedNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
            if (storedNotifications) {
                setNotifications(JSON.parse(storedNotifications));
            }
        } finally {
            setRefreshing(false);
        }
    };

    const safeFetchSacramentRequests = async (collectionName, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/${collectionName}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`HTTP ${response.status}`);
            }
            
            const requests = await response.json();
            const userRequests = requests.filter(request => 
                request.submittedByEmail === userEmail && 
                request.status === status
            );
            
            return userRequests;
            
        } catch (error) {
            return [];
        }
    };

    const fetchApprovedRequests = async () => {
        try {
            const availableEndpoints = [
                'baptismrequests', 
                'kumpil_requests',
                'marriage_requests',
                'pamisa_requests',
                'blessing_requests',
                'holy_orders_requests',
                'first_communion_requests',
                'funeral_requests',
                'volunteer-applications',
                'certificate-requests'
            ];

            const sacramentRequests = await Promise.all(
                availableEndpoints.map(endpoint => 
                    safeFetchSacramentRequests(endpoint, 'approved')
                )
            );

            const allApprovedRequests = sacramentRequests.flat();
            return convertToNotifications(allApprovedRequests, 'approved');

        } catch (error) {
            return [];
        }
    };

    const fetchRejectedRequests = async () => {
        try {
            const availableEndpoints = [
                'baptismrequests', 
                'kumpil_requests',
                'marriage_requests',
                'pamisa_requests',
                'blessing_requests',
                'holy_orders_requests',
                'first_communion_requests',
                'funeral_requests',
                'volunteer-applications',
                'certificate-requests'
            ];

            const sacramentRequests = await Promise.all(
                availableEndpoints.map(endpoint => 
                    safeFetchSacramentRequests(endpoint, 'rejected')
                )
            );

            const allRejectedRequests = sacramentRequests.flat();
            return convertToNotifications(allRejectedRequests, 'rejected');

        } catch (error) {
            return [];
        }
    };

    const convertToNotifications = (requests, status) => {
        return requests.map(request => {
            const baseNotification = {
                id: request._id || request.requestNumber || `notif-${Date.now()}-${Math.random()}`,
                type: status,
                timestamp: request.lastUpdated || request.createdAt || new Date(),
                read: false,
                data: request
            };

            const getSacramentDisplayName = (sacrament) => {
                const names = {
                    'Baptism': 'Baptism',
                    'Kumpil': 'Confirmation',
                    'Marriage': 'Marriage',
                    'Funeral Service': 'Funeral Service',
                    'Pamisa': 'Mass Intention',
                    'Blessing': 'Blessing',
                    'Holy Orders': 'Holy Orders',
                    'First Communion': 'First Communion',
                    'Volunteer': 'Volunteer',
                    'Certificate': 'Certificate'
                };
                return names[sacrament] || sacrament || 'Request';
            };

            const sacramentName = getSacramentDisplayName(request.sacrament);
            
            if (status === 'approved') {
                return {
                    ...baseNotification,
                    message: `${sacramentName} request has been approved`,
                    sacrament: sacramentName
                };
            } else {
                return {
                    ...baseNotification,
                    message: `${sacramentName} request has been declined`,
                    sacrament: sacramentName
                };
            }
        });
    };

    const mergeNotifications = (existingNotifications, newNotifications) => {
        const notificationMap = new Map();
        
        existingNotifications.forEach(notification => {
            notificationMap.set(notification.id, notification);
        });
        
        newNotifications.forEach(notification => {
            if (!notificationMap.has(notification.id)) {
                notificationMap.set(notification.id, notification);
            }
        });
        
        return Array.from(notificationMap.values());
    };

    const onRefresh = async () => {
        await loadNotifications();
    };

    const markAsRead = async (notificationId) => {
        const updatedNotifications = notifications.map(notification =>
            notification.id === notificationId 
                ? { ...notification, read: true }
                : notification
        );
        
        setNotifications(updatedNotifications);
        await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    };

    const markAllAsRead = async () => {
        if (notifications.length === 0) return;

        Alert.alert(
            'Mark All as Read',
            'Mark all notifications as read?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Mark All',
                    style: 'default',
                    onPress: async () => {
                        const updatedNotifications = notifications.map(notification => ({
                            ...notification,
                            read: true
                        }));
                        
                        setNotifications(updatedNotifications);
                        await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
                    }
                }
            ]
        );
    };

    const deleteNotification = async (notificationId) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedNotifications = notifications.filter(
                            notification => notification.id !== notificationId
                        );
                        
                        setNotifications(updatedNotifications);
                        await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
                    }
                }
            ]
        );
    };

    const clearAllNotifications = async () => {
        if (notifications.length === 0) return;

        Alert.alert(
            'Clear All Notifications',
            'This will delete all your notifications. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        setNotifications([]);
                        await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
                    }
                }
            ]
        );
    };

    const getNotificationConfig = (type) => {
        if (type === 'approved') {
            return {
                icon: 'check-circle',
                color: Colors.approved,
                bgColor: '#f0fdf4',
                iconBg: '#dcfce7',
            };
        } else {
            return {
                icon: 'x-circle',
                color: Colors.rejected,
                bgColor: '#fef2f2',
                iconBg: '#fee2e2',
            };
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = notifications.filter(notification => {
        if (activeFilter === 'unread') return !notification.read;
        if (activeFilter === 'read') return notification.read;
        return true;
    });

    // 🎨 MODERN NOTIFICATION ITEM COMPONENT
    const NotificationItem = ({ notification, index }) => {
        const config = getNotificationConfig(notification.type);
        const scaleAnim = useState(new Animated.Value(0.9))[0];
        const opacityAnim = useState(new Animated.Value(0))[0];

        useEffect(() => {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    delay: index * 100,
                    useNativeDriver: true,
                })
            ]).start();
        }, []);

        const getSacramentIcon = (sacrament) => {
            const icons = {
                'Baptism': 'droplet',
                'Confirmation': 'award',
                'Marriage': 'heart',
                'Funeral Service': 'cross',
                'Mass Intention': 'book-open',
                'Blessing': 'star',
                'Holy Orders': 'user-check',
                'First Communion': 'wine',
                'Volunteer': 'users',
                'Certificate': 'file-text',
                'General': 'bell'
            };
            return icons[sacrament] || 'bell';
        };

        return (
            <Animated.View 
                style={[
                    styles.notificationCard,
                    { 
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }
                ]}
            >
                <TouchableOpacity 
                    style={styles.notificationContent}
                    onPress={() => markAsRead(notification.id)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
                        <Feather 
                            name={getSacramentIcon(notification.sacrament)} 
                            size={20} 
                            color={config.color} 
                        />
                    </View>
                    
                    <View style={styles.contentContainer}>
                        <View style={styles.messageHeader}>
                            <Text style={styles.notificationMessage} numberOfLines={2}>
                                {notification.message}
                            </Text>
                            {!notification.read && (
                                <View style={styles.unreadDot} />
                            )}
                        </View>
                        
                        <View style={styles.footer}>
                            <View style={[styles.statusBadge, { backgroundColor: config.iconBg }]}>
                                <Feather 
                                    name={config.icon} 
                                    size={12} 
                                    color={config.color} 
                                />
                                <Text style={[styles.statusText, { color: config.color }]}>
                                    {notification.type === 'approved' ? 'Approved' : 'Declined'}
                                </Text>
                            </View>
                            <Text style={styles.notificationTime}>
                                {formatTimeAgo(notification.timestamp)}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.moreButton}
                        onPress={() => deleteNotification(notification.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="more-vertical" size={16} color={Colors.textLight} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return notificationTime.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
            
            {/* 🎨 MODERN HEADER */}
            <Animated.View 
                style={[
                    styles.header,
                    { opacity: fadeAnim }
                ]}
            >
                <View style={styles.headerContent}>
                  
                   

                    <View style={styles.headerActions}>
                        {unreadCount > 0 && (
                            <TouchableOpacity 
                                style={styles.headerActionButton}
                                onPress={markAllAsRead}
                                activeOpacity={0.7}
                            >
                                <Feather name="check-all" size={20} color={Colors.textWhite} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>

            {/* 🎨 FILTER TABS */}
            <View style={styles.filterContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {[
                        { key: 'all', label: 'All', count: notifications.length },
                        { key: 'unread', label: 'Unread', count: unreadCount },
                        { key: 'read', label: 'Read', count: notifications.length - unreadCount },
                    ].map((tab) => (
                        <TouchableOpacity 
                            key={tab.key}
                            style={[
                                styles.filterTab,
                                activeFilter === tab.key && styles.filterTabActive
                            ]}
                            onPress={() => setActiveFilter(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.filterTabText,
                                activeFilter === tab.key && styles.filterTabTextActive
                            ]}>
                                {tab.label}
                            </Text>
                            <View style={[
                                styles.countBadge,
                                activeFilter === tab.key && styles.countBadgeActive
                            ]}>
                                <Text style={[
                                    styles.countText,
                                    activeFilter === tab.key && styles.countTextActive
                                ]}>
                                    {tab.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 🎨 MODERN NOTIFICATIONS LIST */}
            <ScrollView
                style={styles.notificationsList}
                contentContainerStyle={[
                    styles.notificationsContent,
                    filteredNotifications.length === 0 && styles.emptyContainer
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                        progressBackgroundColor={Colors.background}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredNotifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyStateIcon}>
                            <Feather name="bell" size={64} color={Colors.textLight} />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            No notifications
                        </Text>
                        <Text style={styles.emptyStateMessage}>
                            {activeFilter === 'all' 
                                ? "You're all caught up! New updates will appear here."
                                : `No ${activeFilter} notifications found.`
                            }
                        </Text>
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={onRefresh}
                            activeOpacity={0.7}
                        >
                            <Feather name="refresh-cw" size={16} color={Colors.textWhite} />
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <NotificationItem 
                            key={notification.id} 
                            notification={notification}
                            index={index}
                        />
                    ))
                )}
                
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

// 🎨 MODERN STYLES
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },


   
  
    
    // FILTER STYLES
    filterContainer: {
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    filterScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginRight: 6,
    },
    filterTabTextActive: {
        color: Colors.textWhite,
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 24,
        alignItems: 'center',
    },
    countBadgeActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    countTextActive: {
        color: Colors.textWhite,
    },
    
    // NOTIFICATION CARD STYLES
    notificationsList: {
        flex: 1,
    },
    notificationsContent: {
        padding: 20,
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    notificationCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    notificationContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    notificationMessage: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 22,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginTop: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    notificationTime: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '500',
    },
    moreButton: {
        padding: 4,
        marginLeft: 8,
        marginTop: -4,
    },
    
    // EMPTY STATE STYLES
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyStateIcon: {
        marginBottom: 24,
        opacity: 0.6,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateMessage: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    refreshButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textWhite,
        marginLeft: 8,
    },
    
    // MISC STYLES
    bottomSpacer: {
        height: 20,
    },
});
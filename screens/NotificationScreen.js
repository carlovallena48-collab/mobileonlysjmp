import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, RefreshControl, Alert,
    Dimensions, Platform, Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// 🎨 ENHANCED COLOR PALETTE
const Colors = {
    // Primary Colors
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    
    // Background Colors
    background: '#F8FDF8',
    cardBackground: '#FFFFFF',
    
    // Text Colors
    textPrimary: '#1B5E20',
    textSecondary: '#4E6352',
    textLight: '#78957C',
    textWhite: '#FFFFFF',
    
    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // UI Colors
    border: '#E8F5E9',
    shadow: 'rgba(46, 125, 50, 0.1)',
    
    // Notification Type Colors
    approved: '#4CAF50',
    pending: '#FF9800',
    rejected: '#F44336',
    submitted: '#2196F3',
    reminder: '#9C27B0',
    cancelled: '#795548'
};

const NOTIFICATION_STORAGE_KEY = '@notificationHistory';

export default function NotificationScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const fadeAnim = useState(new Animated.Value(0))[0];

    // Load notifications on component mount
    useEffect(() => {
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

    const loadNotifications = async () => {
        try {
            const storedNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
            if (storedNotifications) {
                const parsedNotifications = JSON.parse(storedNotifications);
                const sortedNotifications = parsedNotifications.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setNotifications(sortedNotifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
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

    // 🎨 ENHANCED NOTIFICATION STYLING FUNCTIONS
    const getNotificationConfig = (type) => {
        const configs = {
            approved: {
                icon: 'check-circle',
                color: Colors.approved,
                bgColor: '#E8F5E9',
                title: 'Approved',
                gradient: ['#E8F5E9', '#F1F8E9']
            },
            pending: {
                icon: 'clock',
                color: Colors.pending,
                bgColor: '#FFF3E0',
                title: 'Under Review',
                gradient: ['#FFF3E0', '#FFF8E1']
            },
            rejected: {
                icon: 'x-circle',
                color: Colors.rejected,
                bgColor: '#FFEBEE',
                title: 'Update Required',
                gradient: ['#FFEBEE', '#FCE4EC']
            },
            submitted: {
                icon: 'send',
                color: Colors.submitted,
                bgColor: '#E3F2FD',
                title: 'Submitted',
                gradient: ['#E3F2FD', '#E1F5FE']
            },
            reminder: {
                icon: 'bell',
                color: Colors.reminder,
                bgColor: '#F3E5F5',
                title: 'Reminder',
                gradient: ['#F3E5F5', '#F1F8E9']
            },
            cancelled: {
                icon: 'slash',
                color: Colors.cancelled,
                bgColor: '#EFEBE9',
                title: 'Cancelled',
                gradient: ['#EFEBE9', '#F5F5F5']
            },
            default: {
                icon: 'info',
                color: Colors.info,
                bgColor: '#F5F5F5',
                title: 'Notification',
                gradient: ['#F5F5F5', '#FAFAFA']
            }
        };
        
        return configs[type] || configs.default;
    };

    const getFilteredNotifications = () => {
        switch (filter) {
            case 'unread':
                return notifications.filter(notification => !notification.read);
            case 'read':
                return notifications.filter(notification => notification.read);
            default:
                return notifications;
        }
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    // 🎨 BEAUTIFUL NOTIFICATION ITEM COMPONENT
    const NotificationItem = ({ notification, index }) => {
        const config = getNotificationConfig(notification.type);
        const scaleAnim = useState(new Animated.Value(0.9))[0];

        useEffect(() => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        return (
            <Animated.View 
                style={[
                    styles.notificationCard,
                    { 
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: config.bgColor,
                        borderLeftColor: config.color
                    }
                ]}
            >
                <TouchableOpacity 
                    style={styles.notificationContent}
                    onPress={() => markAsRead(notification.id)}
                    activeOpacity={0.7}
                >
                    {/* Header Section */}
                    <View style={styles.notificationHeader}>
                        <View style={styles.titleContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
                                <Feather 
                                    name={config.icon} 
                                    size={16} 
                                    color={Colors.textWhite} 
                                />
                            </View>
                            <Text style={styles.notificationTitle}>
                                {config.title}
                            </Text>
                            {!notification.read && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadBadgeText}>New</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.headerActions}>
                            <Text style={styles.notificationTime}>
                                {formatTimeAgo(notification.timestamp)}
                            </Text>
                            <TouchableOpacity 
                                style={styles.moreButton}
                                onPress={() => deleteNotification(notification.id)}
                            >
                                <Feather name="more-vertical" size={16} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Message Section */}
                    <Text style={styles.notificationMessage}>
                        {notification.message}
                    </Text>

                    {/* Additional Data Section */}
                    {notification.data && (
                        <View style={styles.dataContainer}>
                            {notification.data.childName && (
                                <View style={styles.dataRow}>
                                    <Feather name="user" size={12} color={config.color} />
                                    <Text style={styles.dataText}>
                                        Child: {notification.data.childName}
                                    </Text>
                                </View>
                            )}
                            {notification.data.baptismDate && (
                                <View style={styles.dataRow}>
                                    <Feather name="calendar" size={12} color={config.color} />
                                    <Text style={styles.dataText}>
                                        Date: {formatDate(notification.data.baptismDate)}
                                    </Text>
                                </View>
                            )}
                            {notification.data.baptismTime && (
                                <View style={styles.dataRow}>
                                    <Feather name="clock" size={12} color={config.color} />
                                    <Text style={styles.dataText}>
                                        Time: {notification.data.baptismTime}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            {/* 🎨 ENHANCED HEADER */}
            <Animated.View 
                style={[
                    styles.header,
                    { opacity: fadeAnim }
                ]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        onPress={() => navigation?.goBack()} 
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Feather name="chevron-left" size={24} color={Colors.textWhite} />
                    </TouchableOpacity>
                    
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <Text style={styles.headerSubtitle}>
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </Text>
                    </View>

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
                        {notifications.length > 0 && (
                            <TouchableOpacity 
                                style={styles.headerActionButton}
                                onPress={clearAllNotifications}
                                activeOpacity={0.7}
                            >
                                <Feather name="trash-2" size={20} color={Colors.textWhite} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>

            {/* 🎨 ENHANCED FILTER TABS */}
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
                                filter === tab.key && styles.filterTabActive
                            ]}
                            onPress={() => setFilter(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.filterTabText,
                                filter === tab.key && styles.filterTabTextActive
                            ]}>
                                {tab.label}
                            </Text>
                            <View style={[
                                styles.countBadge,
                                filter === tab.key && styles.countBadgeActive
                            ]}>
                                <Text style={[
                                    styles.countText,
                                    filter === tab.key && styles.countTextActive
                                ]}>
                                    {tab.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 🎨 ENHANCED NOTIFICATIONS LIST */}
            <ScrollView
                style={styles.notificationsList}
                contentContainerStyle={styles.notificationsContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                        title="Pull to refresh"
                        titleColor={Colors.textLight}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredNotifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyStateIcon}>
                            <Feather name="bell-off" size={80} color={Colors.textLight} />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            {filter === 'all' ? 'No Notifications' : 
                             filter === 'unread' ? 'No Unread Notifications' : 
                             'No Read Notifications'}
                        </Text>
                        <Text style={styles.emptyStateMessage}>
                            {filter === 'all' 
                                ? "You're all caught up! New notifications will appear here."
                                : "No notifications match your current filter."
                            }
                        </Text>
                        {filter !== 'all' && (
                            <TouchableOpacity 
                                style={styles.changeFilterButton}
                                onPress={() => setFilter('all')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.changeFilterText}>Show All Notifications</Text>
                            </TouchableOpacity>
                        )}
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
                
                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

// 🎨 BEAUTIFUL STYLES
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    
    // HEADER STYLES
    header: {
        backgroundColor: Colors.primary,
        paddingTop: Platform.OS === 'android' ? 30 : 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textWhite,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerActionButton: {
        padding: 8,
        marginLeft: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    
    // FILTER STYLES
    filterContainer: {
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    filterScrollContent: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
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
        padding: 16,
    },
    notificationCard: {
        borderRadius: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    notificationContent: {
        padding: 16,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    unreadBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textWhite,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationTime: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '500',
        marginRight: 8,
    },
    moreButton: {
        padding: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    dataContainer: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dataText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 8,
        fontWeight: '500',
    },
    
    // EMPTY STATE STYLES
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyStateIcon: {
        marginBottom: 20,
        opacity: 0.5,
    },
    emptyStateTitle: {
        fontSize: 20,
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
        marginBottom: 20,
    },
    changeFilterButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    changeFilterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textWhite,
    },
    
    // MISC STYLES
    bottomSpacer: {
        height: 30,
    },
});
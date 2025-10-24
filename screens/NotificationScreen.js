    import React, { useState, useEffect, useCallback } from 'react';
    import {
        View, Text, ScrollView, TouchableOpacity,
        StyleSheet, RefreshControl, Alert,
        Dimensions, Platform, Animated, StatusBar
    } from 'react-native';
    import { Feather } from '@expo/vector-icons';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const { width, height } = Dimensions.get('window');

    // 🎨 BASIC COLOR PALETTE
    const Colors = {
        primary: '#1f6fe5', // Isang mas simple at malinis na asul
        background: '#f4f4f4', // Mas magaan na background
        cardBackground: '#ffffff',
        textPrimary: '#333333',
        textSecondary: '#666666',
        textLight: '#aaaaaa',
        textWhite: '#ffffff',
        approved: '#4CAF50', // Standard Green
        rejected: '#F44336', // Standard Red
        border: '#dddddd',
        unreadDot: '#1f6fe5', // Primary color para sa dot
    };

    // User-specific storage key - WALANG PAGBABAGO
    const getNotificationStorageKey = (email) => {
        // Linisin ang email para maging valid na key
        const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
        return `@user_notifications_${safeEmail}`;
    };

    const API_BASE_URL = "http://192.168.1.42:5000";

    const ALL_ENDPOINTS = [
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

    export default function NotificationScreen({ navigation }) {
        const [notifications, setNotifications] = useState([]);
        const [refreshing, setRefreshing] = useState(false);
        const [userEmail, setUserEmail] = useState('');
        // Tinanggal ang fadeAnim useState dahil inalis ang animated header.
        const [activeFilter, setActiveFilter] = useState('all');

        useEffect(() => {
            loadUserData();
            // Inalis ang animateHeader() call
        }, []);

        // const animateHeader = () => { ... } - TINANGGAL

        // loadUserData - WALANG PAGBABAGO
        const loadUserData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('@userData');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUserEmail(userData.email);
                    await loadNotifications(userData.email);
                } else {
                    // Kung walang user data, i-set ang notifications sa empty at mag-alert
                    Alert.alert("Error", "User data not found. Please log in again.");
                    setNotifications([]);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                Alert.alert("Error", "Could not load user data. Try refreshing.");
            }
        };

        // Pagsamahin ang lumang at bagong notifications nang WALANG DUPLICATE - WALANG PAGBABAGO
        const mergeNotifications = (existingNotifications, newNotifications) => {
            const notificationMap = new Map();

            // 1. I-map ang existing notifications
            existingNotifications.forEach(notification => {
                if (notification && notification.id) {
                    // Tiyakin na ang `read` status ay napanatili
                    notificationMap.set(notification.id, notification);
                }
            });
            
            // 2. I-merge ang new notifications
            newNotifications.forEach(newNotification => {
                if (newNotification && newNotification.id) {
                    // Kung meron na, gamitin ang existing (para manatili ang read status)
                    // Kung wala pa, idagdag ang bago
                    if (!notificationMap.has(newNotification.id)) {
                        // Default to unread if it's a new notification fetched from server
                        notificationMap.set(newNotification.id, { ...newNotification, read: false });
                    }
                }
            });

            return Array.from(notificationMap.values());
        };

        // I-convert ang requests sa notification format - WALANG PAGBABAGO
        const convertToNotifications = (requests, status, userEmail) => {
            return requests.map(request => {
                // Gumamit ng stable ID. Ang Request ID (_id) + Status ay isang magandang unique key.
                const stableId = `${request._id || request.requestNumber || request.applicationId}-${status}`;

                const getSacramentDisplayName = (req) => {
                    const map = {
                        'baptismrequests': 'Baptism',
                        'kumpil_requests': 'Confirmation',
                        'marriage_requests': 'Marriage',
                        'funeral_requests': 'Funeral Service',
                        'pamisa_requests': 'Mass Intention',
                        'blessing_requests': 'Blessing',
                        'holy_orders_requests': 'Holy Orders',
                        'first_communion_requests': 'First Communion',
                        'volunteer-applications': 'Volunteer Application',
                        'certificate-requests': 'Certificate Request',
                    };
                    // Subukan kunin sa `sacrament` field, `type` field, o gamitin ang endpoint name
                    const key = req.sacrament || req.type || req.serviceType || req.endpointName;
                    return map[key] || map[req.endpointName] || key || 'Request';
                };
                
                // Set the endpoint name for clearer context in conversion
                const endpointName = request.endpointName || 'General';
                const sacramentName = getSacramentDisplayName({ ...request, endpointName });

                const baseNotification = {
                    id: stableId,
                    type: status,
                    timestamp: request.lastUpdated || request.createdAt || request.dateSubmitted || request.applicationDate || new Date(),
                    read: false, // Default to unread for new fetched data
                    data: request,
                    userEmail: userEmail 
                };
                
                if (status === 'approved') {
                    return {
                        ...baseNotification,
                        message: `Your ${sacramentName} request has been approved.`,
                        sacrament: sacramentName,
                        reason: request.reason || request.adminNotes || 'Your request has been approved by the admin.'
                    };
                } else {
                    return {
                        ...baseNotification,
                        message: `Your ${sacramentName} request has been declined.`,
                        sacrament: sacramentName,
                        reason: request.reason || request.adminNotes || 'Please contact the office for more details.'
                    };
                }
            }).filter(n => n.id.startsWith('notif-') === false); // Tanggalin ang mga notif na walang stable ID
        };

        // Safe fetch para sa sacrament requests - WALANG PAGBABAGO
        const safeFetchSacramentRequests = async (collectionName, status, userEmail) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/${collectionName}`);
                
                if (!response.ok) {
                    if (response.status === 404) return []; // Okay lang ang 404, ibig sabihin walang endpoint
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data)) return [];
                
                // Filter para lang sa current user at status
                const userRequests = data.filter(request => {
                    if (!request) return false;
                    
                    // Check lahat ng possible email fields
                    const userEmailMatch = 
                        (request.submittedByEmail && request.submittedByEmail === userEmail) || 
                        (request.email && request.email === userEmail) ||
                        (request.userEmail && request.userEmail === userEmail) ||
                        (request.user && request.user.email === userEmail);
                    
                    const statusMatch = request.status === status;
                    
                    return userEmailMatch && statusMatch;
                }).map(request => ({...request, endpointName: collectionName})); // Idagdag ang endpoint name

                return userRequests;
                
            } catch (error) {
                console.error(`Error fetching ${collectionName}:`, error.message);
                return [];
            }
        };

        // Core logic para sa pag-load at pag-sync ng notifications - WALANG PAGBABAGO
        const loadNotifications = useCallback(async (email) => {
            if (!email) return;

            setRefreshing(true);
            const userStorageKey = getNotificationStorageKey(email);
            
            try {
                // 1. Load existing notifications from AsyncStorage
                const storedNotificationsJson = await AsyncStorage.getItem(userStorageKey);
                let existingNotifications = storedNotificationsJson ? JSON.parse(storedNotificationsJson) : [];
                
                console.log('Stored notifications:', existingNotifications.length);
                
                // 2. Fetch latest requests from API
                const allPromises = ALL_ENDPOINTS.flatMap(endpoint => [
                    safeFetchSacramentRequests(endpoint, 'approved', email),
                    safeFetchSacramentRequests(endpoint, 'rejected', email)
                ]);

                const allFetchedRequests = await Promise.all(allPromises);
                const flatFetchedRequests = allFetchedRequests.flat().filter(r => r && r._id); // Filter out null/undefined and requests without an _id

                // 3. Convert all fetched requests to notification format
                const approvedNotifications = convertToNotifications(
                    flatFetchedRequests.filter(req => req.status === 'approved'), 
                    'approved', 
                    email
                );
                const rejectedNotifications = convertToNotifications(
                    flatFetchedRequests.filter(req => req.status === 'rejected'), 
                    'rejected', 
                    email
                );

                const fetchedNotifications = [...approvedNotifications, ...rejectedNotifications];

                // 4. Merge old (local) and new (fetched) notifications
                const mergedAndDeDupedNotifications = mergeNotifications(existingNotifications, fetchedNotifications);
                
                // 5. Sort by timestamp (newest first)
                const sortedNotifications = mergedAndDeDupedNotifications.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                
                // 6. Update state and AsyncStorage
                setNotifications(sortedNotifications);
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(sortedNotifications));
                
                console.log('Final notifications count:', sortedNotifications.length);
                
            } catch (error) {
                console.error('Error loading notifications:', error);
                Alert.alert("Error", "Failed to fetch updates. Displaying cached data.");
            } finally {
                setRefreshing(false);
            }
        }, []);

        // Refresh function - WALANG PAGBABAGO
        const onRefresh = () => {
            if (userEmail) {
                loadNotifications(userEmail);
            }
        };

        // Mark as read - WALANG PAGBABAGO
        const markAsRead = async (notificationId) => {
            if (!userEmail) return;
            
            const updatedNotifications = notifications.map(notification =>
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            );
            
            setNotifications(updatedNotifications);
            const userStorageKey = getNotificationStorageKey(userEmail);
            await AsyncStorage.setItem(userStorageKey, JSON.stringify(updatedNotifications));
        };

        // Mark all as read - WALANG PAGBABAGO
        const markAllAsRead = async () => {
            if (notifications.length === 0 || !userEmail) return;

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
                            const userStorageKey = getNotificationStorageKey(userEmail);
                            await AsyncStorage.setItem(userStorageKey, JSON.stringify(updatedNotifications));
                        }
                    }
                ]
            );
        };

        // Delete notification - WALANG PAGBABAGO
        const deleteNotification = async (notificationId) => {
            if (!userEmail) return;
            
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
                            const userStorageKey = getNotificationStorageKey(userEmail);
                            await AsyncStorage.setItem(userStorageKey, JSON.stringify(updatedNotifications));
                        }
                    }
                ]
            );
        };

        // Clear all notifications - WALANG PAGBABAGO
        const clearAllNotifications = async () => {
            if (notifications.length === 0 || !userEmail) return;

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
                            const userStorageKey = getNotificationStorageKey(userEmail);
                            await AsyncStorage.setItem(userStorageKey, JSON.stringify([]));
                        }
                    }
                ]
            );
        };

        // Kunin ang configuration para sa notification type
        const getNotificationConfig = (type) => {
            if (type === 'approved') {
                return {
                    icon: 'check-circle',
                    color: Colors.approved,
                    bgColor: '#e8f5e9', // Light green
                    iconBg: '#c8e6c9',
                };
            } else {
                return {
                    icon: 'x-circle',
                    color: Colors.rejected,
                    bgColor: '#ffebed', // Light red
                    iconBg: '#ffcdd2', 
                };
            }
        };

        // Ipakita ang reason kapag pinindot ang notification - WALANG PAGBABAGO
        const showNotificationDetails = (notification) => {
            const title = notification.type === 'approved' ? `${notification.sacrament} Approved` : `${notification.sacrament} Declined`;
            const message = notification.reason || 
                (notification.type === 'approved' 
                    ? 'Your request has been successfully approved. Please check your request details.' 
                    : 'Your request has been declined. Please review the requirements or contact the office.');
            
            Alert.alert(
                title,
                message,
                [
                    { 
                        text: 'OK', 
                        style: 'default',
                        onPress: () => markAsRead(notification.id) // Mark as read on OK
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteNotification(notification.id)
                    }
                ]
            );
        };

        const unreadCount = notifications.filter(n => !n.read).length;
        const filteredNotifications = notifications.filter(notification => {
            if (activeFilter === 'unread') return !notification.read;
            if (activeFilter === 'read') return notification.read;
            return true;
        });

        // 🎨 NOTIFICATION ITEM COMPONENT - PINASIMPLENG UI
        const NotificationItem = ({ notification, index }) => {
            const config = getNotificationConfig(notification.type);
            // Simpleng fade-in animation lang
            const opacityAnim = useState(new Animated.Value(0))[0];

            useEffect(() => {
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    delay: index * 50, 
                    useNativeDriver: true,
                }).start();
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
                    'Volunteer Application': 'users',
                    'Certificate Request': 'file-text',
                    'General': 'bell'
                };
                return icons[sacrament] || 'bell';
            };

            return (
                <Animated.View 
                    style={[
                        styles.notificationCardSimple,
                        { 
                            opacity: opacityAnim,
                            backgroundColor: notification.read ? Colors.cardBackground : config.bgColor, // Gamitin ang light color para sa unread
                        }
                    ]}
                >
                    <TouchableOpacity 
                        style={styles.notificationContentSimple}
                        onPress={() => showNotificationDetails(notification)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainerSimple, { backgroundColor: config.iconBg }]}>
                            <Feather 
                                name={getSacramentIcon(notification.sacrament)} 
                                size={18} 
                                color={config.color} 
                            />
                        </View>
                        
                        <View style={styles.contentContainerSimple}>
                            <Text 
                                style={[
                                    styles.notificationMessageSimple, 
                                    { fontWeight: notification.read ? 'normal' : '600' }
                                ]} 
                                numberOfLines={1}
                            >
                                {notification.message}
                            </Text>
                            
                            <Text style={styles.notificationTimeSimple}>
                                {notification.sacrament} • {formatTimeAgo(notification.timestamp)}
                            </Text>
                        </View>

                        {!notification.read && (
                            <View style={styles.unreadDotSimple} />
                        )}

                    </TouchableOpacity>
                </Animated.View>
            );
        };

        // formatTimeAgo - WALANG PAGBABAGO
        const formatTimeAgo = (timestamp) => {
            try {
                const now = new Date();
                const notificationTime = new Date(timestamp);
                
                if (isNaN(notificationTime.getTime())) return 'Recently';
                
                const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);
                
                if (diffInSeconds < 60) return 'Just now';
                if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
                if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
                if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
                
                // Mas maganda kung may year ang date, pero month/day lang muna para maikli
                return notificationTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            } catch (error) {
                return 'Recently';
            }
        };

        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={Colors.cardBackground} barStyle="dark-content" />
                
                {/* SIMPLE HEADER */}
                <View style={styles.simpleHeader}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadCountBadge}>
                                <Text style={styles.unreadCountText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.headerActions}>
                        {/* Refresh Button */}
                        <TouchableOpacity 
                            style={styles.headerActionButton}
                            onPress={onRefresh}
                            activeOpacity={0.7}
                            accessibilityLabel="Refresh notifications"
                        >
                            <Feather name="refresh-cw" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        {unreadCount > 0 && (
                            <TouchableOpacity 
                                style={styles.headerActionButton}
                                onPress={markAllAsRead}
                                activeOpacity={0.7}
                                accessibilityLabel="Mark all as read"
                            >
                                <Feather name="mail" size={20} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        )}
                        {notifications.length > 0 && (
                            <TouchableOpacity 
                                style={styles.headerActionButton}
                                onPress={clearAllNotifications}
                                activeOpacity={0.7}
                                accessibilityLabel="Clear all notifications"
                            >
                                <Feather name="trash-2" size={20} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* FILTER TABS */}
                <View style={styles.filterContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScrollContentSimple}
                    >
                        {[
                            { key: 'all', label: 'All', count: notifications.length },
                            { key: 'unread', label: 'Unread', count: unreadCount },
                            { key: 'read', label: 'Read', count: notifications.length - unreadCount },
                        ].map((tab) => (
                            <TouchableOpacity 
                                key={tab.key}
                                style={[
                                    styles.filterTabSimple,
                                    activeFilter === tab.key && styles.filterTabActiveSimple
                                ]}
                                onPress={() => setActiveFilter(tab.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.filterTabTextSimple,
                                    activeFilter === tab.key && styles.filterTabTextActiveSimple
                                ]}>
                                    {tab.label}
                                </Text>
                                <View style={[
                                    styles.countBadgeSimple,
                                    activeFilter === tab.key ? styles.countBadgeActiveSimple : styles.countBadgeInactiveSimple
                                ]}>
                                    <Text style={[
                                        styles.countTextSimple,
                                        activeFilter === tab.key && styles.countTextActiveSimple
                                    ]}>
                                        {tab.count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* NOTIFICATIONS LIST */}
                <ScrollView
                    style={styles.notificationsList}
                    contentContainerStyle={[
                        styles.notificationsContentSimple,
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

    // 🎨 SIMPLIFIED STYLES
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
        },
        
        // SIMPLE HEADER STYLES
        simpleHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingTop: Platform.OS === 'ios' ? 50 : 20,
            paddingBottom: 10,
            backgroundColor: Colors.cardBackground,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
            elevation: 2,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButton: {
            padding: 5,
            marginRight: 10,
        },
        headerTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: Colors.textPrimary,
            marginRight: 10,
        },
        unreadCountBadge: {
            backgroundColor: Colors.rejected,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            minWidth: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        unreadCountText: {
            fontSize: 11,
            fontWeight: 'bold',
            color: Colors.textWhite,
        },
        headerActions: {
            flexDirection: 'row',
            gap: 15,
        },
        headerActionButton: {
            padding: 5,
        },
        
        // FILTER STYLES - MAS PINA-FLAT
        filterContainer: {
            backgroundColor: Colors.cardBackground,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        filterScrollContentSimple: {
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
        filterTabSimple: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 10,
            backgroundColor: Colors.background,
        },
        filterTabActiveSimple: {
            backgroundColor: Colors.primary,
        },
        filterTabTextSimple: {
            fontSize: 14,
            fontWeight: '500',
            color: Colors.textSecondary,
            marginRight: 5,
        },
        filterTabTextActiveSimple: {
            color: Colors.textWhite,
        },
        countBadgeSimple: {
            backgroundColor: Colors.textWhite,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 10,
            minWidth: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        countBadgeInactiveSimple: {
            backgroundColor: Colors.border,
        },
        countBadgeActiveSimple: {
            backgroundColor: 'rgba(255,255,255,0.3)', // White semi-transparent sa active tab
        },
        countTextSimple: {
            fontSize: 11,
            fontWeight: 'bold',
            color: Colors.textPrimary,
        },
        countTextActiveSimple: {
            color: Colors.textWhite,
        },
        
        // NOTIFICATION LIST STYLES
        notificationsList: {
            flex: 1,
        },
        notificationsContentSimple: {
            paddingHorizontal: 15,
            paddingTop: 10,
            paddingBottom: 20,
        },
        
        // NOTIFICATION CARD STYLES - PINASIMPLENG DESIGN
        notificationCardSimple: {
            marginBottom: 8,
            borderRadius: 10,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: Colors.border,
        },
        notificationContentSimple: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
        },
        iconContainerSimple: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
        },
        contentContainerSimple: {
            flex: 1,
        },
        notificationMessageSimple: {
            fontSize: 15,
            color: Colors.textPrimary,
            marginBottom: 3,
        },
        notificationTimeSimple: {
            fontSize: 12,
            color: Colors.textSecondary,
        },
        unreadDotSimple: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.unreadDot,
            marginLeft: 10,
        },

        // EMPTY STATE
        emptyContainer: {
            flexGrow: 1,
            justifyContent: 'center',
        },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 30,
            paddingTop: height * 0.15, 
        },
        emptyStateIcon: {
            marginBottom: 20,
        },
        emptyStateTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.textPrimary,
            marginBottom: 10,
        },
        emptyStateMessage: {
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
            paddingHorizontal: 20,
        },
        refreshButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 25,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
        },
        refreshButtonText: {
            color: Colors.textWhite,
            marginLeft: 8,
            fontWeight: '600',
            fontSize: 14,
        },
        bottomSpacer: {
            height: 30,
        },
    });
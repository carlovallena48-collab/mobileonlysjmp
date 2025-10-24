import React, { useState, useRef, useEffect } from 'react';
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
    Animated,
    Modal,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// 📱 RESPONSIVE SIZING
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 414;
const CAROUSEL_ITEM_WIDTH = width - (isSmallDevice ? 32 : 40);
const AUTOSWIPE_INTERVAL = 5000;

// 🎨 GREEN THEME COLOR PALETTE
const Colors = {
    primary: "#1a5e1a",           // Deep Forest Green
    primaryLight: "#2e7d32",      // Medium Green
    primaryDark: "#0d3d0d",       // Dark Green
    secondary: "#ffd700",         // Gold
    secondaryLight: "#ffeb3b",    // Light Gold
    secondaryDark: "#b8860b",     // Dark Gold
    background: "#f8fafc",        // Clean White/Light Gray
    cardBackground: "#ffffff",    // Pure White
    textPrimary: "#1e293b",       // Deep Navy
    textSecondary: "#64748b",     // Slate Gray
    textLight: "#94a3b8",         // Light Slate
    accentGreen: "#059669",       // Emerald Green
    accentBlue: "#2563eb",        // Cobalt Blue
    accentPurple: "#7c3aed",      // Purple
    lightGreen: "#dcfce7",        // Mint Green
    lightGold: "#fef3c7",         // Light Amber
    lightBlue: "#dbeafe",         // Light Blue
    lightPurple: "#ede9fe",       // Light Purple
    facebook: "#1877F2",
    border: "#e2e8f0",            // Subtle Border
    error: "#ef4444",             // Red for errors/badges
    success: "#10b981",           // Green for success
};

// --- MOCK BIBLE VERSE DATA ---
const bibleVerses = [
    {
        date: '2025-10-06',
        verse: 'I can do all things through Christ who strengthens me.',
        reference: 'Philippians 4:13',
    },
    {
        date: '2025-10-07',
        verse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        reference: 'John 3:16',
    },
    {
        date: '2025-10-08',
        verse: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
        reference: 'Joshua 1:9',
    },
];

// Social Media Links (Facebook only)
const socialMediaLinks = {  
    facebook: 'https://www.facebook.com/sjmpmontalban',
};

// Dummy imports for the Parish images
import annointing from '../assets/parish1.jpg';
import baptism from '../assets/parish2.jpg';
import confession from '../assets/parish3.jpg';
import confirmation from '../assets/parish4.jpg';
import eucharist from '../assets/parish5.jpg';
import church6 from '../assets/parish.jpg';

// Updated Image Data with better captions and consistent naming
const parishImages = [
    { id: 'p1', image: church6, caption: 'San Jose Manggagawa Parish', title: '' },
    { id: 'p2', image: annointing, caption: 'San Jose Manggagawa Parish', title: '' },
    { id: 'p3', image: baptism, caption: 'San Jose Manggagawa Parish', title: '' },
    { id: 'p4', image: confession, caption: 'San Jose Manggagawa Parish', title: '' },
    { id: 'p5', image: confirmation, caption: 'San Jose Manggagawa Parish', title: '' },
    { id: 'p6', image: eucharist, caption: 'San Jose Manggagawa Parish', title: '' },
];

// --- UPDATED MASS SCHEDULES BASED ON IMAGE ---
const massSchedules = [
    { 
        id: 'ms1', 
        day: 'First Wednesday', 
        time: ['6:00 AM', '6:00 PM'], 
        image: church6,
        type: 'special'
    },
    { 
        id: 'ms2', 
        day: 'First Friday', 
        time: ['6:00 AM', '6:00 PM'], 
        image: church6,
        type: 'special'
    },
    { 
        id: 'ms3', 
        day: 'Weekdays', 
        time: ['6:00 PM'], 
        image: church6,
        type: 'regular'
    },
    { 
        id: 'ms4', 
        day: 'Saturday', 
        time: ['6:00 PM'], 
        image: church6,
        type: 'anticipated'
    },
    { 
        id: 'ms5', 
        day: 'Sunday', 
        time: ['6:00 AM', '7:30 AM', '9:00 AM', '5:00 PM', '6:30 PM'], 
        image: church6,
        type: 'sunday'
    },
];

// --- UPDATED MISSION VISION DATA BASED ON IMAGES ---
const missionVisionData = {
    mission: [
        "PATULOY NA PAGSASAGAWA NG MGA PAG-AARAL, PAGSASANAY AT PAGSASABUHAY NG SALITA NG DIYOS.",
        "PAGYAKAP AT PAGMAMAHAL SA EUKARISTIYA AT SA LAHAT NG MGA SAKRAMENTO.",
        "BUMUO NG PAMAYANAN NA MAY DEBOSYON, PAGKILALA AT PAGPAPAHALAGA SA MGA KATANGIAN NI MARIA AT NI SAN JOSE MANGGAGAWA.",
        "PAGSIKAPAN NA PAJSAWAKIN, PATATAGIN AT PASIGLAHIN ANG MUNTING SAMBAYANANG KRISTIYANO SA TULONG AT GABAY NG KURA PAROKO."
    ],
    vision: "PAGTATATAG NG PAMAYANAN NG DIYOS, NA TAPAT NA SUMUSUNOD SA MGA ARAL AT TURO NI HESUS UPANG MAGING ISANG SAMBAYANAN NA ANG PINANANALIGAN, PINAGKAKATIWALAAN, SINUSUNOD AT PINAGLILINGKURAN AY ANG TUNAY NA DIYOS, UPANG MAGING SAMBAYANAN NA ANG SENTRO NG LAHAT AY ANG DIYOS, AT MAKAPAMUHAY SA KABANALAN AYON SA KALOOBAN NG PANGINOON, SA TULONG NI MARIA, INA NG SIMBAHAN AT NI SAN JOSE MANGGAGAWA NA ATING PATRON"
};

// --- BAPTISM REMINDERS BASED ON IMAGE ---
const baptismReminders = {
    schedules: {
        solo: {
            days: "EVERY TUESDAY TO SATURDAY",
            fee: "₱1,500.00",
            times: ["3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"]
        },
        common: {
            days: "EVERY SATURDAY @ 9:30 AM, EVERY SUNDAY @ 1:30 PM",
            fee: "₱500.00"
        }
    },
    requirements: [
        "BIRTH CERTIFICATE ng batang bibinyagan (ORIGINAL COPY or PHOTOCOPY: LOCAL/PSA BIRTH CERTIFICATE)",
        "Katoliko ang mga magulang o kahit isa sa magulang",
        "Para sa batang 3yrs old pataas: CERTIFICATE OF NO RECORD OF BAPTISM",
        "Para sa batang 7yrs old pataas: Adult Baptism (interview at seminar)",
        "Seminar ng mga magulang tuwing Huwebes @ 9:00 AM",
        "Mga damit: BABAE - puting bestida; LALAKI - puting polo at puting shorts",
        "Kandila: ₱15.00 bawat isa o gumawa ng sarili (bawal ang walang saluhan)",
        "BAPTISMAL CERTIFICATE: ₱50.00, makukuha pagkalipas ng isang buwan"
    ]
};

// --- GENERAL REMINDERS BASED ON IMAGES ---
const generalReminders = [
    "ALL TRANSACTIONS MUST BE DONE AT THE PARISH OFFICE ONLY",
    "ALL TRANSACTIONS BEYOND 5:00 P.M. WILL NOT BE ENTERTAINED",
    "MASS INTENTIONS: TUESDAY-SATURDAY (8AM-12NN & 2PM-5PM), SUNDAY (8AM-12NN ONLY)",
    "MASS INTENTIONS BEYOND THESE TIMES WILL NOT BE INCLUDED",
    "PLEASE FOLLOW THE SAID OFFICE HOURS"
];

// --- FORM REMINDERS BASED ON IMAGES ---
const formReminders = [
    "MAGULANG lamang ang dapat magsulat o sumagot sa Baptismal Form",
    "Siguraduhing tama lahat ng spelling ng inyong isinulat",
    "Baptismal Certificate ay makukuha pagkalipas ng isang buwan",
    "MAGULANG lamang ang maaaring kumuha ng Baptismal Certificate (magpakita ng ID)",
    "Kung ibang tao ang kukuha: Authorization Letter, Xerox ng ID ng Magulang at ID ng kukuha",
    "Pagkuha ng certificates: Martes hanggang Sabado lamang, ₱50.00 kada kopya"
];

// --- HELPER FUNCTION: Get Daily Verse ---
const getDailyVerse = () => {
    const today = new Date().toISOString().slice(0, 10);
    let verse = bibleVerses.find(v => v.date === today);

    if (!verse) {
        const randomIndex = Math.floor(Math.random() * bibleVerses.length);
        verse = bibleVerses[randomIndex];
    }
    return verse;
};

// --- MODAL: BIBLE VERSE ---
const BibleVerseModal = ({ isVisible, onClose }) => {
    const dailyVerse = getDailyVerse();
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight]}
                        style={modalStyles.modalHeader}
                    >
                        <View style={modalStyles.titleContainer}>
                            <Ionicons name="book" size={24} color="#fff" />
                            <Text style={modalStyles.modalTitle}>Daily Scripture</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>
                    
                    <View style={modalStyles.verseContainer}>
                        <LinearGradient
                            colors={[Colors.lightGreen, '#f0fdf4']}
                            style={modalStyles.verseIconContainer}
                        >
                            <Ionicons name="quote" size={32} color={Colors.primary} />
                        </LinearGradient>
                        <Text style={modalStyles.verseText}>"{dailyVerse.verse}"</Text>
                        <View style={modalStyles.referenceContainer}>
                            <View style={modalStyles.referenceLine} />
                            <Text style={modalStyles.verseReference}>{dailyVerse.reference}</Text>
                            <View style={modalStyles.referenceLine} />
                        </View>
                    </View>
                    
                    <TouchableOpacity style={modalStyles.actionButton} onPress={onClose}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryLight]}
                            style={modalStyles.gradientButton}
                        >
                            <Text style={modalStyles.actionButtonText}>Amen</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// --- MODAL: WHO IS SAINT JOSEPH ---
const SaintJosephModal = ({ isVisible, onClose }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '85%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <View style={modalStyles.titleContainer}>
                        <FontAwesome5 name="hammer" size={24} color="#fff" />
                        <Text style={modalStyles.modalTitle}>Saint Joseph</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.saintHeader}>
                        <LinearGradient
                            colors={[Colors.secondary, Colors.secondaryLight]}
                            style={modalStyles.saintBadge}
                        >
                            <FontAwesome5 name="cross" size={20} color={Colors.primary} />
                        </LinearGradient>
                        <Text style={modalStyles.saintSubtitle}>Patron Saint of Workers</Text>
                    </View>
                    
                    <View style={modalStyles.saintSection}>
                        <Text style={modalStyles.saintTitle}>The Earthly Father of Jesus</Text>
                        <Text style={modalStyles.saintText}>
                            Saint Joseph was the husband of the Blessed Virgin Mary and the foster father of Jesus Christ. 
                            He is revered as the patron saint of workers, fathers, and the universal Church.
                        </Text>
                    </View>

                    <View style={modalStyles.saintSection}>
                        <Text style={modalStyles.saintTitle}>As a Worker</Text>
                        <Text style={modalStyles.saintText}>
                            Joseph was a carpenter by trade, teaching Jesus the value of honest labor and dedication. 
                            He exemplifies the dignity of human work and serves as an inspiration to all workers.
                        </Text>
                    </View>

                    <View style={modalStyles.saintSection}>
                        <Text style={modalStyles.saintTitle}>Virtues of Saint Joseph</Text>
                        <View style={modalStyles.virtueList}>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentGreen} />
                                </View>
                                <Text style={modalStyles.virtueText}>Obedience to God's will</Text>
                            </View>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentGreen} />
                                </View>
                                <Text style={modalStyles.virtueText}>Humility and silence</Text>
                            </View>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentGreen} />
                                </View>
                                <Text style={modalStyles.virtueText}>Protector of the Holy Family</Text>
                            </View>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentGreen} />
                                </View>
                                <Text style={modalStyles.virtueText}>Model of fatherhood</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// --- MODAL: MISSION VISION ---
const MissionVisionModal = ({ isVisible, onClose }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '90%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <View style={modalStyles.titleContainer}>
                        <Ionicons name="business" size={24} color="#fff" />
                        <Text style={modalStyles.modalTitle}>Mission & Vision</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    {/* MISSION SECTION */}
                    <View style={modalStyles.missionVisionCard}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryLight]}
                            style={modalStyles.cardHeader}
                        >
                            <Ionicons name="rocket" size={20} color="#fff" />
                            <Text style={modalStyles.cardTitle}>MISSION OF THE PARISH</Text>
                        </LinearGradient>
                        <View style={modalStyles.missionContent}>
                            {missionVisionData.mission.map((item, index) => (
                                <View key={index} style={modalStyles.missionItem}>
                                    <LinearGradient
                                        colors={[Colors.primary, Colors.primaryLight]}
                                        style={modalStyles.missionNumber}
                                    >
                                        <Text style={modalStyles.missionNumberText}>{index + 1}</Text>
                                    </LinearGradient>
                                    <Text style={modalStyles.missionText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* VISION SECTION */}
                    <View style={modalStyles.missionVisionCard}>
                        <LinearGradient
                            colors={[Colors.secondary, Colors.secondaryLight]}
                            style={modalStyles.cardHeader}
                        >
                            <Ionicons name="eye" size={20} color={Colors.primary} />
                            <Text style={modalStyles.cardTitle}>VISION OF THE PARISH</Text>
                        </LinearGradient>
                        <View style={modalStyles.visionContent}>
                            <Text style={modalStyles.visionText}>{missionVisionData.vision}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// --- MODAL: BAPTISM REMINDERS ---
const BaptismRemindersModal = ({ isVisible, onClose }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '90%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <View style={modalStyles.titleContainer}>
                        <FontAwesome5 name="water" size={24} color="#fff" />
                        <Text style={modalStyles.modalTitle}>Baptism Guidelines</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <Text style={modalStyles.reminderNote}>BASAHIN PONG MABUTI</Text>
                    
                    {/* BAPTISM SCHEDULES */}
                    <View style={modalStyles.scheduleSection}>
                        <Text style={modalStyles.scheduleTitle}>BAPTISM SCHEDULES</Text>
                        
                        <View style={modalStyles.scheduleCard}>
                            <View style={modalStyles.scheduleHeader}>
                                <Ionicons name="person" size={20} color={Colors.primary} />
                                <Text style={modalStyles.scheduleType}>SOLO BAPTISM</Text>
                            </View>
                            <Text style={modalStyles.scheduleDays}>{baptismReminders.schedules.solo.days}</Text>
                            <View style={modalStyles.feeContainer}>
                                <Text style={modalStyles.feeLabel}>Fee:</Text>
                                <Text style={modalStyles.feeAmount}>{baptismReminders.schedules.solo.fee}</Text>
                            </View>
                            <Text style={modalStyles.timeLabel}>Available Times:</Text>
                            <View style={modalStyles.timeGrid}>
                                {baptismReminders.schedules.solo.times.map((time, index) => (
                                    <View key={index} style={modalStyles.timeChip}>
                                        <Text style={modalStyles.timeText}>{time}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={modalStyles.scheduleCard}>
                            <View style={modalStyles.scheduleHeader}>
                                <Ionicons name="people" size={20} color={Colors.secondary} />
                                <Text style={modalStyles.scheduleType}>COMMON BAPTISM</Text>
                            </View>
                            <Text style={modalStyles.scheduleDays}>{baptismReminders.schedules.common.days}</Text>
                            <View style={modalStyles.feeContainer}>
                                <Text style={modalStyles.feeLabel}>Fee:</Text>
                                <Text style={modalStyles.feeAmount}>{baptismReminders.schedules.common.fee}</Text>
                            </View>
                        </View>
                    </View>

                    {/* REQUIREMENTS */}
                    <View style={modalStyles.requirementsSection}>
                        <Text style={modalStyles.requirementsTitle}>REQUIREMENTS</Text>
                        {baptismReminders.requirements.map((requirement, index) => (
                            <View key={index} style={modalStyles.requirementItem}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryLight]}
                                    style={modalStyles.requirementBullet}
                                >
                                    <Text style={modalStyles.requirementNumber}>{index + 1}</Text>
                                </LinearGradient>
                                <Text style={modalStyles.requirementText}>{requirement}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// --- MODAL: FORM REMINDERS ---
const FormRemindersModal = ({ isVisible, onClose }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '85%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <View style={modalStyles.titleContainer}>
                        <Ionicons name="document-text" size={24} color="#fff" />
                        <Text style={modalStyles.modalTitle}>Form Guidelines</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.remindersContainer}>
                        <LinearGradient
                            colors={[Colors.lightGold, '#fef7cd']}
                            style={modalStyles.importantNotice}
                        >
                            <Ionicons name="warning" size={20} color={Colors.secondaryDark} />
                            <Text style={modalStyles.importantNoticeText}>MGA MAHALAGANG PAALALA</Text>
                        </LinearGradient>
                        
                        {formReminders.map((reminder, index) => (
                            <View key={index} style={modalStyles.reminderItem}>
                                <View style={modalStyles.reminderIcon}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentGreen} />
                                </View>
                                <Text style={modalStyles.reminderText}>{reminder}</Text>
                            </View>
                        ))}
                    </View>

                    {/* GENERAL REMINDERS */}
                    <View style={modalStyles.generalReminders}>
                        <Text style={modalStyles.generalRemindersTitle}>GENERAL REMINDERS</Text>
                        {generalReminders.map((reminder, index) => (
                            <View key={index} style={modalStyles.generalReminderItem}>
                                <View style={modalStyles.generalReminderBullet} />
                                <Text style={modalStyles.generalReminderText}>{reminder}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

const HomeScreen = ({ navigation }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVerseModalVisible, setVerseModalVisible] = useState(false);
    const [isSaintJosephModalVisible, setSaintJosephModalVisible] = useState(false);
    const [isMissionVisionModalVisible, setMissionVisionModalVisible] = useState(false);
    const [isBaptismRemindersModalVisible, setBaptismRemindersModalVisible] = useState(false);
    const [isFormRemindersModalVisible, setFormRemindersModalVisible] = useState(false);
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    // LOAD NOTIFICATIONS
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const mockNotifications = [
                    { id: 'n1', title: 'New Mass Schedule', read: false },
                    { id: 'n2', title: 'Advisory: Office Closed', read: true },
                    { id: 'n3', title: 'Feast Day Announcement', read: false },
                ];
                
                setNotifications(mockNotifications);
                const unread = mockNotifications.filter(n => !n.read).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        };
        
        loadNotifications();
    }, []);

    // AUTOMATIC SWIPE LOGIC
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prevIndex => {
                const newIndex = (prevIndex + 1) % parishImages.length;
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: newIndex,
                        animated: true,
                    });
                }
                return newIndex;
            });
        }, AUTOSWIPE_INTERVAL);

        return () => clearInterval(interval);
    }, [parishImages.length]);

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const handleScrollEnd = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / width);
        setActiveIndex(index);
    };

    const handleSocialMediaPress = (url) => {
        Linking.openURL(url).catch(err => 
            Alert.alert('Error', 'Cannot open link. Please check your connection.')
        );
    };

    // Card Component for Schedules
    const ScheduleCard = ({ item }) => (
        <View style={[
            styles.scheduleCard,
            item.type === 'special' && styles.specialCard,
            item.type === 'sunday' && styles.sundayCard
        ]}>
            <View style={styles.scheduleHeader}>
                <LinearGradient
                    colors={item.type === 'special' ? 
                        [Colors.secondary, Colors.secondaryLight] : 
                        item.type === 'sunday' ? 
                        [Colors.primaryLight, Colors.accentGreen] : 
                        [Colors.primary, Colors.primaryLight]
                    }
                    style={styles.dayBadge}
                >
                    <Text style={styles.dayBadgeText}>{item.day}</Text>
                </LinearGradient>
                {item.type === 'special' && (
                    <View style={styles.featuredBadge}>
                        <Ionicons name="star" size={12} color={Colors.cardBackground} />
                    </View>
                )}
            </View>
            
            <View style={styles.scheduleTimes}>
                {item.time.map((time, index) => (
                    <View key={index} style={styles.timeItem}>
                        <Ionicons name="time" size={16} color={Colors.secondary} />
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                ))}
            </View>
            
            <View style={styles.scheduleFooter}>
                <Ionicons 
                    name={item.type === 'anticipated' ? "flash" : item.type === 'sunday' ? "sunny" : "calendar"} 
                    size={14} 
                    color={Colors.textLight} 
                />
                <Text style={styles.scheduleType}>
                    {item.type === 'special' ? 'Special Mass' : 
                     item.type === 'anticipated' ? 'Anticipated Mass' : 
                     item.type === 'sunday' ? 'Sunday Mass' : 'Regular Mass'}
                </Text>
            </View>
        </View>
    );

    const renderParishImage = ({ item }) => (
        <View style={styles.carouselItem}>
            <Image
                source={item.image}
                style={styles.carouselImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
            />
            <View style={styles.imageCaption}>
                <Text style={styles.imageCaptionTitle}>{item.title}</Text>
                <Text style={styles.imageCaptionSubtitle}>{item.caption}</Text>
            </View>
        </View>
    );

    const renderIndicatorDots = () => (
        <View style={styles.dotContainer}>
            {parishImages.map((_, index) => {
                const inputRange = [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                ];

                const dotScale = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.8, 1.2, 0.8],
                    extrapolate: 'clamp',
                });

                const dotOpacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.4, 1, 0.4],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                transform: [{ scale: dotScale }],
                                opacity: dotOpacity,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );

    const QuickActionButton = ({ icon, title, subtitle, color, onPress, iconType = 'ionicons' }) => (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <LinearGradient
                colors={[color, Colors.primaryLight]}
                style={styles.quickActionIcon}
            >
                {iconType === 'fontawesome' ? (
                    <FontAwesome5 name={icon} size={isSmallDevice ? 18 : 20} color={Colors.cardBackground} />
                ) : (
                    <Ionicons name={icon} size={isSmallDevice ? 20 : 22} color={Colors.cardBackground} />
                )}
            </LinearGradient>
            <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{title}</Text>
                <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={isSmallDevice ? 18 : 20} color={Colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* MODALS */}
            <BibleVerseModal isVisible={isVerseModalVisible} onClose={() => setVerseModalVisible(false)} />
            <SaintJosephModal isVisible={isSaintJosephModalVisible} onClose={() => setSaintJosephModalVisible(false)} />
            <MissionVisionModal isVisible={isMissionVisionModalVisible} onClose={() => setMissionVisionModalVisible(false)} />
            <BaptismRemindersModal isVisible={isBaptismRemindersModalVisible} onClose={() => setBaptismRemindersModalVisible(false)} />
            <FormRemindersModal isVisible={isFormRemindersModalVisible} onClose={() => setFormRemindersModalVisible(false)} />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* ENHANCED HEADER WITH GRADIENT */}
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight, Colors.primaryDark]}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerMain}>
                        <View style={styles.headerText}>
                            <Text style={styles.greeting}>Welcome to</Text>
                            <Text style={styles.parishName}>San Jose Manggagawa Parish</Text>
                            <Text style={styles.location}>Rodriguez, Rizal</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('NotificationScreen')}>
                            <LinearGradient
                                colors={[Colors.secondary, Colors.secondaryLight]}
                                style={styles.notificationIcon}
                            >
                                <Ionicons name="notifications" size={isSmallDevice ? 20 : 22} color={Colors.primary} />
                                {unreadCount > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.badgeText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* CAROUSEL */}
                <View style={styles.carouselSection}>
                    <FlatList
                        ref={flatListRef}
                        data={parishImages}
                        renderItem={renderParishImage}
                        keyExtractor={item => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        onMomentumScrollEnd={handleScrollEnd}
                        scrollEventThrottle={16}
                    />
                    {renderIndicatorDots()}
                </View>

                {/* QUICK ACTIONS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Access</Text>
                        <Text style={styles.sectionSubtitle}>Essential parish information</Text>
                    </View>
                    
                    <View style={styles.quickActionsGrid}>
                        <QuickActionButton
                            icon="book"
                            title="Daily Verse"
                            subtitle="Today's scripture"
                            color={Colors.accentGreen}
                            onPress={() => setVerseModalVisible(true)}
                        />
                        <QuickActionButton
                            icon="hammer"
                            title="St. Joseph"
                            subtitle="Our patron saint"
                            color={Colors.secondary}
                            onPress={() => setSaintJosephModalVisible(true)}
                            iconType="fontawesome"
                        />
                        <QuickActionButton
                            icon="business"
                            title="Mission & Vision"
                            subtitle="Parish mission"
                            color={Colors.primary}
                            onPress={() => setMissionVisionModalVisible(true)}
                        />
                        <QuickActionButton
                            icon="water"
                            title="Baptism Guide"
                            subtitle="Requirements & schedules"
                            color={Colors.accentBlue}
                            onPress={() => setBaptismRemindersModalVisible(true)}
                            iconType="fontawesome"
                        />
                        <QuickActionButton
                            icon="document-text"
                            title="Form Guidelines"
                            subtitle="Mga paalala sa form"
                            color={Colors.accentPurple}
                            onPress={() => setFormRemindersModalVisible(true)}
                        />
                        <QuickActionButton
                            icon="location"
                            title="Location"
                            subtitle="Find our parish"
                            color={Colors.success}
                            onPress={() => navigation.navigate('Map')}
                        />
                    </View>
                </View>

                {/* MASS SCHEDULES */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Mass Schedules</Text>
                            <Text style={styles.sectionSubtitle}>Weekly liturgical services</Text>
                        </View>
                    </View>
                    
                    <FlatList
                        data={massSchedules}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => <ScheduleCard item={item} />}
                        contentContainerStyle={styles.schedulesContainer}
                    />
                </View>

                {/* SOCIAL MEDIA - FACEBOOK ONLY */}
                <View style={[styles.section, styles.socialSection]}>
                    <Text style={styles.sectionTitle}>Connect With Us</Text>
                    <Text style={styles.sectionSubtitle}>Follow our Facebook page</Text>
                    
                    <View style={styles.socialContainer}>
                        <TouchableOpacity 
                            style={[styles.socialButton, { backgroundColor: Colors.facebook }]}
                            onPress={() => handleSocialMediaPress(socialMediaLinks.facebook)}
                        >
                            <FontAwesome5 name="facebook-f" size={isSmallDevice ? 16 : 18} color={Colors.cardBackground} />
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* BOTTOM SPACER */}
                <View style={{ height: isSmallDevice ? 80 : 100 }} />
            </ScrollView>

            {/* ENHANCED BOTTOM NAVIGATION */}
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
                style={styles.bottomNav}
            >
                <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight]}
                        style={styles.activeNavIcon}
                    >
                        <Ionicons name="home" size={isSmallDevice ? 20 : 22} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.navTextActive}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyRequests')}>
                    <View style={styles.navIcon}>
                        <Ionicons name="grid" size={isSmallDevice ? 20 : 22} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.navText}>Services</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.navIcon}>
                        <Ionicons name="person" size={isSmallDevice ? 20 : 22} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
};

// 🎨 RESPONSIVE STYLES
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    // ENHANCED HEADER WITH GRADIENT
    header: {
        paddingHorizontal: isSmallDevice ? 20 : 24,
        paddingTop: height > 800 ? 50 : (isSmallDevice ? 30 : 40),
        paddingBottom: isSmallDevice ? 25 : 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    headerMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerText: {
        flex: 1,
    },
    greeting: {
        fontSize: isSmallDevice ? 14 : 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        marginBottom: 4,
    },
    parishName: {
        fontSize: isSmallDevice ? 22 : 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 2,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    location: {
        fontSize: isSmallDevice ? 14 : 16,
        color: Colors.secondaryLight,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    notificationBtn: {
        padding: 4,
    },
    notificationIcon: {
        width: isSmallDevice ? 45 : 50,
        height: isSmallDevice ? 45 : 50,
        borderRadius: isSmallDevice ? 22 : 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    badgeText: {
        color: Colors.cardBackground,
        fontSize: 10,
        fontWeight: 'bold',
    },
    // CAROUSEL
    carouselSection: {
        marginBottom: 10,
    },
    carouselItem: {
        width: width,
        height: isSmallDevice ? 200 : 250,
        position: 'relative',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    imageCaption: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isSmallDevice ? 16 : 24,
    },
    imageCaptionTitle: {
        fontSize: isSmallDevice ? 18 : 24,
        fontWeight: '800',
        color: Colors.cardBackground,
        marginBottom: 4,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    imageCaptionSubtitle: {
        fontSize: isSmallDevice ? 14 : 16,
        color: Colors.secondaryLight,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginHorizontal: 4,
    },
    // SECTIONS
    section: {
        paddingHorizontal: isSmallDevice ? 16 : 24,
        marginBottom: isSmallDevice ? 20 : 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: isSmallDevice ? 15 : 20,
    },
    sectionTitle: {
        fontSize: isSmallDevice ? 20 : 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: isSmallDevice ? 12 : 14,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: 4,
    },
    // QUICK ACTIONS
    quickActionsGrid: {
        backgroundColor: Colors.cardBackground,
        borderRadius: isSmallDevice ? 16 : 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: isSmallDevice ? 12 : 16,
        borderRadius: isSmallDevice ? 12 : 16,
        marginBottom: 8,
        backgroundColor: Colors.cardBackground,
    },
    quickActionIcon: {
        width: isSmallDevice ? 45 : 50,
        height: isSmallDevice ? 45 : 50,
        borderRadius: isSmallDevice ? 12 : 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    quickActionContent: {
        flex: 1,
    },
    quickActionTitle: {
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    quickActionSubtitle: {
        fontSize: isSmallDevice ? 11 : 13,
        color: Colors.textSecondary,
        fontWeight: '400',
    },
    // MASS SCHEDULES
    schedulesContainer: {
        paddingRight: isSmallDevice ? 16 : 24,
    },
    scheduleCard: {
        width: isSmallDevice ? 160 : 180,
        backgroundColor: Colors.cardBackground,
        borderRadius: isSmallDevice ? 16 : 20,
        padding: isSmallDevice ? 16 : 20,
        marginRight: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    specialCard: {
        backgroundColor: Colors.lightGold,
        borderColor: Colors.secondaryLight,
    },
    sundayCard: {
        backgroundColor: Colors.lightBlue,
        borderColor: Colors.primaryLight,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isSmallDevice ? 12 : 16,
    },
    dayBadge: {
        paddingHorizontal: isSmallDevice ? 10 : 12,
        paddingVertical: isSmallDevice ? 5 : 6,
        borderRadius: isSmallDevice ? 10 : 12,
    },
    dayBadgeText: {
        color: Colors.cardBackground,
        fontSize: isSmallDevice ? 10 : 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    featuredBadge: {
        backgroundColor: Colors.secondary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleTimes: {
        marginBottom: isSmallDevice ? 12 : 16,
    },
    timeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    timeText: {
        marginLeft: 6,
        fontSize: isSmallDevice ? 12 : 14,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    scheduleFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    scheduleType: {
        marginLeft: 6,
        fontSize: isSmallDevice ? 10 : 12,
        color: Colors.textLight,
        fontWeight: '500',
    },
    // SOCIAL MEDIA - FACEBOOK ONLY
    socialSection: {
        marginBottom: 80,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isSmallDevice ? 14 : 16,
        paddingHorizontal: isSmallDevice ? 20 : 24,
        borderRadius: isSmallDevice ? 14 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        minWidth: isSmallDevice ? 140 : 160,
    },
    socialButtonText: {
        marginLeft: 8,
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '700',
        color: Colors.cardBackground,
        letterSpacing: 0.3,
    },
    // ENHANCED BOTTOM NAVIGATION
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.cardBackground,
        paddingVertical: isSmallDevice ? 8 : 12,
        paddingBottom: isSmallDevice ? 15 : 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
    activeNavIcon: {
        width: isSmallDevice ? 45 : 50,
        height: isSmallDevice ? 45 : 50,
        borderRadius: isSmallDevice ? 22 : 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    navText: {
        fontSize: isSmallDevice ? 10 : 12,
        color: Colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    navTextActive: {
        fontSize: isSmallDevice ? 10 : 12,
        color: Colors.primary,
        marginTop: 2,
        fontWeight: '700',
    },
});

// 🎨 MODAL STYLES (Same as before but responsive)
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalView: {
        width: '90%',
        backgroundColor: Colors.cardBackground,
        borderRadius: 25,
        overflow: 'hidden',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: isSmallDevice ? 20 : 24,
        paddingBottom: isSmallDevice ? 16 : 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: isSmallDevice ? 20 : 22,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 12,
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    gradientButton: {
        paddingVertical: isSmallDevice ? 14 : 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        width: '100%',
    },
    // ... (rest of modal styles remain the same, just make sure to use isSmallDevice for responsive sizing)
});

export default HomeScreen;
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

// Social Media Links
const socialMediaLinks = {  
    facebook: 'https://www.facebook.com/sjmpmontalban',
    instagram: 'https://instagram.com/sanjosemanggagawa',
    youtube: 'https://youtube.com/c/SanJoseManggagawaParish',
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
    { id: 'p1', image: church6, caption: 'Main Church', title: 'San Jose Manggagawa Parish' },
    { id: 'p2', image: annointing, caption: 'Sacraments', title: 'San Jose Manggagawa Parish' },
    { id: 'p3', image: baptism, caption: 'Baptismal Area', title: 'San Jose Manggagawa Parish' },
    { id: 'p4', image: confession, caption: 'Confession Room', title: 'San Jose Manggagawa Parish' },
    { id: 'p5', image: confirmation, caption: 'Confirmation', title: 'San Jose Manggagawa Parish' },
    { id: 'p6', image: eucharist, caption: 'Holy Mass', title: 'San Jose Manggagawa Parish' },
];

const { width, height } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = width - 40;
const AUTOSWIPE_INTERVAL = 5000;

// --- SUPER GALACTIC COLOR PALETTE ---
const Colors = {
    primary: '#25a165ff',           // Rich Royal Blue
    primaryLight: '#3b82f6',      // Bright Blue
    primaryDark: '#1e40af',       // Dark Blue
    secondary: '#d97706',         // Warm Amber
    secondaryLight: '#f59e0b',    // Golden Yellow
    secondaryDark: '#b45309',     // Dark Amber
    background: '#f8fafc',        // Clean White/Light Gray
    cardBackground: '#ffffff',    // Pure White
    textPrimary: '#1e293b',       // Deep Navy
    textSecondary: '#64748b',     // Slate Gray
    textLight: '#94a3b8',         // Light Slate
    accentGreen: '#059669',       // Emerald Green
    accentBlue: '#2563eb',        // Cobalt Blue
    accentPurple: '#7c3aed',      // Purple
    lightGreen: '#dcfce7',        // Mint Green
    lightGold: '#fef3c7',         // Light Amber
    lightBlue: '#dbeafe',         // Light Blue
    lightPurple: '#ede9fe',       // Light Purple
    facebook: '#1877F2',
    instagram: '#E4405F',
    youtube: '#FF0000',
    border: '#e2e8f0',            // Subtle Border
    error: '#ef4444',             // Red for errors/badges
    success: '#10b981',           // Green for success
};

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
                    <View style={modalStyles.modalHeader}>
                        <View style={modalStyles.titleContainer}>
                            <Ionicons name="book" size={24} color={Colors.primary} />
                            <Text style={modalStyles.modalTitle}>Daily Scripture</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={modalStyles.verseContainer}>
                        <View style={modalStyles.verseIconContainer}>
                            <Ionicons name="quote" size={32} color={Colors.secondary} />
                        </View>
                        <Text style={modalStyles.verseText}>"{dailyVerse.verse}"</Text>
                        <View style={modalStyles.referenceContainer}>
                            <View style={modalStyles.referenceLine} />
                            <Text style={modalStyles.verseReference}>{dailyVerse.reference}</Text>
                            <View style={modalStyles.referenceLine} />
                        </View>
                    </View>
                    
                    <TouchableOpacity style={modalStyles.actionButton} onPress={onClose}>
                        <Text style={modalStyles.actionButtonText}>Amen</Text>
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
                <View style={modalStyles.modalHeader}>
                    <View style={modalStyles.titleContainer}>
                        <FontAwesome5 name="hammer" size={24} color={Colors.primary} />
                        <Text style={modalStyles.modalTitle}>Saint Joseph</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.saintHeader}>
                        <View style={modalStyles.saintBadge}>
                            <FontAwesome5 name="cross" size={20} color={Colors.cardBackground} />
                        </View>
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
                <View style={modalStyles.modalHeader}>
                    <View style={modalStyles.titleContainer}>
                        <Ionicons name="business" size={24} color={Colors.primary} />
                        <Text style={modalStyles.modalTitle}>Mission & Vision</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    {/* MISSION SECTION */}
                    <View style={modalStyles.missionVisionCard}>
                        <View style={[modalStyles.cardHeader, { backgroundColor: Colors.primary }]}>
                            <Ionicons name="rocket" size={20} color={Colors.cardBackground} />
                            <Text style={modalStyles.cardTitle}>MISSION OF THE PARISH</Text>
                        </View>
                        <View style={modalStyles.missionContent}>
                            {missionVisionData.mission.map((item, index) => (
                                <View key={index} style={modalStyles.missionItem}>
                                    <View style={modalStyles.missionNumber}>
                                        <Text style={modalStyles.missionNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={modalStyles.missionText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* VISION SECTION */}
                    <View style={modalStyles.missionVisionCard}>
                        <View style={[modalStyles.cardHeader, { backgroundColor: Colors.secondary }]}>
                            <Ionicons name="eye" size={20} color={Colors.cardBackground} />
                            <Text style={modalStyles.cardTitle}>VISION OF THE PARISH</Text>
                        </View>
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
                <View style={modalStyles.modalHeader}>
                    <View style={modalStyles.titleContainer}>
                        <FontAwesome5 name="water" size={24} color={Colors.primary} />
                        <Text style={modalStyles.modalTitle}>Baptism Guidelines</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                
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
                                <View style={modalStyles.requirementBullet}>
                                    <Text style={modalStyles.requirementNumber}>{index + 1}</Text>
                                </View>
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
                <View style={modalStyles.modalHeader}>
                    <View style={modalStyles.titleContainer}>
                        <Ionicons name="document-text" size={24} color={Colors.primary} />
                        <Text style={modalStyles.modalTitle}>Form Guidelines</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.remindersContainer}>
                        <View style={modalStyles.importantNotice}>
                            <Ionicons name="warning" size={20} color={Colors.secondary} />
                            <Text style={modalStyles.importantNoticeText}>MGA MAHALAGANG PAALALA</Text>
                        </View>
                        
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
                <View style={[
                    styles.dayBadge,
                    item.type === 'special' && styles.specialBadge,
                    item.type === 'sunday' && styles.sundayBadge
                ]}>
                    <Text style={styles.dayBadgeText}>{item.day}</Text>
                </View>
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
            <View style={styles.imageOverlay} />
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
            <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
                {iconType === 'fontawesome' ? (
                    <FontAwesome5 name={icon} size={20} color={Colors.cardBackground} />
                ) : (
                    <Ionicons name={icon} size={22} color={Colors.cardBackground} />
                )}
            </View>
            <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{title}</Text>
                <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
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
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerMain}>
                        <View style={styles.headerText}>
                            <Text style={styles.greeting}>Welcome to</Text>
                            <Text style={styles.parishName}>San Jose Manggagawa Parish</Text>
                            <Text style={styles.location}>Rodriguez, Rizal</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('NotificationScreen')}>
                            <Ionicons name="notifications" size={26} color={Colors.primary} />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

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
                        <TouchableOpacity style={styles.viewAllBtn}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                        </TouchableOpacity>
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

                {/* SOCIAL MEDIA */}
                <View style={[styles.section, styles.socialSection]}>
                    <Text style={styles.sectionTitle}>Connect With Us</Text>
                    <Text style={styles.sectionSubtitle}>Follow our social media channels</Text>
                    
                    <View style={styles.socialContainer}>
                        <TouchableOpacity 
                            style={[styles.socialButton, { backgroundColor: Colors.facebook }]}
                            onPress={() => handleSocialMediaPress(socialMediaLinks.facebook)}
                        >
                            <FontAwesome5 name="facebook-f" size={18} color={Colors.cardBackground} />
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.socialButton, { backgroundColor: Colors.instagram }]}
                            onPress={() => handleSocialMediaPress(socialMediaLinks.instagram)}
                        >
                            <FontAwesome5 name="instagram" size={18} color={Colors.cardBackground} />
                            <Text style={styles.socialButtonText}>Instagram</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.socialButton, { backgroundColor: Colors.youtube }]}
                            onPress={() => handleSocialMediaPress(socialMediaLinks.youtube)}
                        >
                            <FontAwesome5 name="youtube" size={18} color={Colors.cardBackground} />
                            <Text style={styles.socialButtonText}>YouTube</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                    <View style={styles.navIconActive}>
                        <Ionicons name="home" size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.navTextActive}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyRequests')}>
                    <View style={styles.navIcon}>
                        <Ionicons name="calendar" size={24} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.navText}>Dashboard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.navIcon}>
                        <Ionicons name="person" size={24} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// --- SUPER GALACTIC MODAL STYLES ---
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
        borderRadius: 20,
        padding: 0,
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
        padding: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginLeft: 12,
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: Colors.background,
    },
    // Bible Verse Modal
    verseContainer: {
        padding: 32,
        alignItems: 'center',
        width: '100%',
    },
    verseIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.lightGold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    verseText: {
        fontSize: 18,
        lineHeight: 28,
        fontStyle: 'italic',
        color: Colors.textPrimary,
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 20,
    },
    referenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    referenceLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    verseReference: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondary,
        marginHorizontal: 16,
    },
    actionButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 16,
    },
    actionButtonText: {
        color: Colors.cardBackground,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    // Saint Joseph Modal
    saintHeader: {
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    saintBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    saintSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    saintSection: {
        padding: 24,
        paddingBottom: 0,
        width: '100%',
    },
    saintTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    saintText: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.textSecondary,
        fontWeight: '400',
    },
    virtueList: {
        marginTop: 16,
    },
    virtueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: Colors.background,
        borderRadius: 12,
    },
    virtueIcon: {
        marginRight: 12,
    },
    virtueText: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
        flex: 1,
    },
    // Mission Vision Modal
    missionVisionCard: {
        margin: 20,
        marginBottom: 0,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.cardBackground,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.cardBackground,
        marginLeft: 12,
        letterSpacing: 0.5,
    },
    missionContent: {
        padding: 20,
    },
    missionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    missionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        flexShrink: 0,
    },
    missionNumberText: {
        color: Colors.cardBackground,
        fontSize: 14,
        fontWeight: '700',
    },
    missionText: {
        fontSize: 14,
        lineHeight: 20,
        color: Colors.textPrimary,
        fontWeight: '500',
        flex: 1,
    },
    visionContent: {
        padding: 20,
    },
    visionText: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textPrimary,
        fontWeight: '500',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    // Baptism Reminders Modal
    reminderNote: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
        letterSpacing: 0.5,
    },
    scheduleSection: {
        padding: 20,
        paddingTop: 0,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    scheduleCard: {
        backgroundColor: Colors.background,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    scheduleType: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginLeft: 8,
    },
    scheduleDays: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginBottom: 8,
    },
    feeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    feeLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginRight: 8,
    },
    feeAmount: {
        fontSize: 16,
        color: Colors.secondary,
        fontWeight: '700',
    },
    timeLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginBottom: 8,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeChip: {
        backgroundColor: Colors.lightBlue,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    timeText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    requirementsSection: {
        padding: 20,
        paddingTop: 0,
    },
    requirementsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        padding: 12,
        backgroundColor: Colors.background,
        borderRadius: 8,
    },
    requirementBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.accentBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    requirementNumber: {
        color: Colors.cardBackground,
        fontSize: 12,
        fontWeight: '700',
    },
    requirementText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '500',
        flex: 1,
        lineHeight: 20,
    },
    // Form Reminders Modal
    remindersContainer: {
        padding: 20,
        paddingTop: 0,
    },
    importantNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightGold,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    importantNoticeText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.secondaryDark,
        marginLeft: 8,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        padding: 16,
        backgroundColor: Colors.lightPurple,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.accentPurple,
    },
    reminderIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    reminderText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '500',
        flex: 1,
        lineHeight: 20,
    },
    generalReminders: {
        padding: 20,
        paddingTop: 0,
    },
    generalRemindersTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    generalReminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingLeft: 8,
    },
    generalReminderBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.textSecondary,
        marginRight: 12,
        marginTop: 8,
        flexShrink: 0,
    },
    generalReminderText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '400',
        flex: 1,
        lineHeight: 20,
    },
});

// --- SUPER GALACTIC MAIN STYLES ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    // HEADER
    header: {
        backgroundColor: Colors.cardBackground,
        paddingHorizontal: 24,
        paddingTop: 20,
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
        alignItems: 'flex-start',
    },
    headerText: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    parishName: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    location: {
        fontSize: 16,
        color: Colors.secondary,
        fontWeight: '600',
    },
    notificationBtn: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: Colors.lightBlue,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.cardBackground,
    },
    badgeText: {
        color: Colors.cardBackground,
        fontSize: 12,
        fontWeight: 'bold',
    },
    // CAROUSEL
    carouselSection: {
        marginBottom: 10,
    },
    carouselItem: {
        width: width,
        height: 250,
        position: 'relative',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    imageCaption: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    imageCaptionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.cardBackground,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    imageCaptionSubtitle: {
        fontSize: 16,
        color: Colors.secondaryLight,
        fontWeight: '600',
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
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
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: 4,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    viewAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    // QUICK ACTIONS
    quickActionsGrid: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: Colors.cardBackground,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionContent: {
        flex: 1,
    },
    quickActionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    quickActionSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '400',
    },
    // MASS SCHEDULES
    schedulesContainer: {
        paddingRight: 24,
    },
    scheduleCard: {
        width: 180,
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        padding: 20,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
        marginBottom: 16,
    },
    dayBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    specialBadge: {
        backgroundColor: Colors.secondary,
    },
    sundayBadge: {
        backgroundColor: Colors.primaryLight,
    },
    dayBadgeText: {
        color: Colors.cardBackground,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    featuredBadge: {
        backgroundColor: Colors.secondary,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleTimes: {
        marginBottom: 16,
    },
    timeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    scheduleFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    scheduleType: {
        marginLeft: 8,
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '500',
    },
    // SOCIAL MEDIA
    socialSection: {
        marginBottom: 100,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    socialButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '700',
        color: Colors.cardBackground,
        letterSpacing: 0.3,
    },
    // BOTTOM NAVIGATION
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
        padding: 8,
        borderRadius: 12,
    },
    navText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    navTextActive: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 4,
        fontWeight: '700',
    },
});

export default HomeScreen;
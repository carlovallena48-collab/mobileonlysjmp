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
const AUTOSWIPE_INTERVAL = 5000;

// 🎨 GREEN THEME COLOR PALETTE
const Colors = {
    primary: "#166534",           // Deep Forest Green
    primaryLight: "#22c55e",      // Vibrant Green
    primaryDark: "#14532d",       // Dark Green
    secondary: "#eab308",         // Gold Accent
    secondaryLight: "#facc15",    // Light Gold
    background: "#f0fdf4",        // Very Light Green Background
    cardBackground: "#ffffff",    // White Cards
    textPrimary: "#1a5e1a",       // Green Text
    textSecondary: "#4b7c4b",     // Medium Green Text
    textLight: "#86b886",         // Light Green Text
    accentGreen: "#16a34a",       // Bright Green
    accentBlue: "#3b82f6",        // Blue
    accentPurple: "#8b5cf6",      // Purple
    lightGreen: "#dcfce7",        // Light Green
    lightGold: "#fefce8",         // Light Gold
    lightBlue: "#f0f9ff",         // Light Blue
    facebook: "#1877F2",
    border: "#d1fae5",
    error: "#ef4444",
    success: "#16a34a",
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

// Social Media Links
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

// Updated Image Data
const parishImages = [
    { id: 'p1', image: church6, caption: 'San Jose Manggagawa Parish' },
    { id: 'p2', image: annointing, caption: 'San Jose Manggagawa Parish' },
    { id: 'p3', image: baptism, caption: 'San Jose Manggagawa Parish' },
    { id: 'p4', image: confession, caption: 'San Jose Manggagawa Parish' },
    { id: 'p5', image: confirmation, caption: 'San Jose Manggagawa Parish' },
    { id: 'p6', image: eucharist, caption: 'San Jose Manggagawa Parish' },
];

// --- MASS SCHEDULES ---
const massSchedules = [
    { 
        id: 'ms1', 
        day: 'First Wednesday', 
        time: ['6:00 AM', '6:00 PM'], 
        type: 'special'
    },
    { 
        id: 'ms2', 
        day: 'First Friday', 
        time: ['6:00 AM', '6:00 PM'], 
        type: 'special'
    },
    { 
        id: 'ms3', 
        day: 'Weekdays', 
        time: ['6:00 PM'], 
        type: 'regular'
    },
    { 
        id: 'ms4', 
        day: 'Saturday', 
        time: ['6:00 PM'], 
        type: 'anticipated'
    },
    { 
        id: 'ms5', 
        day: 'Sunday', 
        time: ['6:00 AM', '7:30 AM', '9:00 AM', '5:00 PM', '6:30 PM'], 
        type: 'sunday'
    },
];

// --- MISSION VISION DATA ---
const missionVisionData = {
    mission: [
        "PATULOY NA PAGSASAGAWA NG MGA PAG-AARAL, PAGSASANAY AT PAGSASABUHAY NG SALITA NG DIYOS.",
        "PAGYAKAP AT PAGMAMAHAL SA EUKARISTIYA AT SA LAHAT NG MGA SAKRAMENTO.",
        "BUMUO NG PAMAYANAN NA MAY DEBOSYON, PAGKILALA AT PAGPAPAHALAGA SA MGA KATANGIAN NI MARIA AT NI SAN JOSE MANGGAGAWA.",
        "PAGSIKAPAN NA PAJSAWAKIN, PATATAGIN AT PASIGLAHIN ANG MUNTING SAMBAYANANG KRISTIYANO SA TULONG AT GABAY NG KURA PAROKO."
    ],
    vision: "PAGTATATAG NG PAMAYANAN NG DIYOS, NA TAPAT NA SUMUSUNOD SA MGA ARAL AT TURO NI HESUS UPANG MAGING ISANG SAMBAYANAN NA ANG PINANANALIGAN, PINAGKAKATIWALAAN, SINUSUNOD AT PINAGLILINGKURAN AY ANG TUNAY NA DIYOS, UPANG MAGING SAMBAYANAN NA ANG SENTRO NG LAHAT AY ANG DIYOS, AT MAKAPAMUHAY SA KABANALAN AYON SA KALOOBAN NG PANGINOON, SA TULONG NI MARIA, INA NG SIMBAHAN AT NI SAN JOSE MANGGAGAWA NA ATING PATRON"
};

// --- BAPTISM REMINDERS ---
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

// --- GENERAL REMINDERS ---
const generalReminders = [
    "ALL TRANSACTIONS MUST BE DONE AT THE PARISH OFFICE ONLY",
    "ALL TRANSACTIONS BEYOND 5:00 P.M. WILL NOT BE ENTERTAINED",
    "MASS INTENTIONS: TUESDAY-SATURDAY (8AM-12NN & 2PM-5PM), SUNDAY (8AM-12NN ONLY)",
    "MASS INTENTIONS BEYOND THESE TIMES WILL NOT BE INCLUDED",
    "PLEASE FOLLOW THE SAID OFFICE HOURS"
];

// --- FORM REMINDERS ---
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
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight]}
                        style={modalStyles.modalHeader}
                    >
                        <Ionicons name="book" size={24} color="#fff" />
                        <Text style={modalStyles.modalTitle}>Daily Scripture</Text>
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>
                    
                    <View style={modalStyles.verseContainer}>
                        <View style={modalStyles.verseIcon}>
                            <Ionicons name="quote" size={32} color={Colors.primary} />
                        </View>
                        <Text style={modalStyles.verseText}>"{dailyVerse.verse}"</Text>
                        <Text style={modalStyles.verseReference}>{dailyVerse.reference}</Text>
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
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '85%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <FontAwesome5 name="hammer" size={24} color="#fff" />
                    <Text style={modalStyles.modalTitle}>Saint Joseph</Text>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.saintContent}>
                        <View style={modalStyles.saintBadge}>
                            <Text style={modalStyles.saintSubtitle}>Patron Saint of Workers</Text>
                        </View>
                        
                        <Text style={modalStyles.saintTitle}>The Earthly Father of Jesus</Text>
                        <Text style={modalStyles.saintText}>
                            Saint Joseph was the husband of the Blessed Virgin Mary and the foster father of Jesus Christ. 
                            He is revered as the patron saint of workers, fathers, and the universal Church.
                        </Text>

                        <Text style={modalStyles.saintTitle}>As a Worker</Text>
                        <Text style={modalStyles.saintText}>
                            Joseph was a carpenter by trade, teaching Jesus the value of honest labor and dedication. 
                            He exemplifies the dignity of human work and serves as an inspiration to all workers.
                        </Text>

                        <Text style={modalStyles.saintTitle}>Virtues of Saint Joseph</Text>
                        <View style={modalStyles.virtueList}>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                </View>
                                <Text style={modalStyles.virtueText}>Obedience to God's will</Text>
                            </View>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                </View>
                                <Text style={modalStyles.virtueText}>Humility and silence</Text>
                            </View>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                </View>
                                <Text style={modalStyles.virtueText}>Protector of the Holy Family</Text>
                            </View>
                            <View style={modalStyles.virtueItem}>
                                <View style={modalStyles.virtueIcon}>
                                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
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
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '90%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <Ionicons name="business" size={24} color="#fff" />
                    <Text style={modalStyles.modalTitle}>Mission & Vision</Text>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.missionSection}>
                        <View style={modalStyles.sectionHeader}>
                            <Ionicons name="rocket" size={20} color={Colors.primary} />
                            <Text style={modalStyles.sectionTitle}>MISSION OF THE PARISH</Text>
                        </View>
                        {missionVisionData.mission.map((item, index) => (
                            <View key={index} style={modalStyles.missionItem}>
                                <View style={modalStyles.missionNumber}>
                                    <Text style={modalStyles.missionNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={modalStyles.missionText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={modalStyles.visionSection}>
                        <View style={modalStyles.sectionHeader}>
                            <Ionicons name="eye" size={20} color={Colors.primary} />
                            <Text style={modalStyles.sectionTitle}>VISION OF THE PARISH</Text>
                        </View>
                        <Text style={modalStyles.visionText}>{missionVisionData.vision}</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// --- MODAL: BAPTISM REMINDERS ---
const BaptismRemindersModal = ({ isVisible, onClose }) => (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '90%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <FontAwesome5 name="water" size={24} color="#fff" />
                    <Text style={modalStyles.modalTitle}>Baptism Guidelines</Text>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.reminderHeader}>
                        <Text style={modalStyles.reminderNote}>BASAHIN PONG MABUTI</Text>
                    </View>
                    
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
                                <Ionicons name="people" size={20} color={Colors.primary} />
                                <Text style={modalStyles.scheduleType}>COMMON BAPTISM</Text>
                            </View>
                            <Text style={modalStyles.scheduleDays}>{baptismReminders.schedules.common.days}</Text>
                            <View style={modalStyles.feeContainer}>
                                <Text style={modalStyles.feeLabel}>Fee:</Text>
                                <Text style={modalStyles.feeAmount}>{baptismReminders.schedules.common.fee}</Text>
                            </View>
                        </View>
                    </View>

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
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
        <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, { maxHeight: '85%' }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={modalStyles.modalHeader}
                >
                    <Ionicons name="document-text" size={24} color="#fff" />
                    <Text style={modalStyles.modalTitle}>Form Guidelines</Text>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
                
                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.remindersContainer}>
                        <View style={modalStyles.importantNotice}>
                            <Ionicons name="warning" size={20} color={Colors.primary} />
                            <Text style={modalStyles.importantNoticeText}>MGA MAHALAGANG PAALALA</Text>
                        </View>
                        
                        {formReminders.map((reminder, index) => (
                            <View key={index} style={modalStyles.reminderItem}>
                                <View style={modalStyles.reminderIcon}>
                                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                </View>
                                <Text style={modalStyles.reminderText}>{reminder}</Text>
                            </View>
                        ))}
                    </View>

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

    // ENHANCED ScheduleCard Component with Green Theme
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
                    <View style={styles.featuredTag}>
                        <Ionicons name="star" size={12} color="#fff" />
                    </View>
                )}
            </View>
            
            <View style={styles.timesContainer}>
                {item.time.map((time, index) => (
                    <View key={index} style={styles.timeRow}>
                        <View style={styles.timeDot} />
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
            <Image source={item.image} style={styles.carouselImage} resizeMode="cover" />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
            />
            <View style={styles.imageCaption}>
                <Text style={styles.captionText}>{item.caption}</Text>
            </View>
        </View>
    );

    const renderIndicatorDots = () => (
        <View style={styles.dotsContainer}>
            {parishImages.map((_, index) => {
                const inputRange = [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                ];

                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 20, 8],
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
                                width: dotWidth,
                                opacity: dotOpacity,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );

    // GREEN THEME QuickActionButton
    const QuickActionButton = ({ icon, title, subtitle, color, onPress, iconType = 'ionicons' }) => (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <LinearGradient
                colors={[color, Colors.primaryLight]}
                style={styles.actionIcon}
            >
                {iconType === 'fontawesome' ? (
                    <FontAwesome5 name={icon} size={18} color="#fff" />
                ) : (
                    <Ionicons name={icon} size={20} color="#fff" />
                )}
            </LinearGradient>
            <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{title}</Text>
                <Text style={styles.actionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
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

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* GREEN THEME HEADER */}
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerText}>
                            <Text style={styles.greeting}>Welcome to</Text>
                            <Text style={styles.parishName}>San Jose Manggagawa Parish</Text>
                            <Text style={styles.location}>Rodriguez, Rizal</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.notificationBtn}
                            onPress={() => navigation.navigate('NotificationScreen')}
                        >
                            <View style={styles.notificationIcon}>
                                <Ionicons name="notifications" size={24} color={Colors.primary} />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
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

                {/* QUICK ACTIONS GRID */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Access</Text>
                        <Text style={styles.sectionSubtitle}>Everything you need in one place</Text>
                    </View>
                    
                    <View style={styles.actionsGrid}>
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
                            subtitle="Important reminders"
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
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={massSchedules}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => <ScheduleCard item={item} />}
                        contentContainerStyle={styles.schedulesList}
                    />
                </View>

                {/* SOCIAL MEDIA */}
                <View style={styles.socialSection}>
                    <View style={styles.socialCard}>
                        <Text style={styles.socialTitle}>Connect With Us</Text>
                        <Text style={styles.socialSubtitle}>Follow our Facebook page for updates</Text>
                        <TouchableOpacity 
                            style={styles.facebookBtn}
                            onPress={() => handleSocialMediaPress(socialMediaLinks.facebook)}
                        >
                            <FontAwesome5 name="facebook" size={20} color="#fff" />
                            <Text style={styles.facebookText}>Follow on Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight]}
                        style={styles.navIconActive}
                    >
                        <Ionicons name="home" size={22} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.navTextActive}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyRequests')}>
                    <View style={styles.navIcon}>
                        <Ionicons name="grid-outline" size={22} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.navText}>Services</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.navIcon}>
                        <Ionicons name="person-outline" size={22} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// 🎨 GREEN THEME STYLES
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    // HEADER
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerText: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        marginBottom: 4,
    },
    parishName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 2,
    },
    location: {
        fontSize: 16,
        color: Colors.secondaryLight,
        fontWeight: '600',
    },
    notificationBtn: {
        padding: 8,
    },
    notificationIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    badge: {
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
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    // CAROUSEL
    carouselSection: {
        marginBottom: 24,
    },
    carouselItem: {
        width: width - 48,
        height: 200,
        marginHorizontal: 24,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.cardBackground,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
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
        padding: 20,
    },
    captionText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    dot: {
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        marginHorizontal: 2,
    },
    // SECTIONS
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    viewAllBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    viewAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    // QUICK ACTIONS
    actionsGrid: {
        paddingHorizontal: 20,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    // MASS SCHEDULES
    schedulesList: {
        paddingHorizontal: 20,
        paddingRight: 24,
    },
    scheduleCard: {
        width: 180,
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    specialCard: {
        backgroundColor: Colors.lightGold,
        borderColor: Colors.secondaryLight,
    },
    sundayCard: {
        backgroundColor: Colors.lightGreen,
        borderColor: Colors.primaryLight,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dayBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        flex: 1,
    },
    dayBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    featuredTag: {
        backgroundColor: Colors.secondary,
        padding: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    timesContainer: {
        marginBottom: 12,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    timeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 8,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    scheduleFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    scheduleType: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '500',
        marginLeft: 6,
    },
    // SOCIAL SECTION
    socialSection: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    socialCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    socialTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    socialSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    facebookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.facebook,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    facebookText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    bottomSpacer: {
        height: 80,
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
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    navIcon: {
        padding: 8,
    },
    navIconActive: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    navText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    navTextActive: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 2,
        fontWeight: '700',
    },
});

// 🎨 GREEN THEME MODAL STYLES
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
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        marginLeft: 12,
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    gradientButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Bible Verse Modal
    verseContainer: {
        padding: 24,
        alignItems: 'center',
    },
    verseIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    verseText: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 12,
    },
    verseReference: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    actionButton: {
        marginBottom: 20,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Saint Joseph Modal
    saintContent: {
        padding: 20,
    },
    saintBadge: {
        backgroundColor: Colors.lightGold,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    saintSubtitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    saintTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    saintText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    virtueList: {
        marginTop: 8,
    },
    virtueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    virtueIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    virtueText: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    // Mission Vision Modal
    missionSection: {
        padding: 20,
    },
    visionSection: {
        padding: 20,
        paddingTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginLeft: 8,
    },
    missionItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    missionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    missionNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    missionText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    visionText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    // Baptism Modal
    reminderHeader: {
        padding: 16,
        backgroundColor: Colors.lightGreen,
    },
    reminderNote: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
        textAlign: 'center',
    },
    scheduleSection: {
        padding: 20,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 16,
    },
    scheduleCard: {
        backgroundColor: Colors.lightGreen,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
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
        marginBottom: 8,
    },
    feeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    feeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginRight: 4,
    },
    feeAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeChip: {
        backgroundColor: Colors.cardBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    requirementsSection: {
        padding: 20,
    },
    requirementsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 16,
    },
    requirementItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    requirementBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    requirementNumber: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    requirementText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    // Form Reminders Modal
    remindersContainer: {
        padding: 20,
    },
    importantNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGold,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    importantNoticeText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginLeft: 8,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reminderIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 2,
    },
    reminderText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    generalReminders: {
        padding: 20,
        paddingTop: 0,
    },
    generalRemindersTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 16,
    },
    generalReminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    generalReminderBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginTop: 7,
        marginRight: 12,
    },
    generalReminderText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});

export default HomeScreen;
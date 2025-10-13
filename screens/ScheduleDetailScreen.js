import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Color palette
const Colors = {
    primary: '#4CAF50',
    primaryDark: '#1B5E20',
    background: '#E8F5EE',
    cardBackground: '#FFFFFF',
    textDark: '#212121',
    textMuted: '#757575',
    confirmed: '#4CAF50',
    pending: '#FF9800',
    cancelled: '#D32F2F',
    shadow: '#000000',
    separator: '#A5D6A7',
};

// Updated Detail Row Component
const DetailRow = ({ icon, label, value, showIfEmpty = false }) => {
    if (!value && value !== 0 && !showIfEmpty) {
        return null;
    }
    
    return (
        <View style={enhancedStyles.detailRow}>
            <Feather name={icon} size={20} color={Colors.primaryDark} style={enhancedStyles.detailIcon} />
            <View style={enhancedStyles.detailTextContainer}>
                <Text style={enhancedStyles.detailLabel}>{label}</Text>
                <Text style={enhancedStyles.detailValue}>{value || 'Not specified'}</Text>
            </View>
        </View>
    );
};

const EnhancedScheduleDetailScreen = ({ route }) => {
    const { scheduleData = {} } = route.params || {}; 

    // Debug: Check kung ano talaga ang laman ng scheduleData
    console.log('🔍 Schedule Data:', scheduleData);
    console.log('📊 Available fields:', Object.keys(scheduleData));
    console.log('🎯 Sacrament Type:', scheduleData.sacrament);

    // Extract ALL data from the scheduleData structure
    const fullData = scheduleData.fullData || {};
    const sacrament = scheduleData.sacrament || '';
    
    // Get ALL possible fields from the data
    const getAllFieldValues = () => {
        const allFields = {};
        
        // Combine all data sources
        const combinedData = { ...fullData, ...scheduleData };
        
        // Extract ALL fields recursively
        const extractFields = (obj, prefix = '') => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        extractFields(value, fullKey);
                    } else {
                        allFields[fullKey] = value;
                    }
                }
            }
        };
        
        extractFields(combinedData);
        return allFields;
    };

    const allFieldValues = getAllFieldValues();
    console.log('📋 ALL FIELD VALUES:', allFieldValues);

    // Get status and payment info
    const currentStatus = scheduleData.status || fullData.status || 'Pending';
    const paymentStatus = scheduleData.paymentStatus || fullData.paymentStatus;
    const paymentDate = scheduleData.paymentDate || fullData.paymentDate;
    const amount = scheduleData.amount || fullData.amount || fullData.fee || fullData.donation || fullData.reservationFee;

    // Get basic info - COMPREHENSIVE EXTRACTION
    const name = scheduleData.name || fullData.name || fullData.confirmandName || 
                fullData.nameOfDeceased || fullData.childName ||
                `${fullData.groomName || ''} & ${fullData.brideName || ''}`.trim() || 'Not specified';

    // Get ALL possible date fields
    const date = scheduleData.date || fullData.date || 
                fullData.baptismDate || fullData.kumpilDate || fullData.marriageDate || 
                fullData.communionDate || fullData.scheduleDate || fullData.displayDate ||
                fullData.dateOfWedding || fullData.interviewDate || fullData.seminarDate;

    // Get ALL possible time fields
    const time = scheduleData.time || fullData.time ||
                fullData.baptismTime || fullData.kumpilTime || fullData.marriageTime ||
                fullData.communionTime || fullData.scheduleTime || fullData.displayTime ||
                fullData.timeOfWedding || fullData.interviewTime || fullData.seminarTime;

    // Contact information
    const contact = fullData.contactNumber || fullData.phone || fullData.contact || 
                   fullData.groomCP || fullData.brideCP || fullData.contactNo;

    // Personal and Family Information
    const fatherName = fullData.fatherName || fullData.groomFatherName || fullData.brideFatherName;
    const motherName = fullData.motherName || fullData.groomMotherMaidenName || fullData.brideMotherMaidenName;
    const address = fullData.address || fullData.residence || fullData.currentAddress || 
                   fullData.groomResidence || fullData.brideResidence;

    // Baptism Specific
    const godparents = fullData.godparents || fullData.godfather || fullData.godmother;
    const birthDate = fullData.birthDate || fullData.birthday || fullData.groomDOB || fullData.brideDOB;
    const birthPlace = fullData.birthPlace || fullData.placeOfBirth || fullData.groomPOB || fullData.bridePOB;
    const baptismType = fullData.baptismType;
    const baptismChurch = fullData.baptismChurch;

    // Kumpil/Confirmation Specific
    const confirmationName = fullData.confirmationName;
    const sponsor = fullData.sponsor || fullData.godfatherName || fullData.godmotherName;
    const age = fullData.age || fullData.groomAge || fullData.brideAge;

    // Marriage Specific
    const brideName = fullData.brideName;
    const groomName = fullData.groomName;
    const brideParents = fullData.brideParents;
    const groomParents = fullData.groomParents;
    const balance = fullData.balance;
    const reservationFee = fullData.reservationFee;
    const interviewDate = fullData.interviewDate;
    const seminarDate = fullData.seminarDate;

    // Pamisa Specific
    const intention = fullData.intention;
    const names = fullData.names;
    const massSponsor = fullData.massSponsor;

    // Blessing Specific
    const blessingType = fullData.blessingType;
    const requestForDetails = fullData.requestForDetails;

    // Funeral Service Specific
    const nameOfDeceased = fullData.nameOfDeceased;
    const causeOfDeath = fullData.causeOfDeath;
    const placeOfBurial = fullData.placeOfBurialCemetery;
    const informant = fullData.informant;
    const relationship = fullData.relationship;
    const dateDied = fullData.dateDied;
    const receivedLastSacrament = fullData.receivedLastSacrament;

    // First Communion Specific
    const childName = fullData.childName;
    const parentsName = fullData.parentsName;

    // Holy Orders Specific
    const references = fullData.references;

    // Priest/Officiant
    const priest = fullData.priest || fullData.officiatingPriest;

    // Additional fields
    const requirements = fullData.requirements || fullData.documentsRequired;
    const additionalNotes = fullData.additionalNotes || fullData.notes || fullData.adminNotes || scheduleData.details;
    const documentStatus = fullData.documentStatus;
    const requestNumber = fullData.requestNumber || scheduleData.requestNumber;
    const submittedDate = scheduleData.submittedDate || fullData.dateOfApplication;
    const submittedBy = scheduleData.submittedBy || fullData.submittedByEmail;
    
    // Rejection/Cancellation reasons
    const rejectionReason = scheduleData.rejectionReason || fullData.rejectionReason;
    const cancellationReason = scheduleData.cancellationReason || fullData.cancellationReason;

    const getStatusStyle = (s) => {
        const lowerCaseStatus = s.toLowerCase();
        let color = Colors.shadow;
        
        if (lowerCaseStatus === 'confirmed' || lowerCaseStatus === 'approved' || lowerCaseStatus === 'completed') 
            color = Colors.confirmed;
        else if (lowerCaseStatus === 'pending') color = Colors.pending;
        else if (lowerCaseStatus === 'cancelled' || lowerCaseStatus === 'rejected') color = Colors.cancelled;
        
        return {
            backgroundColor: color,
            shadowColor: color,
            borderColor: color,
        };
    };

    // Function to render ALL available data in a comprehensive way
    const renderAllAvailableData = () => {
        const sections = [];

        // Basic Information Section
        sections.push(
            <View key="basic" style={enhancedStyles.sectionContainer}>
                <Text style={enhancedStyles.sectionTitle}>Basic Information</Text>
                <DetailRow 
                    icon="clock" 
                    label="Petsa at Oras" 
                    value={date && time ? `${date} @ ${time}` : (date || 'Date not set')} 
                    showIfEmpty={true}
                />
                <DetailRow 
                    icon="briefcase" 
                    label="Sakramento" 
                    value={sacrament} 
                    showIfEmpty={true}
                />
                <DetailRow 
                    icon="user" 
                    label="Pangalan" 
                    value={name} 
                    showIfEmpty={true}
                />
                <DetailRow 
                    icon="phone" 
                    label="Contact Number" 
                    value={contact} 
                />
                <DetailRow 
                    icon="hash" 
                    label="Request Number" 
                    value={requestNumber} 
                />
                <DetailRow 
                    icon="calendar" 
                    label="Submitted Date" 
                    value={submittedDate} 
                />
                <DetailRow 
                    icon="mail" 
                    label="Submitted By" 
                    value={submittedBy} 
                />
            </View>
        );

        // Family Information Section
        if (address || fatherName || motherName) {
            sections.push(
                <View key="family" style={enhancedStyles.sectionContainer}>
                    <Text style={enhancedStyles.sectionTitle}>Family Information</Text>
                    <DetailRow 
                        icon="home" 
                        label="Tirahan" 
                        value={address} 
                    />
                    <DetailRow 
                        icon="users" 
                        label="Pangalan ng Ama" 
                        value={fatherName} 
                    />
                    <DetailRow 
                        icon="users" 
                        label="Pangalan ng Ina" 
                        value={motherName} 
                    />
                </View>
            );
        }

        // Sacrament Specific Details
        sections.push(renderSacramentSpecificDetails());

        // Payment Information
        if (paymentStatus || amount) {
            sections.push(
                <View key="payment" style={enhancedStyles.sectionContainer}>
                    <Text style={enhancedStyles.sectionTitle}>Payment Information</Text>
                    <DetailRow 
                        icon="credit-card" 
                        label="Payment Status" 
                        value={paymentStatus === 'paid' ? 'Paid ✅' : 'Unpaid ❌'} 
                    />
                    <DetailRow 
                        icon="dollar-sign" 
                        label="Amount" 
                        value={amount ? `₱${amount}` : null} 
                    />
                    <DetailRow 
                        icon="calendar" 
                        label="Payment Date" 
                        value={paymentDate} 
                    />
                    {reservationFee && (
                        <DetailRow 
                            icon="dollar-sign" 
                            label="Reservation Fee" 
                            value={`₱${reservationFee}`} 
                        />
                    )}
                    {balance && (
                        <DetailRow 
                            icon="dollar-sign" 
                            label="Balance" 
                            value={`₱${balance}`} 
                        />
                    )}
                </View>
            );
        }

        // Additional Information
        sections.push(
            <View key="additional" style={enhancedStyles.sectionContainer}>
                <Text style={enhancedStyles.sectionTitle}>Additional Information</Text>
                <DetailRow 
                    icon="file-text" 
                    label="Mga Kinakailangang Dokumento" 
                    value={requirements} 
                />
                <DetailRow 
                    icon="check-circle" 
                    label="Status ng Dokumento" 
                    value={documentStatus} 
                />
                <DetailRow 
                    icon="edit-3" 
                    label="Mga Paalala" 
                    value={additionalNotes} 
                />
            </View>
        );

        return sections;
    };

    // Enhanced function to render sacrament-specific details
    const renderSacramentSpecificDetails = () => {
        const sacramentType = sacrament?.toLowerCase() || '';
        
        console.log('🎯 Rendering details for sacrament:', sacramentType);
        
        switch (sacramentType) {
            case 'baptism':
                return (
                    <View key="baptism-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Baptism Details</Text>
                        <DetailRow 
                            icon="user-plus" 
                            label="Mga Ninong/Ninang" 
                            value={godparents} 
                        />
                        <DetailRow 
                            icon="gift" 
                            label="Petsa ng Kapanganakan" 
                            value={birthDate} 
                        />
                        <DetailRow 
                            icon="map-pin" 
                            label="Lugar ng Kapanganakan" 
                            value={birthPlace} 
                        />
                        <DetailRow 
                            icon="tag" 
                            label="Uri ng Binyag" 
                            value={baptismType} 
                        />
                        <DetailRow 
                            icon="home" 
                            label="Simbahan ng Binyag" 
                            value={baptismChurch} 
                        />
                        <DetailRow 
                            icon="user-check" 
                            label="Magbibinyag" 
                            value={priest} 
                        />
                    </View>
                );
            
            case 'kumpil':
            case 'confirmation':
                return (
                    <View key="kumpil-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Confirmation Details</Text>
                        <DetailRow 
                            icon="user" 
                            label="Pangalan sa Kumpil" 
                            value={confirmationName} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Sponsor" 
                            value={sponsor} 
                        />
                        <DetailRow 
                            icon="user-check" 
                            label="Magkukumpil" 
                            value={priest} 
                        />
                        <DetailRow 
                            icon="gift" 
                            label="Petsa ng Kapanganakan" 
                            value={birthDate} 
                        />
                        <DetailRow 
                            icon="map-pin" 
                            label="Lugar ng Kapanganakan" 
                            value={birthPlace} 
                        />
                        <DetailRow 
                            icon="calendar" 
                            label="Edad" 
                            value={age} 
                        />
                    </View>
                );
            
            case 'kasal':
            case 'wedding':
            case 'marriage':
                return (
                    <View key="marriage-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Wedding Details</Text>
                        <DetailRow 
                            icon="heart" 
                            label="Pangalan ng Lalaki" 
                            value={groomName} 
                        />
                        <DetailRow 
                            icon="heart" 
                            label="Pangalan ng Babae" 
                            value={brideName} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Edad ng Lalaki" 
                            value={fullData.groomAge} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Edad ng Babae" 
                            value={fullData.brideAge} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Mga Magulang ng Lalaki" 
                            value={groomParents} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Mga Magulang ng Babae" 
                            value={brideParents} 
                        />
                        <DetailRow 
                            icon="user-check" 
                            label="Magkakasal" 
                            value={priest} 
                        />
                        <DetailRow 
                            icon="calendar" 
                            label="Petsa ng Interview" 
                            value={interviewDate} 
                        />
                        <DetailRow 
                            icon="calendar" 
                            label="Petsa ng Seminar" 
                            value={seminarDate} 
                        />
                    </View>
                );

            case 'pamisa':
                return (
                    <View key="pamisa-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Mass Intention Details</Text>
                        <DetailRow 
                            icon="book" 
                            label="Intention" 
                            value={intention} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Mga Pangalan" 
                            value={names} 
                        />
                        <DetailRow 
                            icon="user-plus" 
                            label="Mass Sponsor" 
                            value={massSponsor} 
                        />
                    </View>
                );

            case 'blessing':
                return (
                    <View key="blessing-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Blessing Details</Text>
                        <DetailRow 
                            icon="star" 
                            label="Uri ng Blessing" 
                            value={blessingType} 
                        />
                        <DetailRow 
                            icon="info" 
                            label="Para Kanino" 
                            value={requestForDetails} 
                        />
                    </View>
                );

            case 'funeral service':
                return (
                    <View key="funeral-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Funeral Service Details</Text>
                        <DetailRow 
                            icon="user" 
                            label="Pangalan ng Yumao" 
                            value={nameOfDeceased} 
                        />
                        <DetailRow 
                            icon="calendar" 
                            label="Petsa ng Kamatayan" 
                            value={dateDied} 
                        />
                        <DetailRow 
                            icon="alert-triangle" 
                            label="Sanhi ng Kamatayan" 
                            value={causeOfDeath} 
                        />
                        <DetailRow 
                            icon="map-pin" 
                            label="Libingan" 
                            value={placeOfBurial} 
                        />
                        <DetailRow 
                            icon="user" 
                            label="Nag-ulat" 
                            value={informant} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Relasyon" 
                            value={relationship} 
                        />
                        <DetailRow 
                            icon="cross" 
                            label="Nakatanggap ng Huling Sakramento" 
                            value={receivedLastSacrament} 
                        />
                    </View>
                );

            case 'first communion':
                return (
                    <View key="communion-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>First Communion Details</Text>
                        <DetailRow 
                            icon="user" 
                            label="Pangalan ng Bata" 
                            value={childName} 
                        />
                        <DetailRow 
                            icon="users" 
                            label="Mga Magulang" 
                            value={parentsName} 
                        />
                        <DetailRow 
                            icon="calendar" 
                            label="Edad" 
                            value={age} 
                        />
                    </View>
                );

            case 'holy orders':
                return (
                    <View key="holyorders-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Holy Orders Details</Text>
                        <DetailRow 
                            icon="users" 
                            label="Mga Reference" 
                            value={Array.isArray(references) ? references.join(', ') : references} 
                        />
                    </View>
                );
            
            default:
                return (
                    <View key="default-details" style={enhancedStyles.sectionContainer}>
                        <Text style={enhancedStyles.sectionTitle}>Sacrament Details</Text>
                        <DetailRow 
                            icon="user-check" 
                            label="Mag-aadminister" 
                            value={priest} 
                        />
                    </View>
                );
        }
    };

    // Function to render rejection/cancellation reasons
    const renderReasonInfo = () => {
        if (currentStatus.toLowerCase() === 'rejected' && rejectionReason) {
            return (
                <View style={[enhancedStyles.noteBox, { backgroundColor: '#ffebee', borderLeftColor: Colors.cancelled }]}>
                    <Feather name="alert-circle" size={18} color={Colors.cancelled} />
                    <View style={enhancedStyles.reasonContainer}>
                        <Text style={[enhancedStyles.noteText, { color: Colors.cancelled, fontWeight: 'bold' }]}>
                            Rejection Reason:
                        </Text>
                        <Text style={[enhancedStyles.noteText, { color: Colors.cancelled }]}>
                            {rejectionReason}
                        </Text>
                    </View>
                </View>
            );
        }
        
        if (currentStatus.toLowerCase() === 'cancelled' && cancellationReason) {
            return (
                <View style={[enhancedStyles.noteBox, { backgroundColor: '#ffebee', borderLeftColor: Colors.cancelled }]}>
                    <Feather name="x-circle" size={18} color={Colors.cancelled} />
                    <View style={enhancedStyles.reasonContainer}>
                        <Text style={[enhancedStyles.noteText, { color: Colors.cancelled, fontWeight: 'bold' }]}>
                            Cancellation Reason:
                        </Text>
                        <Text style={[enhancedStyles.noteText, { color: Colors.cancelled }]}>
                            {cancellationReason}
                        </Text>
                    </View>
                </View>
            );
        }
        
        return null;
    };

    return (
        <SafeAreaView style={enhancedStyles.safeArea}>
            <StatusBar style="dark" /> 
            <ScrollView contentContainerStyle={enhancedStyles.scrollContent}>
                
                {/* Header at Status Indicator */}
                <View style={[enhancedStyles.statusHeader, getStatusStyle(currentStatus)]}>
                    <Feather name="calendar" size={40} color={Colors.cardBackground} />
                    <Text style={enhancedStyles.statusText}>
                        STATUS: {currentStatus.toUpperCase()}
                    </Text>
                    {paymentStatus && (
                        <Text style={enhancedStyles.paymentStatusText}>
                            PAYMENT: {paymentStatus.toUpperCase()}
                        </Text>
                    )}
                </View>

                {/* Main Card */}
                <View style={enhancedStyles.mainCard}>
                    
                    {/* Title Section */}
                    <Text style={enhancedStyles.title}>
                        Schedule Details for:
                    </Text>
                    <Text style={enhancedStyles.nameHighlight}>{name}</Text>
                    
                    <View style={enhancedStyles.separatorLine} />
                    
                    {/* Render ALL Available Data */}
                    {renderAllAvailableData()}
                    
                    {/* Rejection/Cancellation Reasons */}
                    {renderReasonInfo()}
                    
                    {/* Important Note */}
                    {(currentStatus.toLowerCase() === 'confirmed' || currentStatus.toLowerCase() === 'approved') && (
                        <View style={enhancedStyles.noteBox}>
                            <Feather name="alert-triangle" size={18} color={Colors.primaryDark} />
                            <Text style={enhancedStyles.noteText}>
                                **Pansin:** Ihanda ang lahat ng kinakailangang dokumento at maging sa simbahan 30 minuto bago ang iskedyul.
                            </Text>
                        </View>
                    )}
                    {currentStatus.toLowerCase() === 'pending' && (
                        <View style={[enhancedStyles.noteBox, { backgroundColor: Colors.pending + '20' }]}>
                            <Feather name="loader" size={18} color={Colors.pending} />
                            <Text style={[enhancedStyles.noteText, { color: Colors.pending }]}>
                                **Processing:** Ang inyong request ay kasalukuyang nirerebisa. Pakisigurado na kumpleto ang mga submitted na dokumento.
                            </Text>
                        </View>
                    )}
                    {(currentStatus.toLowerCase() === 'cancelled' || currentStatus.toLowerCase() === 'rejected') && !rejectionReason && !cancellationReason && (
                        <View style={[enhancedStyles.noteBox, { backgroundColor: Colors.cancelled + '20' }]}>
                            <Feather name="x-circle" size={18} color={Colors.cancelled} />
                            <Text style={[enhancedStyles.noteText, { color: Colors.cancelled }]}>
                                **Cancelled/Rejected:** Ang schedule na ito ay nakansela/hindi naaprubahan. Mangyaring makipag-ugnayan sa parish office para sa karagdagang impormasyon.
                            </Text>
                        </View>
                    )}

                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const enhancedStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    statusHeader: {
        width: '100%',
        paddingVertical: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    statusText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '900',
        color: Colors.cardBackground,
        letterSpacing: 1.5,
    },
    paymentStatusText: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '700',
        color: Colors.cardBackground,
        letterSpacing: 1,
    },
    mainCard: {
        width: width * 0.9,
        maxWidth: 500,
        backgroundColor: Colors.cardBackground,
        borderRadius: 15,
        padding: 25,
        marginTop: -30,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 16,
        color: Colors.textMuted,
        fontWeight: '500',
        marginBottom: 4,
        textAlign: 'center',
    },
    nameHighlight: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.primaryDark,
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    separatorLine: {
        height: 2,
        backgroundColor: Colors.separator,
        marginVertical: 15,
        borderRadius: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primaryDark,
        marginBottom: 10,
        paddingLeft: 5,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    sectionContainer: {
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    detailIcon: {
        marginRight: 15,
        marginTop: 2,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: Colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 17,
        color: Colors.textDark,
        fontWeight: '600',
        marginTop: 2,
    },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.confirmed + '20',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        borderLeftWidth: 5,
        borderLeftColor: Colors.confirmed,
    },
    noteText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: Colors.primaryDark,
        lineHeight: 20,
    },
    reasonContainer: {
        flex: 1,
        marginLeft: 10,
    }
});

export default EnhancedScheduleDetailScreen;
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
    console.log('Schedule Data:', scheduleData);
    console.log('Available fields:', Object.keys(scheduleData));

    // Extract data from the scheduleData structure na galing sa history screen
    const fullData = scheduleData.fullData || {};
    const sacrament = scheduleData.sacrament || '';
    
    // Get status and payment info
    const currentStatus = scheduleData.status || fullData.status || 'Pending';
    const paymentStatus = scheduleData.paymentStatus || fullData.paymentStatus;
    const paymentDate = scheduleData.paymentDate || fullData.paymentDate;
    const amount = scheduleData.amount || fullData.amount;
    
    // Get basic info
    const name = scheduleData.name || fullData.name || fullData.confirmandName || 
                `${fullData.groomName || ''} & ${fullData.brideName || ''}`;
    const date = scheduleData.date || fullData.baptismDate || fullData.kumpilDate || fullData.marriageDate;
    const time = scheduleData.time || fullData.baptismTime || fullData.kumpilTime || fullData.marriageTime;
    const contact = fullData.contactNumber || fullData.phone || fullData.contact;
    
    // Get family information
    const fatherName = fullData.fatherName;
    const motherName = fullData.motherName;
    const address = fullData.address || fullData.residence;
    
    // Sacrament-specific fields
    const godparents = fullData.godparents || fullData.ninongNinang;
    const birthDate = fullData.birthDate || fullData.dateOfBirth;
    const birthPlace = fullData.birthPlace || fullData.placeOfBirth;
    const confirmationName = fullData.confirmationName;
    const sponsor = fullData.sponsor;
    const brideName = fullData.brideName;
    const groomName = fullData.groomName;
    const brideParents = fullData.brideParents;
    const groomParents = fullData.groomParents;
    const priest = fullData.priest || fullData.officiatingPriest;
    
    // Additional fields
    const requirements = fullData.requirements || fullData.documentsRequired;
    const additionalNotes = fullData.additionalNotes || fullData.notes || fullData.adminNotes;
    const documentStatus = fullData.documentStatus;
    
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

    // Function to render details based on sacrament type
    const renderSacramentSpecificDetails = () => {
        const sacramentType = sacrament?.toLowerCase() || 'baptism';
        
        console.log('Rendering details for sacrament:', sacramentType);
        
        switch (sacramentType) {
            case 'baptism':
                return (
                    <View style={enhancedStyles.sectionContainer}>
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
                            icon="user-check" 
                            label="Magbibinyag" 
                            value={priest} 
                        />
                    </View>
                );
            
            case 'kumpil':
            case 'confirmation':
                return (
                    <View style={enhancedStyles.sectionContainer}>
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
                    </View>
                );
            
            case 'kasal':
            case 'wedding':
            case 'marriage':
                return (
                    <View style={enhancedStyles.sectionContainer}>
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
                    </View>
                );
            
            default:
                return (
                    <View style={enhancedStyles.sectionContainer}>
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

    // Function to render payment information
    const renderPaymentInfo = () => {
        if (!paymentStatus && !amount) return null;
        
        return (
            <View style={enhancedStyles.sectionContainer}>
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
            </View>
        );
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
                    <Text style={enhancedStyles.nameHighlight}>{name || 'Not specified'}</Text>
                    
                    <View style={enhancedStyles.separatorLine} />
                    
                    {/* Basic Schedule Details */}
                    <View style={enhancedStyles.sectionContainer}>
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
                            icon="phone" 
                            label="Contact Number" 
                            value={contact} 
                        />
                    </View>

                    {(address || fatherName || motherName) && (
                        <>
                            <View style={enhancedStyles.separatorLine} />
                            {/* Personal Details */}
                            <Text style={enhancedStyles.sectionTitle}>Family Information</Text>
                            <View style={enhancedStyles.sectionContainer}>
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
                        </>
                    )}

                    <View style={enhancedStyles.separatorLine} />

                    {/* Sacrament Specific Details */}
                    {renderSacramentSpecificDetails()}

                    <View style={enhancedStyles.separatorLine} />

                    {/* Payment Information */}
                    {renderPaymentInfo()}

                    <View style={enhancedStyles.separatorLine} />

                    {/* Additional Information */}
                    <View style={enhancedStyles.sectionContainer}>
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
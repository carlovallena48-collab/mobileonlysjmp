import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, 
  StyleSheet, Platform, Alert, Modal,
  TextInput, Dimensions, ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const API_URL = "https://mobileonlysjmp.onrender.com/api/first_communion_requests"; 

const Colors = {
  churchGreenPrimary: '#2E7D32',
  churchGreenLightBg: '#F1F8E9',
  churchGreenDarkText: '#1B5E20',
  churchGrayText: '#616161',
  pureWhite: '#FFFFFF',
  pureBlack: '#000000',
  inputBg: '#FFFFFF',
  inputBorder: '#E0E0E0',
  shadowColor: '#000',
  redError: '#C62828',
  headerBg: '#FFFFFF',
  headerText: '#212121',
  modalBg: 'rgba(0,0,0,0.7)',
  cancelButton: '#B0BEC5',
  cancelButtonText: '#424242',
  cardBg: '#FFFFFF',
  statusPending: '#FFA000',
  statusApproved: '#2E7D32',
  statusRejected: '#C62828',
  statusCompleted: '#1565C0',
  commentBg: '#F8F9FA',
  commentBorder: '#E9ECEF',
  parishReplyColor: '#1F7A8C',
};

const REGISTRATION_FEE = 100.00;

// Schedule data
const COMMUNION_SCHEDULES = {
  grade4ToShs: {
    title: "GRADE 4 to 6, HS, & SHS STUDENTS",
    seminarDate: new Date('2025-11-08'),
    seminarTime: "8:00 AM - 10:00 AM",
    confessionTime: "10:00 AM - 12:00 NN",
    communionDate: new Date('2025-11-15'),
    communionTime: "8:00 AM"
  },
  grade3: {
    title: "GRADE 3 STUDENTS",
    seminarDate: new Date('2025-11-22'),
    seminarTime: "8:00 AM - 10:00 AM",
    confessionTime: "10:00 AM - 12:00 NN", 
    communionDate: new Date('2025-11-29'),
    communionTime: "8:00 AM"
  }
};

export default function FirstCommunionFormScreen({ navigation }) {
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showCommentMenu, setShowCommentMenu] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
          setUserName(user.fullName || 'User');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
    clearOldComments(); // Clear any old dummy comments
    loadComments();
    checkServerStatus();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchExistingSchedule();
    }
  }, [userEmail]);

  // Function to clear any old dummy comments from storage
  const clearOldComments = async () => {
    try {
      await AsyncStorage.removeItem('@firstCommunionComments');
      console.log('Cleared old comments from storage');
    } catch (error) {
      console.error('Error clearing old comments:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch(API_URL.replace('/api/first_communion_requests', ''));
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setServerStatus('offline');
    }
  };

  const fetchExistingSchedule = async () => {
    if (!userEmail) return;
    
    try {
      console.log('Fetching existing schedule for:', userEmail);
      
      const response = await fetch(API_URL);
      
      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Non-JSON response received:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check API endpoint.');
      }
      
      const data = await response.json();
      
      const userSchedule = data.find(
        r => r.submittedByEmail === userEmail && 
             (r.status === 'pending' || r.status === 'approved' || !r.status)
      );
      
      if (userSchedule) {
        setExistingSchedule(userSchedule);
      } else {
        setExistingSchedule(null);
      }
    } catch (error) {
      console.error("Error fetching existing schedule:", error);
      setExistingSchedule(null);
    }
  };

  const loadComments = async () => {
    try {
      // Try to load saved comments from AsyncStorage
      const savedComments = await AsyncStorage.getItem('@firstCommunionComments');
      if (savedComments) {
        const parsedComments = JSON.parse(savedComments);
        // Filter out any comments with dummy names
        const filteredComments = parsedComments.filter(comment => 
          !['Maria Santos', 'Juan Dela Cruz', 'Ana Reyes', 'Parish Office'].includes(comment.user)
        );
        setComments(filteredComments);
        // Save the filtered comments back to storage
        if (filteredComments.length !== parsedComments.length) {
          await saveComments(filteredComments);
        }
      } else {
        // Start with completely empty comments
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const saveComments = async (updatedComments) => {
    try {
      await AsyncStorage.setItem('@firstCommunionComments', JSON.stringify(updatedComments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const handleRegister = async (scheduleType) => {
    if (serverStatus === 'offline') {
      Alert.alert('Offline Mode', 'Server is offline. Please try again later or visit the parish office.');
      return;
    }

    try {
      if (!userEmail) {
        Alert.alert('Login Required', 'Please login first to register for First Communion.');
        return;
      }

      setIsLoading(true);

      const selectedSchedule = scheduleType === 'grade4ToShs' 
        ? COMMUNION_SCHEDULES.grade4ToShs 
        : COMMUNION_SCHEDULES.grade3;

      const communionRequestData = {
        sacrament: 'First Communion',
        studentName: 'To be submitted at parish office',
        scheduleCategory: scheduleType,
        seminarDate: fmtDateRaw(selectedSchedule.seminarDate),
        seminarTime: selectedSchedule.seminarTime,
        confessionTime: selectedSchedule.confessionTime,
        communionDate: fmtDateRaw(selectedSchedule.communionDate),
        communionTime: selectedSchedule.communionTime,
        registrationFee: REGISTRATION_FEE,
        submittedByEmail: userEmail,
        status: 'pending',
        paymentStatus: 'unpaid',
        requirement: 'Photocopy of Baptismal Certificate',
        createdAt: new Date().toISOString(),
      };

      console.log('Sending request to:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(communionRequestData),
      });

      // Check response type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Server returned non-JSON:', textResponse);
        throw new Error('Server error. Please try again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();
      
      setShowSuccessModal(true);
      setExistingSchedule(communionRequestData);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        'Registration Failed', 
        error.message || 'Please try again or visit the parish office.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (newComment.trim() === '') {
      Alert.alert('Empty Comment', 'Please enter a comment before posting.');
      return;
    }

    if (!userName || userName === 'User') {
      Alert.alert('Login Required', 'Please login to post comments.');
      return;
    }

    setIsSubmittingComment(true);

    try {
      const comment = {
        id: Date.now(),
        user: userName,
        userEmail: userEmail,
        comment: newComment.trim(),
        time: 'Just now',
        isParish: false,
        replies: [],
        timestamp: new Date().toISOString()
      };

      const updatedComments = [comment, ...comments];
      setComments(updatedComments);
      await saveComments(updatedComments);
      setNewComment('');

    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const addReply = async (commentId) => {
    if (replyText.trim() === '') {
      Alert.alert('Empty Reply', 'Please enter a reply before posting.');
      return;
    }

    if (!userName || userName === 'User') {
      Alert.alert('Login Required', 'Please login to post replies.');
      return;
    }

    try {
      const reply = {
        id: Date.now(),
        user: userName,
        userEmail: userEmail,
        comment: replyText.trim(),
        time: 'Just now',
        isParish: false,
        timestamp: new Date().toISOString()
      };

      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [reply, ...(comment.replies || [])] }
          : comment
      );

      setComments(updatedComments);
      await saveComments(updatedComments);
      setReplyText('');
      setReplyingTo(null);

    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    }
  };

  const deleteComment = (commentId, isReply = false, parentCommentId = null) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let updatedComments;
              
              if (isReply && parentCommentId) {
                // Delete reply
                updatedComments = comments.map(comment =>
                  comment.id === parentCommentId
                    ? {
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== commentId)
                      }
                    : comment
                );
              } else {
                // Delete main comment
                updatedComments = comments.filter(comment => comment.id !== commentId);
              }

              setComments(updatedComments);
              await saveComments(updatedComments);
              setShowCommentMenu(null);
              
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Modified to allow ALL comments to be deleted by the current user
  const canDeleteComment = (comment) => {
    // Allow deletion if it's the user's own comment OR if user is admin
    // For demo purposes, we'll allow all deletions by the current user
    return comment.userEmail === userEmail || userEmail === 'admin@parish.com' || true;
  };

  const cancelRegistration = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your First Communion registration?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setExistingSchedule(null);
            Alert.alert('Cancelled', 'Your First Communion registration has been cancelled.');
          },
        },
      ]
    );
  };

  const fmtDateRaw = d => d instanceof Date ? d.toLocaleDateString('en-US') : 'N/A';
  const fmtDate = d => d instanceof Date ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const ScheduleCard = ({ schedule, scheduleType }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleTitle}>{schedule.title}</Text>
        {existingSchedule?.scheduleCategory === scheduleType && (
          <View style={styles.registeredBadge}>
            <Feather name="check-circle" size={16} color={Colors.pureWhite} />
            <Text style={styles.registeredText}>Registered</Text>
          </View>
        )}
      </View>
      
      <View style={styles.scheduleDetails}>
        <View style={styles.scheduleItem}>
          <Feather name="calendar" size={14} color={Colors.churchGrayText} />
          <Text style={styles.scheduleLabel}>Seminar:</Text>
          <Text style={styles.scheduleText}>{fmtDate(schedule.seminarDate)}</Text>
        </View>
        <Text style={styles.scheduleTime}>{schedule.seminarTime}</Text>
        
        <View style={styles.scheduleItem}>
          <Feather name="clock" size={14} color={Colors.churchGrayText} />
          <Text style={styles.scheduleLabel}>Confession:</Text>
          <Text style={styles.scheduleText}>{schedule.confessionTime}</Text>
        </View>
        
        <View style={styles.scheduleItem}>
          <Feather name="calendar" size={14} color={Colors.churchGrayText} />
          <Text style={styles.scheduleLabel}>Communion Mass:</Text>
          <Text style={styles.scheduleText}>{fmtDate(schedule.communionDate)}</Text>
        </View>
        <Text style={styles.scheduleTime}>{schedule.communionTime}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.registerButton,
          existingSchedule?.scheduleCategory === scheduleType && styles.registeredButton,
          isLoading && styles.disabledButton
        ]}
        onPress={() => handleRegister(scheduleType)}
        disabled={existingSchedule?.scheduleCategory === scheduleType || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.pureWhite} size="small" />
        ) : (
          <Text style={styles.registerButtonText}>
            {existingSchedule?.scheduleCategory === scheduleType ? 'Already Registered' : 'Register Now'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const CommentItem = ({ comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.commentUser}>
            {comment.user}
          </Text>
        </View>
        
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{comment.time}</Text>
          
          {/* Three dots menu - ALWAYS SHOW DELETE OPTION */}
          <TouchableOpacity 
            onPress={() => setShowCommentMenu(showCommentMenu === comment.id ? null : comment.id)}
            style={styles.menuButton}
          >
            <Feather name="more-horizontal" size={16} color={Colors.churchGrayText} />
          </TouchableOpacity>

          {/* Dropdown menu */}
          {showCommentMenu === comment.id && (
            <View style={styles.dropdownMenu}>
              {/* ALWAYS SHOW DELETE BUTTON */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => deleteComment(comment.id)}
              >
                <Feather name="trash-2" size={14} color={Colors.redError} />
                <Text style={[styles.menuText, { color: Colors.redError }]}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setReplyingTo(comment.id);
                  setShowCommentMenu(null);
                }}
              >
                <Feather name="message-circle" size={14} color={Colors.churchGrayText} />
                <Text style={styles.menuText}>Reply</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.commentText}>{comment.comment}</Text>

      {/* Reply Button */}
      <TouchableOpacity 
        style={styles.replyButton}
        onPress={() => setReplyingTo(comment.id)}
      >
        <Feather name="corner-down-right" size={14} color={Colors.churchGrayText} />
        <Text style={styles.replyButtonText}>Reply</Text>
      </TouchableOpacity>

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={Colors.churchGrayText}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
          />
          <View style={styles.replyActions}>
            <TouchableOpacity 
              style={styles.cancelReplyButton}
              onPress={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
            >
              <Text style={styles.cancelReplyText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.postReplyButton,
                replyText.trim() === '' && styles.disabledPostButton
              ]}
              onPress={() => addReply(comment.id)}
              disabled={replyText.trim() === ''}
            >
              <Text style={styles.postReplyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Replies */}
      {comment.replies && comment.replies.map(reply => (
        <View key={reply.id} style={styles.replyCard}>
          <View style={styles.commentHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.commentUser}>
                {reply.user}
              </Text>
            </View>
            
            <View style={styles.commentActions}>
              <Text style={styles.commentTime}>{reply.time}</Text>
              
              {/* ALWAYS SHOW DELETE FOR REPLIES TOO */}
              <TouchableOpacity 
                onPress={() => deleteComment(reply.id, true, comment.id)}
                style={styles.menuButton}
              >
                <Feather name="trash-2" size={14} color={Colors.churchGrayText} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.commentText}>{reply.comment}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        
        <View style={styles.headerMain}>
          <Text style={styles.headerSacramentText}>FIRST HOLY COMMUNION</Text>
          <View style={styles.feeBadge}>
            <Feather name="credit-card" size={14} color={Colors.pureWhite} />
            <Text style={styles.feeBadgeText}>Fee: ₱{REGISTRATION_FEE.toFixed(2)}</Text>
          </View>
        </View>

        {/* Server Status Indicator */}
        <View style={[
          styles.statusIndicator,
          serverStatus === 'online' && styles.statusOnline,
          serverStatus === 'offline' && styles.statusOffline
        ]}>
          <Feather 
            name={serverStatus === 'online' ? "wifi" : "wifi-off"} 
            size={12} 
            color={Colors.pureWhite} 
          />
        </View>
      </View>

      {/* Server Status Message */}
      {serverStatus === 'offline' && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={16} color={Colors.pureWhite} />
          <Text style={styles.offlineText}>Offline Mode - Server not available</Text>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Announcement Section */}
        <View style={styles.announcementCard}>
          <Feather name="info" size={24} color={Colors.churchGreenPrimary} />
          <View style={styles.announcementContent}>
            <Text style={styles.announcementTitle}>FIRST COMMUNION REGISTRATION</Text>
            <Text style={styles.announcementText}>
              Magandang balita! Bukas na ang registration para sa First Holy Communion. 
              Piliin ang schedule na angkop sa grade level at mag-register online.
            </Text>
          </View>
        </View>

        {/* Requirements Notice */}
        <View style={styles.requirementsSection}>
          <Feather name="alert-circle" size={24} color={Colors.churchGreenPrimary} />
          <View style={styles.requirementsContent}>
            <Text style={styles.requirementsTitle}>IMPORTANT REQUIREMENT</Text>
            <Text style={styles.requirementsText}>
              Mag-submit ng PHOTOCOPY NG BAPTISMAL CERTIFICATE sa Parish Office pagkatapos mag-register online.
            </Text>
          </View>
        </View>

        {/* Schedule Selection */}
        <Text style={styles.sectionTitle}>Available Schedules</Text>
        
        <ScheduleCard 
          schedule={COMMUNION_SCHEDULES.grade4ToShs} 
          scheduleType="grade4ToShs" 
        />
        
        <ScheduleCard 
          schedule={COMMUNION_SCHEDULES.grade3} 
          scheduleType="grade3" 
        />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Community Questions & Answers</Text>
            <Text style={styles.commentsSubtitle}>
              Magtanong tungkol sa First Communion registration
            </Text>
          </View>
          
          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Magtanong o mag-iwan ng komento..."
              placeholderTextColor={Colors.churchGrayText}
              value={newComment}
              onChangeText={(text) => setNewComment(text)}
              multiline
              maxLength={500}
              editable={true}
              selectTextOnFocus={true}
            />
            <TouchableOpacity 
              style={[
                styles.postButton,
                (newComment.trim() === '' || isSubmittingComment) && styles.disabledPostButton
              ]} 
              onPress={addComment}
              disabled={newComment.trim() === '' || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator color={Colors.pureWhite} size="small" />
              ) : (
                <Feather name="send" size={20} color={Colors.pureWhite} />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List - COMPLETELY EMPTY NOW */}
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <View style={styles.noComments}>
              <Feather name="message-circle" size={40} color={Colors.churchGrayText} />
              <Text style={styles.noCommentsText}>Walang komento pa</Text>
              <Text style={styles.noCommentsSubtext}>Ikaw ang unang magtanong!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
            <Feather name="check-circle" size={50} color={Colors.churchGreenPrimary} style={{marginBottom: 15}}/>
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Registration Successful!</Text>
            <Text style={styles.modalSubTitle}>Your First Communion registration has been received.</Text>
            
            <View style={styles.successRequirement}>
              <Text style={styles.successRequirementTitle}>Don't Forget:</Text>
              <Text style={styles.successRequirementText}>Submit Photocopy of Baptismal Certificate at the Parish Office</Text>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ... (styles remain the same as previous version)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.churchGreenLightBg },
  header: {
    padding: 15, 
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    backgroundColor: Colors.headerBg,
    borderBottomWidth: 3,
    borderBottomColor: Colors.churchGreenPrimary,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    backgroundColor: Colors.churchGreenLightBg,
    borderRadius: 20,
    padding: 5,
  },
  headerMain: {
    flex: 1,
    alignItems: 'center',
  },
  headerSacramentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.churchGreenPrimary,
    marginBottom: 5,
  },
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.churchGreenPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  feeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.pureWhite,
    marginLeft: 4,
  },
  statusIndicator: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'android' ? 45 : 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOnline: {
    backgroundColor: Colors.statusApproved,
  },
  statusOffline: {
    backgroundColor: Colors.redError,
  },
  offlineBanner: {
    backgroundColor: Colors.redError,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: Colors.pureWhite,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollViewContent: { padding: 15, paddingBottom: 20 },
  announcementCard: {
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  announcementContent: {
    flex: 1,
    marginLeft: 10,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.churchGreenPrimary,
    marginBottom: 5,
  },
  announcementText: {
    fontSize: 14,
    color: Colors.churchGrayText,
    lineHeight: 20,
  },
  requirementsSection: {
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.churchGreenPrimary,
  },
  requirementsContent: {
    flex: 1,
    marginLeft: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.churchGreenPrimary,
    marginBottom: 5,
  },
  requirementsText: {
    fontSize: 12,
    color: Colors.churchGrayText,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.churchGreenDarkText,
    marginBottom: 15,
  },
  scheduleCard: {
    backgroundColor: Colors.pureWhite,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.churchGreenDarkText,
    flex: 1,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.churchGreenPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.pureWhite,
    marginLeft: 4,
  },
  scheduleDetails: {
    marginLeft: 5,
    marginBottom: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scheduleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.churchGrayText,
    marginLeft: 5,
    marginRight: 5,
    width: 100,
  },
  scheduleText: {
    fontSize: 12,
    color: Colors.churchGreenDarkText,
    flex: 1,
  },
  scheduleTime: {
    fontSize: 11,
    color: Colors.churchGrayText,
    fontStyle: 'italic',
    marginLeft: 20,
    marginBottom: 8,
  },
  registerButton: {
    backgroundColor: Colors.churchGreenPrimary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: Colors.churchGrayText,
  },
  disabledButton: {
    backgroundColor: Colors.churchGrayText,
    opacity: 0.6,
  },
  registerButtonText: {
    color: Colors.pureWhite,
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsHeader: {
    marginBottom: 15,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.churchGreenDarkText,
    marginBottom: 5,
  },
  commentsSubtitle: {
    fontSize: 14,
    color: Colors.churchGrayText,
  },
  addCommentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.commentBg,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    maxHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: Colors.pureBlack,
  },
  postButton: {
    backgroundColor: Colors.churchGreenPrimary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledPostButton: {
    backgroundColor: Colors.churchGrayText,
    opacity: 0.6,
  },
  commentCard: {
    backgroundColor: Colors.commentBg,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.commentBorder,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.churchGreenDarkText,
    marginRight: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: Colors.churchGrayText,
    marginRight: 8,
  },
  menuButton: {
    padding: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: Colors.pureWhite,
    borderRadius: 8,
    padding: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 14,
    marginLeft: 8,
    color: Colors.churchGrayText,
  },
  commentText: {
    fontSize: 14,
    color: Colors.pureBlack,
    lineHeight: 20,
    marginBottom: 10,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  replyButtonText: {
    fontSize: 12,
    color: Colors.churchGrayText,
    marginLeft: 4,
  },
  replyInputContainer: {
    marginTop: 10,
    backgroundColor: Colors.pureWhite,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  replyInput: {
    backgroundColor: Colors.commentBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 16,
    color: Colors.pureBlack,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelReplyText: {
    color: Colors.churchGrayText,
    fontSize: 14,
  },
  postReplyButton: {
    backgroundColor: Colors.churchGreenPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postReplyText: {
    color: Colors.pureWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  replyCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.inputBorder,
  },
  noComments: {
    alignItems: 'center',
    padding: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: Colors.churchGrayText,
    marginTop: 10,
    marginBottom: 5,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: Colors.churchGrayText,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1, 
    backgroundColor: Colors.modalBg, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.cardBg, 
    padding: 25, 
    borderRadius: 15, 
    width: '90%',
    shadowColor: Colors.shadowColor, 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, 
    shadowRadius: 15, 
    elevation: 10,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: Colors.churchGreenPrimary,
    marginBottom: 10,
  },
  modalSubTitle: { 
    fontSize: 14, 
    textAlign: 'center', 
    marginBottom: 15, 
    color: Colors.churchGrayText,
    lineHeight: 20,
  },
  successRequirement: {
    marginTop: 15,
    padding: 12,
    backgroundColor: Colors.churchGreenLightBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.churchGreenPrimary,
  },
  successRequirementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.churchGreenDarkText,
    marginBottom: 5,
    textAlign: 'center',
  },
  successRequirementText: {
    fontSize: 14,
    color: Colors.churchGrayText,
    textAlign: 'center',
  },
});
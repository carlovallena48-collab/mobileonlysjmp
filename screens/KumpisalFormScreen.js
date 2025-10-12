// screens/KumpisalFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

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
  commentBg: '#F8F9FA',
  commentBorder: '#E9ECEF',
};

const KumpisalFormScreen = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
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
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const savedComments = await AsyncStorage.getItem('@kumpisalComments');
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const saveComments = async (updatedComments) => {
    try {
      await AsyncStorage.setItem('@kumpisalComments', JSON.stringify(updatedComments));
    } catch (error) {
      console.error('Error saving comments:', error);
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
                updatedComments = comments.map(comment =>
                  comment.id === parentCommentId
                    ? {
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== commentId)
                      }
                    : comment
                );
              } else {
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

  const canDeleteComment = (comment) => {
    return comment.userEmail === userEmail || userEmail === 'admin@parish.com' || true;
  };

  const handleCallChurch = () => {
    Linking.openURL('tel:09631626316');
  };

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
          
          <TouchableOpacity 
            onPress={() => setShowCommentMenu(showCommentMenu === comment.id ? null : comment.id)}
            style={styles.menuButton}
          >
            <Icon name="more-horiz" size={16} color={Colors.churchGrayText} />
          </TouchableOpacity>

          {showCommentMenu === comment.id && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => deleteComment(comment.id)}
              >
                <Icon name="delete" size={14} color={Colors.redError} />
                <Text style={[styles.menuText, { color: Colors.redError }]}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setReplyingTo(comment.id);
                  setShowCommentMenu(null);
                }}
              >
                <Icon name="reply" size={14} color={Colors.churchGrayText} />
                <Text style={styles.menuText}>Reply</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.commentText}>{comment.comment}</Text>

      <TouchableOpacity 
        style={styles.replyButton}
        onPress={() => setReplyingTo(comment.id)}
      >
        <Icon name="reply" size={14} color={Colors.churchGrayText} />
        <Text style={styles.replyButtonText}>Reply</Text>
      </TouchableOpacity>

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
              
              <TouchableOpacity 
                onPress={() => deleteComment(reply.id, true, comment.id)}
                style={styles.menuButton}
              >
                <Icon name="delete" size={14} color={Colors.churchGrayText} />
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Icon name="healing" size={50} color="#2E7D32" />
          <Text style={styles.title}>Sakramento ng Kumpisal</Text>
          <Text style={styles.subtitle}>Reconciliation / Confession</Text>
        </View>

        {/* Main Content Card */}
        <View style={styles.card}>
          {/* Schedule Section - UPDATED FOR EVERYDAY AVAILABILITY */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="schedule" size={24} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Oras ng Kumpisal</Text>
            </View>
            
            <View style={styles.scheduleItem}>
              <Icon name="event-available" size={20} color="#2E7D32" />
              <View style={styles.scheduleText}>
                <Text style={styles.scheduleDay}>Araw-araw</Text>
                <Text style={styles.scheduleTime}>
                  30 minuto bago at pagkatapos ng bawat Misa
                </Text>
              </View>
            </View>

            <View style={styles.noteBox}>
              <Icon name="info" size={18} color="#1976D2" />
              <Text style={styles.noteText}>
                Available ang kumpisal araw-araw bago at pagkatapos ng bawat Misa. 
                Pumunta lamang sa confession room at maghintay sa pila.
              </Text>
            </View>
          </View>

          {/* Reminder Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lightbulb" size={24} color="#FF9800" />
              <Text style={styles.sectionTitle}>Mga Paalala</Text>
            </View>
            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={18} color="#2E7D32" />
              <Text style={styles.reminderText}>
                Ang kumpisal ay available ARAW-ARAW bago at pagkatapos ng bawat Misa
              </Text>
            </View>
            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={18} color="#2E7D32" />
              <Text style={styles.reminderText}>
                Maghanda sa pamamagitan ng pagsusuri ng konsensya
              </Text>
            </View>
            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={18} color="#2E7D32" />
              <Text style={styles.reminderText}>
                Magsuot ng angkop na damit kapag magkukumpisal
              </Text>
            </View>
            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={18} color="#2E7D32" />
              <Text style={styles.reminderText}>
                Magdasal ng Act of Contrition bago kumpisal
              </Text>
            </View>
          </View>

          {/* Guide Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="menu-book" size={24} color="#1976D2" />
              <Text style={styles.sectionTitle}>Gabay sa Kumpisal</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Pagsusuri ng Konsensya</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Pagsisisi sa mga Kasalanan</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Pagkumpisal sa Pari</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Pagtanggap ng Absolution</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepText}>Pagganap ng Penitensya</Text>
            </View>
          </View>
        </View>

        {/* Bible Verse */}
        <View style={styles.bibleVerseCard}>
          <Icon name="format-quote" size={30} color="#7CB342" />
          <Text style={styles.bibleVerse}>
            "Ipagdiinan ninyo ito sa mga tao: Magbalik-loob sila sa Diyos at talikdan ang kanilang mga kasalanan, upang magpatawad sa inyo ang Diyos at pagpalain kayo ng masagana."
          </Text>
          <Text style={styles.bibleReference}>- Gawa 3:19</Text>
        </View>

        {/* Quick Contact Button */}
        <TouchableOpacity style={styles.quickContactButton} onPress={handleCallChurch}>
          <Icon name="phone" size={20} color="#FFF" />
          <Text style={styles.quickContactText}>Tawagan ang Parish Office</Text>
        </TouchableOpacity>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Mga Tanong at Komento</Text>
            <Text style={styles.commentsSubtitle}>
              Magtanong tungkol sa Kumpisal
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
                <Icon name="send" size={20} color={Colors.pureWhite} />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <View style={styles.noComments}>
              <Icon name="message" size={40} color={Colors.churchGrayText} />
              <Text style={styles.noCommentsText}>Walang komento pa</Text>
              <Text style={styles.noCommentsSubtext}>Ikaw ang unang magtanong!</Text>
            </View>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#2E7D32" />
          <Text style={styles.backButtonText}>Bumalik</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5E8',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  scheduleText: {
    marginLeft: 10,
    flex: 1,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    padding: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bibleVerseCard: {
    backgroundColor: '#E8F5E8',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  bibleVerse: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 10,
  },
  bibleReference: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  quickContactButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    marginTop: 0,
  },
  quickContactText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  commentsSection: {
    margin: 20,
    marginTop: 0,
  },
  commentsHeader: {
    marginBottom: 15,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  commentsSubtitle: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#2E7D32',
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
    color: '#2E7D32',
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
    backgroundColor: '#2E7D32',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default KumpisalFormScreen;
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, MoreVertical, MessageSquare, X } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../services/socket';
import api from '../services/api';

const Chat = ({ route, navigation }: any) => {
  const { colors, isDark } = useTheme();
  const rideId = route?.params?.rideId;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = getSocket();
  const flatListRef = useRef<FlatList>(null);
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);
  const [fetchingJourneys, setFetchingJourneys] = useState(false);
  const [showRideInfo, setShowRideInfo] = useState(false);
  const [currentRide, setCurrentRide] = useState<any>(null);

  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      fetchActiveJourneys();
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const [chatRes, rideRes] = await Promise.all([
          api.get(`/chat/${rideId}`),
          api.get(`/rides/${rideId}`)
        ]);
        
        setCurrentRide(rideRes.data);
        
        const formattedMessages = (chatRes.data.messages || []).map((m: any) => ({
          text: m.content,
          senderId: m.senderId,
          senderName: m.senderName,
          timestamp: m.sentAt,
          id: m.id
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error('Chat fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (socket && rideId) {
      socket.emit('join_ride_room', { rideId });
      
      socket.on('new_message', (message: any) => {
        const formatted = {
          text: message.content,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.sentAt,
          id: message.id
        };
        setMessages(prev => [...prev, formatted]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [rideId, socket]);

  const fetchActiveJourneys = async () => {
    setFetchingJourneys(true);
    try {
      const response = await api.get('/rides/history');
      const active = response.data.filter((r: any) => r.status !== 'completed' && r.status !== 'cancelled');
      setActiveJourneys(active);
    } catch (err) {
      console.error('Failed to fetch active journeys:', err);
    } finally {
      setFetchingJourneys(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket || !rideId) return;
    socket.emit('send_message', { rideId, content: inputText.trim() });
    setInputText('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = (item.senderId || item.sender?._id) === user?.id;
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        {!isMe && <Text style={[styles.senderName, { color: colors.textMuted }]}>{item.senderName || item.sender?.name || 'User'}</Text>}
        <View style={[
          styles.messageBubble, 
          isMe ? styles.myBubble : styles.otherBubble,
          isMe ? { backgroundColor: colors.primary } : { backgroundColor: colors.cardBg, borderColor: colors.border }
        ]}>
          <Text style={[
            styles.messageText, 
            isMe ? styles.myText : styles.otherText,
            { color: isMe ? colors.black : colors.text }
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textMuted }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => rideId ? navigation.setParams({ rideId: null }) : navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
             <Text style={[styles.headerTitle, { color: colors.text }]}>
               {rideId ? (currentRide?.dropoffLocation?.address?.split(',')[0] || 'Ride Chat') : 'My Chats'}
             </Text>
             {rideId && (
               <View style={styles.headerStatus}>
                  <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.activeText, { color: colors.textMuted }]}>Active Group</Text>
               </View>
             )}
          </View>
        </View>
        {rideId && (
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowRideInfo(true)}
          >
             <MoreVertical size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !rideId ? (
        <View style={styles.emptyContainer}>
          <View style={styles.chatListHeader}>
            <Text style={[styles.chatListTitle, { color: colors.text }]}>Active Chats</Text>
            <TouchableOpacity onPress={fetchActiveJourneys}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {fetchingJourneys ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : activeJourneys.length > 0 ? (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {activeJourneys.map((ride, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.rideChatItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                  onPress={() => navigation.setParams({ rideId: ride._id })}
                >
                  <View style={[styles.rideChatIcon, { backgroundColor: colors.primary + '15' }]}>
                    <MessageSquare size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rideChatTitle, { color: colors.text }]} numberOfLines={1}>
                      To: {ride.dropoffLocation?.address?.split(',')[0]}
                    </Text>
                    <Text style={[styles.rideChatSub, { color: colors.textMuted }]}>
                      {ride.riders?.length} participants • {ride.status}
                    </Text>
                  </View>
                  <ChevronLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noChatsBox}>
              <MessageSquare size={64} color={colors.textMuted} strokeWidth={1} />
              <Text style={[styles.noChatsTitle, { color: colors.text }]}>No Active Chats</Text>
              <Text style={[styles.noChatsSub, { color: colors.textMuted }]}>
                Join or create a journey to start chatting with other riders.
              </Text>
              <TouchableOpacity 
                style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={{ color: colors.black, fontWeight: '900' }}>Find a Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      {rideId && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Message your ride mates..."
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.surface }, !inputText.trim() && styles.sendBtnDisabled]} 
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Send size={20} color={inputText.trim() ? colors.black : colors.textMuted} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Ride Info Modal */}
      <Modal
        visible={showRideInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRideInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.infoModal, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Journey Details</Text>
              <TouchableOpacity onPress={() => setShowRideInfo(false)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {currentRide && (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>STATUS</Text>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>{currentRide.status?.toUpperCase()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>FROM</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{currentRide.pickupLocation?.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>TO</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{currentRide.dropoffLocation?.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>PASSENGERS</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{currentRide.riders?.length} / {currentRide.maxRiders}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.viewRideBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowRideInfo(false);
                    navigation.navigate('RideDetail', { id: rideId });
                  }}
                >
                  <Text style={{ color: colors.black, fontWeight: '900' }}>View on Map</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerInfo: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    maxWidth: '85%',
    marginBottom: 20,
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageBubble: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  myText: {},
  otherText: {},
  timestamp: {
    fontSize: 9,
    marginTop: 6,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  inputContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sendBtnDisabled: {
    shadowOpacity: 0,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
  },
  chatListHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  chatListTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  rideChatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 16,
  },
  rideChatIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideChatTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  rideChatSub: {
    fontSize: 13,
    fontWeight: '600',
  },
  noChatsBox: {
    alignItems: 'center',
    paddingTop: 60,
  },
  noChatsTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 8,
  },
  noChatsSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  infoModal: {
    borderRadius: 32,
    borderWidth: 1.5,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  infoContent: {
    gap: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewRideBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
  },
});

export default Chat;

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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, MoreVertical, MessageSquare } from 'lucide-react-native';
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

  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/rides/${rideId}/chat`);
        setMessages(response.data);
      } catch (err) {
        console.error('Chat fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('joinRideChat', rideId);
      
      socket.on('newMessage', (message: any) => {
        if (message.rideId === rideId) {
          setMessages(prev => [...prev, message]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leaveRideChat', rideId);
        socket.off('newMessage');
      }
    };
  }, [rideId, socket]);

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    const messageData = {
      rideId,
      text: inputText.trim(),
      senderId: user?.id,
      senderName: user?.name,
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', messageData);
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
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
             <Text style={[styles.headerTitle, { color: colors.text }]}>Ride Chat</Text>
             <View style={styles.headerStatus}>
                <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.activeText, { color: colors.textMuted }]}>Active Group</Text>
             </View>
          </View>
        </View>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
           <MoreVertical size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !rideId ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
             <MessageSquare size={48} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Select a Journey</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Go to your active journeys and tap on the chat icon to start talking with your ride mates.</Text>
          <TouchableOpacity 
            style={[styles.exploreBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={[styles.exploreBtnText, { color: colors.black }]}>View Active Journeys</Text>
          </TouchableOpacity>
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
          <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '600',
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: '900',
  },
});

export default Chat;

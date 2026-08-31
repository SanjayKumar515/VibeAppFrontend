import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Send,
  SendProps,
  Composer,
} from 'react-native-gifted-chat';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setActiveChatRoom } from '../../../store/slices/chatSlice';
import { socketService } from '../../../services/socketService';
import { AppStackProps } from '../../../@types';
import { useTheme } from '../../../theme/ThemeContext';
import getStyles from './chatRoom.styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { CommonImagePicker, ImagePickerModal } from '../../../components';

type ChatRoomRouteProp = RouteProp<AppStackProps, 'ChatRoom'>;

const INITIAL_MESSAGES: IMessage[] = [
  {
    _id: 4,
    text: 'Great! Working on a React Native app.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    user: {
      _id: 1,
      name: 'Me',
    },
  },
  {
    _id: 3,
    text: 'I am doing well, thanks. How about you?',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    user: {
      _id: 2,
      name: 'Them',
      avatar: 'https://i.pravatar.cc/150',
    },
  },
  {
    _id: 2,
    text: 'Hi! How are you?',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    user: {
      _id: 1,
      name: 'Me',
    },
  },
  {
    _id: 1,
    text: 'Hey there!',
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    user: {
      _id: 2,
      name: 'Them',
      avatar: 'https://i.pravatar.cc/150',
    },
  },
];

const ChatRoom = () => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute<ChatRoomRouteProp>();
  const { chatId, name, avatar } = route.params;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);

  const handleAttachmentSelect = async (type: 'Camera' | 'Gallery' | 'Document') => {
    setIsAttachmentModalVisible(false);
    try {
      const result = await CommonImagePicker(type, 1, false);
      if (result) {
        let imageUri = undefined;
        let text = '';
        
        if (type === 'Document') {
          const doc = (result as any)[0];
          text = `📄 ${doc.name || 'Document'}`;
        } else {
          const img = result as any;
          imageUri = img.path;
        }

        const newMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Me',
          },
          image: imageUri,
        };
        
        onSend([newMessage]);
      }
    } catch (error) {
      console.log('Picker Error: ', error);
    }
  };

  useEffect(() => {
    // Set active chat room to clear unread badges
    dispatch(setActiveChatRoom(chatId));

    let hasReceivedData = false;

    const handleGetMessages = (response: any) => {
      hasReceivedData = true;
      if (response.success && response.data) {
        const formattedMessages = response.data.map((msg: any) => ({
          _id: msg.id,
          text: msg.content || '',
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.sender.id,
            name: msg.sender.name,
            avatar: msg.sender.avatar,
          },
          image: msg.attachement,
        }));
        
        // GiftedChat expects messages in reverse chronological order (newest at index 0)
        const sortedMessages = formattedMessages.sort(
          (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setMessages(sortedMessages);
      }
    };

    const handleNewMessage = (response: any) => {
      if (response.success && response.data) {
        // Only append if it belongs to this conversation
        if (response.data.conversationId === chatId) {
          const newMsg = {
            _id: response.data.id,
            text: response.data.content || '',
            createdAt: new Date(response.data.createdAt),
            user: {
              _id: response.data.sender.id,
              name: response.data.sender.name,
              avatar: response.data.sender.avatar,
            },
            image: response.data.attachement,
          };
          
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, [newMsg]),
          );
        }
      }
    };

    socketService.on('getMessages', handleGetMessages);
    socketService.on('newMessage', handleNewMessage);

    const requestMessages = () => {
      if (!hasReceivedData) {
        socketService.emit('getMessages', { conversationId: chatId });
      }
    };

    // Initial request
    requestMessages();

    // Retry every 1.5 seconds if we haven't received data yet
    const retryInterval = setInterval(requestMessages, 1500);

    return () => {
      clearInterval(retryInterval);
      // Pass the specific handler to off() so we don't accidentally remove global listeners
      socketService.off('getMessages', handleGetMessages);
      socketService.off('newMessage', handleNewMessage);
      
      // Clear active chat room on unmount
      dispatch(setActiveChatRoom(null));
    };
  }, [chatId, dispatch]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    const msg = newMessages[0];
    
    // Emit to backend
    socketService.emit('newMessage', {
      conversationId: chatId,
      content: msg.text,
      attachement: msg.image,
      sender: {
        id: currentUser?.id,
        name: currentUser?.name || 'Me',
        avatar: currentUser?.avatar || '',
      }
    });

    // Note: We do NOT append to local state immediately here to avoid duplicates.
    // It will be appended when we receive the 'newMessage' event back from the server.
  }, [chatId, currentUser]);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: isDarkMode ? '#005c4b' : '#d9fdd3',
            borderBottomRightRadius: 0,
            marginBottom: hp(0.5),
          },
          left: {
            backgroundColor: isDarkMode ? '#202c33' : '#efeeeeff',
            borderBottomLeftRadius: 0,
            marginBottom: hp(0.5),
          },
        }}
        textStyle={{
          right: {
            color: colors.text,
          },
          left: {
            color: colors.text,
          },
        }}
        timeTextStyle={{
          right: {
            color: 'gray',
          },
          left: {
            color: 'gray',
          },
        }}
        renderTicks={(currentMessage: any) => {
          if (currentMessage?.user?._id !== currentUser?.id) return null;

          // Defaulting to 'read' if status is missing to show the blue ticks just like WhatsApp
          const status = currentMessage.status || 'read';

          if (status === 'read') {
            return (
              <View style={{ marginRight: 10, marginBottom: 5 }}>
                <Icon name="checkmark-done" size={16} color="#34B7F1" />
              </View>
            );
          }
          if (status === 'delivered') {
            return (
              <View style={{ marginRight: 10, marginBottom: 5 }}>
                <Icon name="checkmark-done" size={16} color="gray" />
              </View>
            );
          }
          return (
            <View style={{ marginRight: 10, marginBottom: 5 }}>
              <Icon name="checkmark" size={16} color="gray" />
            </View>
          );
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingHorizontal: wp(2),
          paddingVertical: hp(0.5),
        }}
        primaryStyle={{
          alignItems: 'flex-end',
        }}
      />
    );
  };

  const renderComposer = (props: any) => {
    return (
      <View style={styles.inputBox}>
        <TouchableOpacity style={{ padding: 12, paddingRight: 6 }}>
          <Icon name="happy-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <Composer {...props} textInputStyle={styles.textInput} />

        <TouchableOpacity 
          style={{ padding: 12, paddingLeft: 6 }}
          onPress={() => handleAttachmentSelect('Document')}
        >
          <Icon name="attach" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        {(!props.text || props.text.trim().length === 0) && (
          <TouchableOpacity 
            style={{ padding: 12, paddingLeft: 0 }}
            onPress={() => setIsAttachmentModalVisible(true)}
          >
            <Icon
              name="camera-outline"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send
        {...(props as any)}
        containerStyle={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginLeft: 8,
          marginBottom: 0,
        }}
      >
        <View style={styles.sendButton}>
          <MaterialIcons
            name={props.text && props.text.trim().length > 0 ? 'send' : 'mic'}
            size={24}
            color="#fff"
            style={
              props.text && props.text.trim().length > 0
                ? { marginLeft: 4 }
                : {}
            }
          />
        </View>
      </Send>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Image
              source={{ uri: avatar || 'https://i.pravatar.cc/150' }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={styles.headerStatus}>online</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Icon name="videocam" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Icon name="call" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <MaterialIcons name="more-vert" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 50}
          >
            <GiftedChat
              messages={messages}
              onSend={messages => onSend(messages)}
              user={{
                _id: currentUser?.id || 1,
                name: currentUser?.name || 'Me',
                avatar: currentUser?.avatar || '',
              }}
              renderBubble={renderBubble}
              renderInputToolbar={renderInputToolbar}
              renderComposer={renderComposer}
              renderSend={renderSend}
              isSendButtonAlwaysVisible={true}
              isAlignedTop={true}
              // isTyping
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
      
      <ImagePickerModal
        visible={isAttachmentModalVisible}
        onClose={() => setIsAttachmentModalVisible(false)}
        onSelect={handleAttachmentSelect}
      />
    </SafeAreaView>
  );
};

export default ChatRoom;

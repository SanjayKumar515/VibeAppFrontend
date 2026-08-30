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
  const { name, avatar } = route.params;
  const insets = useSafeAreaInsets();

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
    setMessages(INITIAL_MESSAGES);
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );
  }, []);

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
                _id: 1,
                name: 'Me',
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

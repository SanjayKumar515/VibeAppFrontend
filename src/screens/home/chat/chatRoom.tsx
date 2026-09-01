import React, { useState, useCallback, useEffect } from "react";
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  PermissionsAndroid,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Send,
  SendProps,
  Composer,
} from "react-native-gifted-chat";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { setActiveChatRoom } from "../../../store/slices/chatSlice";
import { socketService } from "../../../services/socketService";
import { AppStackProps } from "../../../@types";
import { useTheme } from "../../../theme/ThemeContext";
import getStyles from "./chatRoom.styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { CommonImagePicker, ImagePickerModal } from "../../../components";
import { Colors } from "../../../constant";

type ChatRoomRouteProp = RouteProp<AppStackProps, "ChatRoom">;

const ChatRoom = () => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp<AppStackProps>>();
  const route = useRoute<ChatRoomRouteProp>();
  const { chatId, name, avatar, targetUserId } = route.params;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] =
    useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState("00:00");

  const [targetStatus, setTargetStatus] = useState<{
    isOnline: boolean;
    lastSeen: string | null;
  }>({ isOnline: false, lastSeen: null });

  const [isTargetTyping, setIsTargetTyping] = useState(false);

  const handleMoreOptions = () => {
    Alert.alert(
      name,
      undefined,
      [
        {
          text: "Clear Chat",
          onPress: () => {
            Alert.alert(
              "Clear Chat",
              "All messages in this chat will be deleted. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: () => {
                    socketService.emit("clearChat", { conversationId: chatId });
                    setMessages([]);
                  },
                },
              ]
            );
          },
        },
        {
          text: "Delete Chat",
          onPress: () => {
            Alert.alert(
              "Delete Chat",
              "This chat will be permanently deleted for you.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    socketService.emit("deleteChat", { conversationId: chatId });
                    setMessages([]);
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        },
        {
          text: "Block User",
          onPress: () => {
            Alert.alert(
              "Block User",
              `Block ${name}? They will no longer be able to contact you and will be removed from your contacts.`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Block",
                  style: "destructive",
                  onPress: () => {
                    if (targetUserId) {
                      socketService.emit("blockUser", { userIdToBlock: targetUserId });
                      socketService.emit("deleteChat", { conversationId: chatId });
                      navigation.goBack();
                    }
                  },
                },
              ]
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleAttachmentSelect = async (
    type: "Camera" | "Gallery" | "Document",
  ) => {
    setIsAttachmentModalVisible(false);

    try {
      const result = await CommonImagePicker(type, 1, false);

      if (result) {
        let imageUri = undefined;
        let text = "";

        if (type === "Document") {
          const doc = (result as any)[0];
          text = `📄 ${doc.name || "Document"}`;
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
            name: "Me",
          },
          image: imageUri,
        };

        onSend([newMessage]);
      }
    } catch (error) {
      console.log("Picker Error: ", error);
    }
  };

  const initiateVideoCall = () => {
    if (targetUserId && !targetStatus.isOnline) {
      Alert.alert(
        "User Offline",
        "This user is currently offline. You cannot call them right now.",
      );
      return;
    }

    navigation.navigate("CallScreen", {
      targetUserId: chatId,
      targetName: name,
      isCaller: true,
      isVideo: true,
    });
  };

  const initiateAudioCall = () => {
    if (targetUserId && !targetStatus.isOnline) {
      Alert.alert(
        "User Offline",
        "This user is currently offline. You cannot call them right now.",
      );
      return;
    }

    navigation.navigate("CallScreen", {
      targetUserId: chatId,
      targetName: name,
      isCaller: true,
      isVideo: false,
    });
  };

  useEffect(() => {
    dispatch(setActiveChatRoom(chatId));

    let hasReceivedData = false;

    const handleGetMessages = (response: any) => {
      hasReceivedData = true;

      if (response.success && response.data) {
        const formattedMessages = response.data.map((msg: any) => ({
          _id: msg.id,
          text: msg.content || "",
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.sender.id,
            name: msg.sender.name,
            avatar: msg.sender.avatar,
          },
          image: msg.attachement,
          audio: msg.audio,
        }));

        const sortedMessages = formattedMessages.sort(
          (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        setMessages(sortedMessages);
      }
    };

    const handleNewMessage = (response: any) => {
      if (response.success && response.data) {
        if (response.data.conversationId === chatId) {
          const newMsg = {
            _id: response.data.id,
            text: response.data.content || "",
            createdAt: new Date(response.data.createdAt),
            user: {
              _id: response.data.sender.id,
              name: response.data.sender.name,
              avatar: response.data.sender.avatar,
            },
            image: response.data.attachement,
            audio: response.data.audio,
          };

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [newMsg]),
          );
        }
      }
    };

    socketService.on("newMessage", handleNewMessage);
    socketService.on("getMessages", handleGetMessages);

    const handleUserStatusResult = (data: any) => {
      if (data.userId === targetUserId) {
        setTargetStatus({
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
        });
      }
    };

    const handleUserStatusChanged = (data: any) => {
      if (data.userId === targetUserId) {
        setTargetStatus({
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
        });
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === chatId && data.userId === targetUserId) {
        setIsTargetTyping(true);
      }
    };

    const handleUserStopTyping = (data: any) => {
      if (data.conversationId === chatId && data.userId === targetUserId) {
        setIsTargetTyping(false);
      }
    };

    socketService.on("userStatusResult", handleUserStatusResult);
    socketService.on("userStatusChanged", handleUserStatusChanged);
    socketService.on("userTyping", handleUserTyping);
    socketService.on("userStopTyping", handleUserStopTyping);

    if (targetUserId) {
      socketService.emit("checkUserStatus", {
        userId: targetUserId,
      });
    }

    const requestMessages = () => {
      if (!hasReceivedData) {
        socketService.emit("getMessages", {
          conversationId: chatId,
        });
      }
    };

    requestMessages();

    const retryInterval = setInterval(requestMessages, 1500);

    return () => {
      clearInterval(retryInterval);

      socketService.off("getMessages", handleGetMessages);
      socketService.off("newMessage", handleNewMessage);

      socketService.off("userStatusResult");
      socketService.off("userStatusChanged");
      socketService.off("userTyping");
      socketService.off("userStopTyping");

      dispatch(setActiveChatRoom(null));
    };
  }, [chatId, dispatch]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const msg = newMessages[0];

      socketService.emit("newMessage", {
        conversationId: chatId,
        content: msg.text,
        attachement: msg.image,
        audio: msg.audio,
        sender: {
          id: currentUser?.id,
          name: currentUser?.name || "Me",
          avatar: currentUser?.avatar || "",
        },
      });
    },
    [chatId, currentUser],
  );

  const onInputTextChanged = (text: string) => {
    if (text.length > 0) {
      socketService.emit("typing", {
        conversationId: chatId,
        userId: currentUser?.id,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("stopTyping", {
          conversationId: chatId,
          userId: currentUser?.id,
        });
      }, 1500);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketService.emit("stopTyping", {
        conversationId: chatId,
        userId: currentUser?.id,
      });
    }
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: isDarkMode ? "#005c4b" : "#d9fdd3",
            borderBottomRightRadius: 0,
            marginBottom: hp(0.5),
          },
          left: {
            backgroundColor: isDarkMode ? "#202c33" : "#efeeeeff",
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
            color: "gray",
          },
          left: {
            color: "gray",
          },
        }}
        renderTicks={(currentMessage: any) => {
          if (currentMessage?.user?._id !== currentUser?.id) {
            return null;
          }

          const status = currentMessage.status || "read";

          if (status === "read") {
            return (
              <View style={{ marginRight: 10, marginBottom: 5 }}>
                <Icon name="checkmark-done" size={16} color="#34B7F1" />
              </View>
            );
          }

          if (status === "delivered") {
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

  const renderMessageAudio = (props: any) => {
    const { currentMessage } = props;

    return (
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity>
          <Icon
            name="play"
            size={24}
            color={props.position === "left" ? "#000" : "#fff"}
          />
        </TouchableOpacity>

        <Text
          style={{
            marginLeft: 10,
            color: props.position === "left" ? "#000" : "#fff",
          }}
        >
          Audio Message
        </Text>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: "transparent",
          borderTopWidth: 0,
          paddingHorizontal: wp(2),
          paddingVertical: hp(0.5),
        }}
        primaryStyle={{
          alignItems: "flex-end",
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

        <Composer
          {...props}
          textInputStyle={styles.textInput}
          onTextChanged={onInputTextChanged}
        />

        <TouchableOpacity
          style={{ padding: 12, paddingLeft: 6 }}
          onPress={() => handleAttachmentSelect("Document")}
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >

        <Send
          {...(props as any)}
          containerStyle={{
            justifyContent: "flex-end",
            alignItems: "center",
            marginLeft: 8,
            marginBottom: 0,
          }}
          disabled={!props.text || props.text.trim().length === 0}
        >
          <View
            style={[
              styles.sendButton,
              {
                display:
                  props.text && props.text.trim().length > 0 ? "flex" : "none",
              },
            ]}
          >
            <MaterialIcons
              name="send"
              size={24}
              color="#fff"
              style={{ marginLeft: 4 }}
            />
          </View>
        </Send>

        {(!props.text || props.text.trim().length === 0) && (
          <Pressable
            style={[
              styles.sendButton,
              {
                marginLeft: 8,
                backgroundColor: Colors.PRIMARY[100],
              },
            ]}
          >
            <MaterialIcons name="mic" size={24} color="#fff" />
          </Pressable>
        )}
      </View>
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

            <FastImage
              source={{
                uri: avatar || "https://i.pravatar.cc/150",
              }}
              style={styles.headerAvatar}
            />

            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{name}</Text>

              {targetUserId ? (
                <Text
                  style={[
                    styles.headerStatus,
                    {
                      color: targetStatus.isOnline ? "#25D366" : "gray",
                    },
                  ]}
                >
                  {targetStatus.isOnline
                    ? "Online"
                    : targetStatus.lastSeen
                    ? `Last seen at ${new Date(
                        targetStatus.lastSeen,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Offline"}
                </Text>
              ) : (
                <Text style={styles.headerStatus}>online</Text>
              )}
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={initiateVideoCall}
              >
                <Icon name="videocam" size={24} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={initiateAudioCall}
              >
                <Icon name="call" size={20} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={handleMoreOptions}>
                <MaterialIcons name="more-vert" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom : 50}
          >
            <GiftedChat
              messages={messages}
              onSend={(messages) => onSend(messages)}
              user={{
                _id: currentUser?.id || 1,
                name: currentUser?.name || "Me",
                avatar: currentUser?.avatar || "",
              }}
              renderBubble={renderBubble}
              renderInputToolbar={renderInputToolbar}
              renderComposer={renderComposer}
              renderSend={renderSend}
              isSendButtonAlwaysVisible={true}
              isAlignedTop={true}
              renderMessageAudio={renderMessageAudio}
              isTyping={isTargetTyping}
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

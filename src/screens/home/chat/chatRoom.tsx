import React, { useState, useCallback, useEffect } from "react";
import FastImage from "react-native-fast-image";
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
  TextInput,
  AppState,
  FlatList,
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
  MessageText,
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
import Modal from "react-native-modal";
import { Colors } from "../../../constant";
import EmojiPicker from "rn-emoji-keyboard";
import { useCommonAlertModal } from "../../../components";

type ChatRoomRouteProp = RouteProp<AppStackProps, "ChatRoom">;

interface CustomMessage extends IMessage {
  status?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

const ChatRoom = () => {
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const navigation = useNavigation<NavigationProp<AppStackProps>>();
  const route = useRoute<ChatRoomRouteProp>();
  const { chatId, name, avatar, targetUserId } = route.params;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { showAlert, hideAlert } = useCommonAlertModal();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [text, setText] = useState("");
  const [editingMessage, setEditingMessage] = useState<CustomMessage | null>(
    null,
  );

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] =
    useState(false);

  const [selectedMessage, setSelectedMessage] = useState<CustomMessage | null>(
    null,
  );
  const [isMessageOptionsVisible, setIsMessageOptionsVisible] = useState(false);
  const [isForwardModalVisible, setIsForwardModalVisible] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (isForwardModalVisible) {
      const handleGetConversations = (response: any) => {
        setConversations(response.data);
      };
      socketService.on("getConversations", handleGetConversations);
      socketService.emit("getConversations", {});

      return () => {
        socketService.off("getConversations", handleGetConversations);
      };
    }
  }, [isForwardModalVisible]);

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
              ],
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
                    socketService.emit("deleteChat", {
                      conversationId: chatId,
                    });
                    setMessages([]);
                    navigation.goBack();
                  },
                },
              ],
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
                      socketService.emit("blockUser", {
                        userIdToBlock: targetUserId,
                      });
                      socketService.emit("deleteChat", {
                        conversationId: chatId,
                      });
                      navigation.goBack();
                    }
                  },
                },
              ],
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const onSend = useCallback(
    (newMessages: CustomMessage[] = []) => {
      const msg = newMessages[0];

      if (editingMessage) {
        console.log("Emitting editMessage:", { messageId: String(editingMessage._id), content: msg.text, conversationId: String(chatId) });
        socketService.emit("editMessage", {
          messageId: String(editingMessage._id),
          content: msg.text,
          conversationId: String(chatId),
        });

        // Optimistic update
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m._id === editingMessage._id
              ? { ...m, text: msg.text, isEdited: true }
              : m,
          ),
        );

        setEditingMessage(null);
        setText("");

      } else {
        const tempId = "temp-" + Date.now();
        const pendingMsg: CustomMessage = {
          _id: tempId,
          text: msg.text,
          createdAt: new Date(),
          user: {
            _id: currentUser?.id as string,
            name: currentUser?.name || "Me",
            avatar: currentUser?.avatar || "",
          },
          status: "pending",
          image: msg.image,
          audio: msg.audio,
        };

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [pendingMsg]),
        );

        socketService.emit("newMessage", {
          conversationId: chatId,
          content: msg.text,
          attachement: msg.image,
          audio: msg.audio,
          tempId: tempId,
          sender: {
            id: currentUser?.id,
            name: currentUser?.name || "Me",
            avatar: currentUser?.avatar || "",
          },
        });
        setText("");
      }
    },
    [chatId, currentUser, editingMessage],
  );

  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleAttachmentSelect = useCallback(
    async (type: "Camera" | "Gallery" | "Document") => {
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

          const newMessage: CustomMessage = {
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
    },
    [onSend],
  );

  const initiateVideoCall = () => {
    if (!targetUserId || !targetStatus.isOnline) {
      showAlert(
        "Offline",
        "This user is currently offline. You cannot call them right now.",
        "OK",
        () => {
          hideAlert();
        },
      );
      return;
    }

    navigation.navigate("CallScreen", {
      targetUserId: targetUserId || "",
      targetName: name,
      isCaller: true,
      isVideo: true,
    });
  };

  const initiateAudioCall = () => {
    if (!targetUserId || !targetStatus.isOnline) {
      showAlert(
        "Offline",
        "This user is currently offline. You cannot call them right now.",
        "OK",
        () => {
          hideAlert();
        },
      );
      return;
    }

    navigation.navigate("CallScreen", {
      targetUserId: targetUserId || "",
      targetName: name,
      isCaller: true,
      isVideo: false,
    });
  };

  useEffect(() => {
    dispatch(setActiveChatRoom(chatId));
    socketService.emit("markAsRead", { conversationId: chatId });

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
          status: msg.status || "sent",
          isEdited: msg.isEdited || false,
          isDeleted: msg.isDeleted || false,
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
            status: response.data.status || "sent",
            isEdited: response.data.isEdited || false,
            isDeleted: response.data.isDeleted || false,
          };

          setMessages((previousMessages) => {
            if (response.data.sender.id === currentUser?.id) {
              // Find the first pending message that matches
              let foundPending = false;
              const filtered = previousMessages.filter((m) => {
                if (
                  !foundPending &&
                  m.status === "pending" &&
                  m.text === newMsg.text
                ) {
                  foundPending = true;
                  return false; // remove this pending message
                }
                return true;
              });
              return GiftedChat.append(filtered, [newMsg]);
            }
            return GiftedChat.append(previousMessages, [newMsg]);
          });

          if (response.data.sender.id !== currentUser?.id) {
            socketService.emit("markAsRead", { conversationId: chatId });
          }
        }
      }
    };

    const handleMessagesRead = (data: any) => {
      if (data.conversationId === chatId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.user._id !== data.readerId && msg.status !== "read"
              ? { ...msg, status: "read" }
              : msg,
          ),
        );
      }
    };

    const handleMessagesDelivered = (data: any) => {
      if (data.conversationId === chatId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId && msg.status === "sent"
              ? { ...msg, status: "delivered" }
              : msg,
          ),
        );
      }
    };

    const handleMessageEdited = (data: any) => {
      if (data.conversationId === chatId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, text: data.content, isEdited: true }
              : msg,
          ),
        );
      }
    };

    const handleMessageDeleted = (data: any) => {
      if (data.conversationId === chatId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  text: "🚫 This message was deleted",
                  isDeleted: true,
                  image: undefined,
                  audio: undefined,
                }
              : msg,
          ),
        );
      }
    };

    socketService.on("newMessage", handleNewMessage);
    socketService.on("getMessages", handleGetMessages);
    socketService.on("messagesRead", handleMessagesRead);
    socketService.on("messagesDelivered", handleMessagesDelivered);
    socketService.on("messageEdited", handleMessageEdited);
    socketService.on("messageDeleted", handleMessageDeleted);

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

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          socketService.emit("getMessages", { conversationId: chatId });
          socketService.emit("markAsRead", { conversationId: chatId });
        }
      },
    );

    return () => {
      clearInterval(retryInterval);
      appStateSubscription.remove();

      socketService.off("getMessages", handleGetMessages);
      socketService.off("newMessage", handleNewMessage);
      socketService.off("messagesRead", handleMessagesRead);
      socketService.off("messagesDelivered", handleMessagesDelivered);
      socketService.off("messageEdited", handleMessageEdited);
      socketService.off("messageDeleted", handleMessageDeleted);

      socketService.off("userStatusResult");
      socketService.off("userStatusChanged");
      socketService.off("userTyping");
      socketService.off("userStopTyping");

      dispatch(setActiveChatRoom(null));
    };
  }, [chatId, dispatch]);

  const handleTyping = (text: string) => {
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

  const renderBubble = useCallback(
    (props: any) => {
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
              color: props.currentMessage?.isDeleted ? "gray" : colors.text,
              fontStyle: props.currentMessage?.isDeleted ? "italic" : "normal",
            },
            left: {
              color: props.currentMessage?.isDeleted ? "gray" : colors.text,
              fontStyle: props.currentMessage?.isDeleted ? "italic" : "normal",
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

            const status = currentMessage.status || "sent";

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

            if (status === "pending") {
              return (
                <View style={{ marginRight: 10, marginBottom: 5 }}>
                  <Icon name="time-outline" size={16} color="gray" />
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
    },
    [isDarkMode, colors, currentUser, hp],
  );

  const renderMessageAudio = useCallback((props: any) => {
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
  }, []);

  const renderInputToolbar = useCallback(
    (props: any) => {
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
    },
    [wp, hp],
  );

  const renderComposer = useCallback(
    (props: any) => {
      return (
        <View style={styles.inputBox}>
          <TouchableOpacity
            style={{ padding: 12, paddingRight: 6 }}
            onPress={() => {
              Keyboard.dismiss();
              setIsEmojiPickerOpen(true);
            }}
          >
            <Icon name="happy-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <Composer
            {...props}
            textInputStyle={styles.textInput}
            // The prop onTextChanged handles the internal composer state update, we also hook into it from GiftedChat's onInputTextChanged
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
    },
    [
      styles,
      colors,
      setIsEmojiPickerOpen,
      handleAttachmentSelect,
      setIsAttachmentModalVisible,
    ],
  );

  const renderSend = useCallback(
    (props: SendProps<CustomMessage>) => {
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
                    props.text && props.text.trim().length > 0
                      ? "flex"
                      : "none",
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
    },
    [styles, colors],
  );

  return (
    <SafeAreaView style={styles.container}>
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

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleMoreOptions}
            >
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
            text={text}
            renderMessageText={(props) => (
              <MessageText
                {...props}
                currentMessage={{
                  ...props.currentMessage!,
                  text: (props.currentMessage as any)?.isEdited
                    ? `${props.currentMessage!.text} (edited)`
                    : props.currentMessage!.text,
                }}
              />
            )}
            onLongPressMessage={(context: any, message: any) => {
              if (!(message as any).isDeleted) {
                setSelectedMessage(message);
                setIsMessageOptionsVisible(true);
              }
            }}
            renderBubble={renderBubble}
            renderInputToolbar={() => null} // Hide default input toolbar completely
            isAlignedTop={true}
            renderMessageAudio={renderMessageAudio}
            isTyping={isTargetTyping}
            // bottomOffset={Platform.OS === "ios" ? insets.bottom : 0}
          />

          {/* Fully Custom Input Footer */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "transparent",
              borderTopWidth: 0,
              paddingHorizontal: wp(2),
              paddingVertical: hp(0.5),
              alignItems: "flex-end",
            }}
          >
            <View style={styles.inputBox}>
              <TouchableOpacity
                style={{ padding: 12, paddingRight: 6 }}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsEmojiPickerOpen(true);
                }}
              >
                <Icon
                  name="happy-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                multiline
                value={text}
                onChangeText={(newText) => {
                  setText(newText);
                  handleTyping(newText);
                }}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={{ padding: 12, paddingLeft: 6 }}
                onPress={() => handleAttachmentSelect("Document")}
              >
                <Icon name="attach" size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              {(!text || text.trim().length === 0) && (
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

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {text && text.trim().length > 0 ? (
                <TouchableOpacity
                  style={[styles.sendButton, { marginLeft: 8 }]}
                  onPress={() => {
                    onSend([
                      {
                        _id: Math.round(Math.random() * 1000000),
                        text: text.trim(),
                        createdAt: new Date(),
                        user: {
                          _id: currentUser?.id || 1,
                          name: currentUser?.name || "Me",
                          avatar: currentUser?.avatar || "",
                        },
                      },
                    ]);
                  }}
                >
                  <MaterialIcons
                    name="send"
                    size={24}
                    color="#fff"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              ) : (
                <Pressable
                  style={[
                    styles.sendButton,
                    { marginLeft: 8, backgroundColor: Colors.PRIMARY[100] },
                  ]}
                >
                  <MaterialIcons name="mic" size={24} color="#fff" />
                </Pressable>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <EmojiPicker
        onEmojiSelected={(emoji) => {
          setIsEmojiPickerOpen(false); // Close picker after sending

          const newMessage: CustomMessage = {
            _id: Math.round(Math.random() * 1000000),
            text: emoji.emoji,
            createdAt: new Date(),
            user: {
              _id: currentUser?.id || 1,
              name: currentUser?.name || "Me",
              avatar: currentUser?.avatar || "",
            },
          };

          onSend([newMessage]);
        }}
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        theme={{
          backdrop: "#16161888",
          knob: isDarkMode ? colors.border : "#e2e8f0",
          container: isDarkMode ? colors.card : "#ffffff",
          header: isDarkMode ? colors.text : "#1e293b",
          skinTonesContainer: isDarkMode ? "#2c2c2e" : "#e2e8f0",
          category: {
            icon: isDarkMode ? colors.textSecondary : "#94a3b8",
            iconActive: colors.PRIMARY[100],
            container: isDarkMode ? colors.card : "#ffffff",
            containerActive: isDarkMode ? "#2c2c2e" : "#e2e8f0",
          },
        }}
      />

      <ImagePickerModal
        visible={isAttachmentModalVisible}
        onClose={() => setIsAttachmentModalVisible(false)}
        onSelect={handleAttachmentSelect}
      />

      {/* Message Options Modal */}
      <Modal
        isVisible={isMessageOptionsVisible}
        onBackdropPress={() => setIsMessageOptionsVisible(false)}
        onBackButtonPress={() => setIsMessageOptionsVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 15,
            }}
          >
            Message Options
          </Text>

          {selectedMessage?.user._id === currentUser?.id && (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                onPress={() => {
                  setIsMessageOptionsVisible(false);
                  setEditingMessage(selectedMessage);
                  setText(selectedMessage?.text || "");
                }}
              >
                <Icon
                  name="pencil"
                  size={24}
                  color={colors.text}
                  style={{ marginRight: 15 }}
                />
                <Text style={{ fontSize: 16, color: colors.text }}>
                  Edit Message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                onPress={() => {
                  setIsMessageOptionsVisible(false);
                  Alert.alert(
                    "Delete Message",
                    "Are you sure you want to delete this message?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          console.log("Emitting deleteMessage:", { messageId: String(selectedMessage?._id), conversationId: String(chatId) });
                          socketService.emit("deleteMessage", {
                            messageId: String(selectedMessage?._id),
                            conversationId: String(chatId),
                          });

                          setMessages((prevMessages) =>
                            prevMessages.map((m) =>
                              m._id === selectedMessage?._id
                                ? {
                                    ...m,
                                    text: "🚫 This message was deleted",
                                    isDeleted: true,
                                    image: undefined,
                                    audio: undefined,
                                  }
                                : m,
                            ),
                          );
                        },
                      },
                    ],
                  );
                }}
              >
                <Icon
                  name="trash"
                  size={24}
                  color="#f44336"
                  style={{ marginRight: 15 }}
                />
                <Text style={{ fontSize: 16, color: "#f44336" }}>
                  Delete for Everyone
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
            }}
            onPress={() => {
              setIsMessageOptionsVisible(false);
              setTimeout(() => {
                setIsForwardModalVisible(true);
              }, 400); // slight delay to allow the first modal to close
            }}
          >
            <Icon
              name="arrow-forward"
              size={24}
              color={colors.text}
              style={{ marginRight: 15 }}
            />
            <Text style={{ fontSize: 16, color: colors.text }}>
              Forward Message
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              marginTop: 10,
            }}
            onPress={() => setIsMessageOptionsVisible(false)}
          >
            <Icon
              name="close"
              size={24}
              color={colors.textSecondary}
              style={{ marginRight: 15 }}
            />
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Forward Modal */}
      <Modal
        isVisible={isForwardModalVisible}
        onBackdropPress={() => setIsForwardModalVisible(false)}
        onBackButtonPress={() => setIsForwardModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: hp(70),
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 15,
            }}
          >
            Forward to...
          </Text>

          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                onPress={() => {
                  const tempId = "temp-" + Date.now();
                  socketService.emit("newMessage", {
                    conversationId: item.id,
                    content: selectedMessage?.text || "",
                    attachement: selectedMessage?.image,
                    audio: selectedMessage?.audio,
                    tempId: tempId,
                    sender: {
                      id: currentUser?.id,
                      name: currentUser?.name || "Me",
                      avatar: currentUser?.avatar || "",
                    },
                  });
                  setIsForwardModalVisible(false);

                  showAlert(
                    "Success",
                    "Message forwarded successfully",
                    "OK",
                    () => {
                      hideAlert();
                    },
                  );
                }}
              >
                <FastImage
                  source={{
                    uri: item.user.avatar || "https://via.placeholder.com/150",
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {item.user.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                No conversations found
              </Text>
            }
          />

          <TouchableOpacity
            style={{ paddingVertical: 12, alignItems: "center", marginTop: 10 }}
            onPress={() => setIsForwardModalVisible(false)}
          >
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatRoom;

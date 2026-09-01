import FastImage from "react-native-fast-image";
import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { AppStackProps } from "../../../@types";
import { useTheme } from "../../../theme/ThemeContext";
import getStyles from "./dashboard.styles";
import { socketService } from "../../../services/socketService";
import { apiService } from "../../../services/apiService";

type NavigationProp = NativeStackNavigationProp<AppStackProps, "HomeTabs">;

import Skeleton from "react-native-reanimated-skeleton";
import { TextView, CommonImagePicker, CommonLoader } from "../../../components";

const SkeletonItem = ({ colors, styles }: any) => {
  return (
    <Skeleton
      containerStyle={styles.chatRow}
      isLoading={true}
      boneColor={colors.border}
      highlightColor={colors.background}
      layout={[
        {
          key: "avatar",
          width: 50,
          height: 50,
          borderRadius: 25,
          marginRight: 15,
        },
        {
          key: "chatDetails",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          children: [
            {
              key: "chatHeader",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              children: [
                { key: "name", width: 120, height: 16, borderRadius: 4 },
                { key: "time", width: 40, height: 14, borderRadius: 4 },
              ],
            },
            { key: "message", width: 200, height: 14, borderRadius: 4 },
          ],
        },
      ]}
    />
  );
};

const Dashboard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const unreadCounts = useSelector(
    (state: RootState) => state.chat.unreadCounts,
  );
  const [conversations, setConversations] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let hasReceivedData = false;

      // Listen to response
      const handleGetConversations = (response: any) => {
        hasReceivedData = true;
        setIsLoading(false);
        if (response.success) {
          const sorted = response.data.sort((a: any, b: any) => {
            const timeA = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt).getTime()
              : 0;
            const timeB = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt).getTime()
              : 0;
            return timeB - timeA;
          });
          setConversations(sorted);
        }
      };

      // Listen to incoming new conversations
      const handleNewConversation = (response: any) => {
        if (response.success && response.data) {
          setConversations((prev) => {
            // Check if it already exists
            const exists = prev.find((c) => c._id === response.data._id);
            if (!exists) {
              return [response.data, ...prev];
            }
            return prev;
          });
        }
      };

      // Listen to incoming messages to update lastMessage and reorder
      const handleNewMessage = (response: any) => {
        if (response.success && response.data) {
          setConversations((prev) => {
            const msg = response.data;
            const convIndex = prev.findIndex(
              (c) => c._id === msg.conversationId,
            );

            if (convIndex > -1) {
              // Update last message and move to top
              const updatedConv = {
                ...prev[convIndex],
                lastMessage: {
                  content: msg.content,
                  createdAt: msg.createdAt,
                },
              };
              const newConvs = [...prev];
              newConvs.splice(convIndex, 1);
              newConvs.unshift(updatedConv);
              return newConvs;
            }
            return prev;
          });
        }
      };

      socketService.on("getConversations", handleGetConversations);
      socketService.on("newConversation", handleNewConversation);
      socketService.on("newMessage", handleNewMessage);

      const requestConversations = () => {
        if (!hasReceivedData) {
          socketService.emit("getConversations", {});
        }

        // Fetch statuses as well to show rings
        apiService
          .get("/api/status")
          .then((res) => {
            if (res.success && res.data && res.data.recentUpdates) {
              setStatuses(res.data.recentUpdates);
            }
          })
          .catch((err) =>
            console.log("Failed to fetch statuses for dashboard:", err),
          );
      };

      // Initial request
      requestConversations();

      // Retry every 1.5 seconds if we haven't received data yet
      // This bulletproofs against socket connection delays or dropped events
      const retryInterval = setInterval(requestConversations, 1500);

      return () => {
        clearInterval(retryInterval);
        socketService.off("getConversations", handleGetConversations);
        socketService.off("newConversation", handleNewConversation);
        socketService.off("newMessage", handleNewMessage);
      };
    }, []),
  );

  const renderItem = ({ item }: { item: any }) => {
    // For direct chats, find the other participant
    const otherParticipant = item.participants?.find(
      (p: any) => p._id !== currentUser?.id,
    );

    const displayName =
      item.type === "direct"
        ? otherParticipant?.name || "Unknown User"
        : item.name;
    const displayAvatar =
      item.type === "direct"
        ? otherParticipant?.avatar || "https://i.pravatar.cc/150"
        : item.avatar || "https://i.pravatar.cc/150";
    const lastMsgText = item.lastMessage?.content || "No messages yet";
    const timeText = item.lastMessage?.createdAt
      ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const isMyMessage =
      item.lastMessage?.sender?._id === currentUser?.id ||
      item.lastMessage?.sender?.id === currentUser?.id ||
      item.lastMessage?.sender === currentUser?.id;

    // Defaulting to 'read' if status is missing in the data to show the blue ticks just like WhatsApp
    const messageStatus = item.lastMessage?.status || "read";

    const renderStatusIcon = () => {
      if (!isMyMessage || !item.lastMessage) return null;

      if (messageStatus === "read") {
        return (
          <Icon
            name="checkmark-done"
            size={16}
            color="#34B7F1"
            style={{ marginRight: 4 }}
          />
        );
      }
      if (messageStatus === "delivered") {
        return (
          <Icon
            name="checkmark-done"
            size={16}
            color="gray"
            style={{ marginRight: 4 }}
          />
        );
      }
      return (
        <Icon
          name="checkmark"
          size={16}
          color="gray"
          style={{ marginRight: 4 }}
        />
      );
    };

    // Determine if we should show a status ring
    const userStatus = otherParticipant
      ? statuses.find((s: any) => s.user.id === otherParticipant._id)
      : null;
    const hasUnreadStatus = userStatus ? !userStatus.allRead : false;
    const hasReadStatus = userStatus ? userStatus.allRead : false;

    const handleDeleteChat = () => {
      Alert.alert(
        "Delete Chat",
        `Are you sure you want to delete your chat with ${displayName}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              socketService.emit("deleteChat", { conversationId: item._id });
              setConversations((prev) =>
                prev.filter((c) => c._id !== item._id),
              );
            },
          },
        ],
      );
    };

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() =>
          navigation.navigate("ChatRoom", {
            chatId: item._id,
            name: displayName,
            avatar: displayAvatar,
            targetUserId: otherParticipant?._id,
          })
        }
        onLongPress={handleDeleteChat}
        delayLongPress={500}
      >
        <View
          style={[
            hasUnreadStatus
              ? {
                  borderWidth: 2,
                  borderColor: colors.tabBarActive,
                  padding: 2,
                  borderRadius: 30,
                }
              : {},
            hasReadStatus && !hasUnreadStatus
              ? {
                  borderWidth: 2,
                  borderColor: colors.border,
                  padding: 2,
                  borderRadius: 30,
                }
              : {},
          ]}
        >
          <FastImage source={{ uri: displayAvatar }} style={styles.avatar} />
        </View>
        <View style={styles.chatDetails}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{displayName}</Text>
            <Text style={styles.chatTime}>{timeText}</Text>
          </View>
          <View style={styles.chatFooter}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                marginRight: 8,
              }}
            >
              {renderStatusIcon()}
              <Text style={styles.chatMessage} numberOfLines={1}>
                {lastMsgText}
              </Text>
            </View>
            {unreadCounts[item._id] > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCounts[item._id]}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Custom WhatsApp Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VibeApp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="camera-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="search-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("Profile" as never)}
          >
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonItem colors={colors} styles={styles} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>
                No conversations yet.
              </Text>
            </View>
          }
        />
      )}

      {/* WhatsApp FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Contacts" as never)}
      >
        <MaterialIcons name="chat" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Dashboard;

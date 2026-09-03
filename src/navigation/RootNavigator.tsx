import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Alert, AppState } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { signIn, signOut } from "../store/slices/authSlice";
import { incrementUnread } from "../store/slices/chatSlice";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { apiService } from "../services/apiService";
import { socketService } from "../services/socketService";
import notifee, { EventType } from "@notifee/react-native";
import { storage } from "../utils/storage";
import { navigationRef } from "../../App";
import NetInfo from "@react-native-community/netinfo";

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const { isAuthenticated, user, token } = useSelector(
    (state: RootState) => state.auth,
  );
  const activeChatRoomId = useSelector(
    (state: RootState) => state.chat.activeChatRoomId,
  );
  const dispatch = useDispatch();

  const activeChatRoomIdRef = useRef(activeChatRoomId);
  const userRef = useRef(user);

  useEffect(() => {
    activeChatRoomIdRef.current = activeChatRoomId;
    userRef.current = user;
  }, [activeChatRoomId, user]);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && token) {
        socketService.connect(token);
        socketService.emit("userOnline", {});
      } else {
        socketService.emit("userOffline", {}); // Attempt to send before disconnect
        socketService.disconnect();
      }
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, [token]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await storage.getItem<string>("token");
        const user = await storage.getItem<any>("user");

        if (token && user) {
          // Connect socket with stored token
          socketService.connect(token);

          dispatch(
            signIn({
              user,
              token,
            }),
          );
        }
      } catch (error) {
        console.log("Error loading session from storage:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadSession();

    // Global listener for new messages to increment unread badge
    const handleNewMessage = (response: any) => {
      if (response.success && response.data) {
        if (response.data.sender?.id !== userRef.current?.id) {
          dispatch(incrementUnread(response.data.conversationId));
          socketService.emit("messageDelivered", { 
            messageId: response.data.id, 
            conversationId: response.data.conversationId 
          });
        }

        // Show local notification if not in the active chat and not sent by me
        if (
          activeChatRoomIdRef.current !== response.data.conversationId &&
          response.data.sender?.id !== userRef.current?.id
        ) {
          Alert.alert(
            "New Message",
            `${response.data.sender?.name || "Someone"} sent you a message.`,
          );
        }
      }
    };

    socketService.on("newMessage", handleNewMessage);

    const handleIncomingCall = (data: any) => {
      const fromId = data.callerId || data.from;
      // Ignore call events triggered by ourselves (since it's broadcasted to the conversation room)
      if (fromId === userRef.current?.id) return;

      const navigateWhenReady = () => {
        if (navigationRef.isReady()) {
          navigationRef.navigate("IncomingCallScreen", {
            callerId: fromId,
            callerName: data.callerName || data.name || "Unknown",
            callerAvatar: data.callerAvatar || data.avatar || "",
            signal: data.signal,
          });
        } else {
          setTimeout(navigateWhenReady, 100);
        }
      };
      navigateWhenReady();
    };

    socketService.on("incomingCall", handleIncomingCall);

    const handleNotifeeCall = (data: any) => {
      let signal = null;
      try {
        signal = data.signalData ? JSON.parse(data.signalData) : null;
      } catch (e) {}
      
      const navigateWhenReady = () => {
        if (navigationRef.isReady()) {
          navigationRef.navigate("IncomingCallScreen", {
            callerId: data.callerId,
            callerName: data.callerName || "Unknown",
            callerAvatar: data.callerAvatar || "",
            signal: signal,
          });
        } else {
          setTimeout(navigateWhenReady, 100);
        }
      };
      navigateWhenReady();
    };

    notifee.getInitialNotification().then((initialNotification) => {
      if (
        initialNotification &&
        initialNotification.notification.data?.type === "INCOMING_CALL"
      ) {
        handleNotifeeCall(initialNotification.notification.data);
      }
    });

    const unsubscribeForeground = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (
          type === EventType.PRESS &&
          detail.notification?.data?.type === "INCOMING_CALL"
        ) {
          handleNotifeeCall(detail.notification.data);
        }
      },
    );

    return () => {
      socketService.off("newMessage", handleNewMessage);
      socketService.off("incomingCall", handleIncomingCall);
      unsubscribeForeground();
    };
  }, [dispatch]);

  // AppState listener for online/offline presence tracking
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        socketService.emit("userOnline", {});
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        socketService.emit("userOffline", {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#0bb2cf" />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;

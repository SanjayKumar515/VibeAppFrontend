import { Alert } from "react-native";

import { requestNotifications, RESULTS } from "react-native-permissions";

import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from "@react-native-firebase/messaging";

const messagingInstance = getMessaging();

/**
 * Request notification permission
 * iOS + Android 13+
 */
export const requestUserPermission = async () => {
  try {
    const { status, settings } = await requestNotifications([
      "alert",
      "badge",
      "sound",
    ]);

    console.log("Notification permission:", status);
    console.log("Notification settings:", settings);

    if (status === RESULTS.GRANTED) {
      console.log("Notification permission granted");

      const token = await getFcmToken();

      return token;
    }

    console.log("Notification permission not granted");

    return null;
  } catch (error) {
    console.error("Notification permission error:", error);

    return null;
  }
};

/**
 * Get FCM Token
 */
export const getFcmToken = async () => {
  try {
    const token = await getToken(messagingInstance);

    if (token) {
      console.log("================================");
      console.log("FCM TOKEN:");
      console.log(token);
      console.log("================================");

      // TODO:
      // Send token to your backend
      //
      // Example:
      // await saveFcmToken(token);

      return token;
    }

    console.log("FCM token not available");

    return null;
  } catch (error) {
    console.error("FCM token error:", error);

    return null;
  }
};

/**
 * Notification listeners
 */
export const notificationListener = () => {
  /**
   * FOREGROUND
   *
   * App is currently open
   */
  const unsubscribeMessage = onMessage(
    messagingInstance,
    async (remoteMessage) => {
      console.log("================================");

      console.log("FOREGROUND NOTIFICATION:");

      console.log(JSON.stringify(remoteMessage, null, 2));

      console.log("================================");

      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || "Notification",

          remoteMessage.notification.body || "You have a new message",
        );
      }
    },
  );

  /**
   * BACKGROUND
   *
   * App is in background and user
   * taps the notification
   */
  const unsubscribeOpened = onNotificationOpenedApp(
    messagingInstance,
    (remoteMessage) => {
      console.log("================================");

      console.log("NOTIFICATION OPENED:");

      console.log(JSON.stringify(remoteMessage, null, 2));

      console.log("================================");

      // Example:
      //
      // const chatId =
      //   remoteMessage.data?.chatId;
      //
      // navigation.navigate('Chat', {
      //   chatId,
      // });
    },
  );

  /**
   * QUIT STATE
   *
   * App was completely closed and
   * opened by tapping notification
   */
  getInitialNotification(messagingInstance)
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("================================");

        console.log("NOTIFICATION OPENED FROM QUIT:");

        console.log(JSON.stringify(remoteMessage, null, 2));

        console.log("================================");

        // Example:
        //
        // const chatId =
        //   remoteMessage.data?.chatId;
        //
        // navigation.navigate('Chat', {
        //   chatId,
        // });
      }
    })
    .catch((error) => {
      console.error("Initial notification error:", error);
    });

  /**
   * Cleanup
   */
  return () => {
    unsubscribeMessage();
    unsubscribeOpened();
  };
};

import { AppRegistry } from "react-native";

import {
  getMessaging,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";

import notifee, { AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native';
import App from "./App";
import { name as appName } from "./app.json";

const messagingInstance = getMessaging();

setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
  console.log("BACKGROUND MESSAGE:", JSON.stringify(remoteMessage, null, 2));

  if (remoteMessage.data && remoteMessage.data.type === 'INCOMING_CALL') {
    await notifee.createChannel({
      id: 'calls_v2',
      name: 'Incoming Calls',
      sound: 'default',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: 'Incoming Call',
      body: `${remoteMessage.data.callerName} is calling you`,
      data: remoteMessage.data,
      android: {
        channelId: 'calls_v2',
        importance: AndroidImportance.HIGH,
        category: AndroidCategory.CALL,
        fullScreenAction: {
          id: 'default',
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: 'Answer',
            pressAction: { id: 'answer', launchActivity: 'default' },
          },
          {
            title: 'Decline',
            pressAction: { id: 'decline' },
          },
        ],
      },
    });
  } else if (remoteMessage.data && remoteMessage.data.type === 'NEW_MESSAGE') {
    await notifee.createChannel({
      id: 'messages',
      name: 'Messages',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: remoteMessage.data.senderName || 'New Message',
      body: remoteMessage.data.content || 'You received a new message',
      data: remoteMessage.data,
      android: {
        channelId: 'messages',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'decline') {
    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);

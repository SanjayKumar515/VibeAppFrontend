import React, { useMemo } from "react";
import { Platform } from "react-native";
import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";
import { HomeStackProps } from "../@types";
import { Dashboard, Profile, Settings, Status, Communities } from "../screens";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Fonts } from "../constant";
import { useTheme } from "../theme/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const Tab = createNativeBottomTabNavigator<HomeStackProps>();

const HomeStack = () => {
  const { colors } = useTheme();
  
  const unreadCounts = useSelector((state: RootState) => state.chat.unreadCounts);
  const totalUnread = useMemo(() => {
    return Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);
  }, [unreadCounts]);

  // Generate both active and inactive icon image sources synchronously for Android native tabs
  const icons = useMemo(() => {
    const inactiveColor = colors.tabBarInactive;
    const activeColor = colors.tabBarActive;

    if (Platform.OS === "ios") return null;

    return {
      chatIconActive: MaterialIcons.getImageSourceSync("chat", 24, activeColor),
      chatIconInactive: MaterialIcons.getImageSourceSync(
        "chat",
        24,
        inactiveColor,
      ),
      statusIconActive: Icon.getImageSourceSync(
        "radio-button-on",
        24,
        activeColor,
      ),
      statusIconInactive: Icon.getImageSourceSync(
        "radio-button-on",
        24,
        inactiveColor,
      ),
      communityIconActive: Icon.getImageSourceSync("people", 24, activeColor),
      communityIconInactive: Icon.getImageSourceSync(
        "people",
        24,
        inactiveColor,
      ),
      callsIconActive: Icon.getImageSourceSync("call", 24, activeColor),
      callsIconInactive: Icon.getImageSourceSync("call", 24, inactiveColor),
    };
  }, [colors.tabBarInactive, colors.tabBarActive]);

  return (
    <Tab.Navigator
      labeled={true}
      tabBarStyle={{ backgroundColor: colors.tabBarBackground }}
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        // tabBarInactiveTintColor is not supported by @bottom-tabs/react-navigation in NativeBottomTabNavigationOptions
      }}
    >
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ focused }) =>
            Platform.OS === "ios"
              ? { sfSymbol: "message.fill" }
              : focused
              ? icons?.chatIconActive
              : icons?.chatIconInactive,
          tabBarBadge: totalUnread > 0 ? totalUnread.toString() : undefined,
        }}
      />
      <Tab.Screen
        name="Status"
        component={Status}
        options={{
          tabBarLabel: "Updates",
          tabBarIcon: ({ focused }) =>
            Platform.OS === "ios"
              ? { sfSymbol: "circle.dashed" }
              : focused
              ? icons?.statusIconActive
              : icons?.statusIconInactive,
        }}
      />
      <Tab.Screen
        name="Communities"
        component={Communities}
        options={{
          tabBarLabel: "Communities",
          tabBarIcon: ({ focused }) =>
            Platform.OS === "ios"
              ? { sfSymbol: "person.3.fill" }
              : focused
              ? icons?.communityIconActive
              : icons?.communityIconInactive,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: "Calls",
          tabBarIcon: ({ focused }) =>
            Platform.OS === "ios"
              ? { sfSymbol: "phone.fill" }
              : focused
              ? icons?.callsIconActive
              : icons?.callsIconInactive,
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeStack;

import React from "react";
import FastImage from 'react-native-fast-image';
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { socketService } from "../../../services/socketService";

type RootStackParamList = {
  IncomingCallScreen: undefined;
  CallScreen: {
    targetUserId: string;
    targetName: string;
    isCaller: boolean;
    incomingSignal?: any;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type IncomingCallRouteProp = RouteProp<
  RootStackParamList,
  "IncomingCallScreen"
>;

const IncomingCallScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<IncomingCallRouteProp>();

  const { callerId, callerName, callerAvatar, signal } = route.params as any;

  const acceptCall = () => {
    navigation.replace("CallScreen", {
      targetUserId: callerId,
      targetName: callerName,
      isCaller: false,
      incomingSignal: signal,
    });
  };

  const declineCall = () => {
    socketService.emit("endCall", {
      to: callerId,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.incomingText}>Incoming Video Call</Text>
      </View>

      <View style={styles.callerInfo}>
        <FastImage
          source={{
            uri: callerAvatar || "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
        />

        <Text style={styles.callerName}>{callerName}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={declineCall}
        >
          <Icon name="close" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={acceptCall}
        >
          <Icon name="call" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  header: {
    paddingTop: 50,
    alignItems: "center",
  },
  incomingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    opacity: 0.8,
  },
  callerInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  callerName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 60,
  },
  actionBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  declineBtn: {
    backgroundColor: "#ff4444",
  },
  acceptBtn: {
    backgroundColor: "#00C851",
  },
});

export default IncomingCallScreen;

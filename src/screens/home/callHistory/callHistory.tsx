import React, { useState, useEffect, useCallback } from "react";
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../theme/ThemeContext";
import { apiService } from "../../../services/apiService";

type CallType = "incoming" | "outgoing" | "missed";
type CallMode = "audio" | "video";

interface CallRecord {
  id: string;
  name: string;
  avatar: string;
  type: CallType;
  mode: CallMode;
  time: string;
  duration?: string;
}


const CallArrow = ({ type }: { type: CallType }) => {
  const color =
    type === "missed" ? "#FF3B30" : type === "incoming" ? "#25D366" : "#007AFF";
  const iconName =
    type === "outgoing"
      ? "arrow-up-circle"
      : type === "incoming"
      ? "arrow-down-circle"
      : "arrow-down-circle";

  return (
    <Icon name={iconName} size={16} color={color} style={{ marginRight: 4 }} />
  );
};

const CallHistory = () => {
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<"all" | "missed">("all");
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCallHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.get("/api/call-history");
      
      // Format the date strings
      const formattedData = data.map((call: any) => ({
        ...call,
        time: new Date(call.time).toLocaleDateString() + ' ' + new Date(call.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setCalls(formattedData);
    } catch (error) {
      console.error("Failed to fetch call history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  const filteredCalls =
    activeTab === "missed"
      ? calls.filter((c) => c.type === "missed")
      : calls;

  const styles = getStyles(colors, isDarkMode);

  const renderItem = ({ item }: { item: CallRecord }) => (
    <TouchableOpacity style={styles.callItem} activeOpacity={0.6}>
      <FastImage source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.callInfo}>
        <Text
          style={[
            styles.callerName,
            item.type === "missed" && { color: "#FF3B30" },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.callMeta}>
          <CallArrow type={item.type} />
          <Text style={styles.callSubtext}>
            {item.type === "missed"
              ? "Missed"
              : item.type === "incoming"
              ? "Incoming"
              : "Outgoing"}
            {item.duration ? ` · ${item.duration}` : ""}
          </Text>
        </View>
        <Text style={styles.callTime}>{item.time}</Text>
      </View>

      <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
        <Icon
          name={item.mode === "video" ? "videocam" : "call"}
          size={22}
          color={colors.tabBarActive || "#00a884"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
        <TouchableOpacity>
          <Icon name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "missed" && styles.activeTab]}
          onPress={() => setActiveTab("missed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "missed" && styles.activeTabText,
            ]}
          >
            Missed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Call List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.tabBarActive || "#00a884"} />
        </View>
      ) : (
        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            filteredCalls.length === 0 ? styles.emptyContainer : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContent}>
            <Icon
              name="call-outline"
              size={64}
              color={colors.textSecondary || "#999"}
            />
            <Text
              style={[
                styles.emptyText,
                { color: colors.textSecondary || "#999" },
              ]}
            >
              No missed calls
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: colors.border || "#eee" },
            ]}
          />
        )}
      />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.tabBarActive || "#00a884" },
        ]}
      >
        <MaterialIcons name="add-call" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border || "#ddd",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    tabBar: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginVertical: 10,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f0f0f0",
      borderRadius: 10,
      padding: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.tabBarActive || "#00a884",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary || "#999",
    },
    activeTabText: {
      color: "#fff",
      fontWeight: "700",
    },
    callItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#ccc",
    },
    callInfo: {
      flex: 1,
      marginLeft: 14,
    },
    callerName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    callMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    callSubtext: {
      fontSize: 13,
      color: colors.textSecondary || "#888",
    },
    callTime: {
      fontSize: 12,
      color: colors.textSecondary || "#aaa",
    },
    callButton: {
      padding: 8,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 80,
    },
    emptyContainer: {
      flex: 1,
    },
    emptyContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 100,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      marginTop: 8,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
  });

export default CallHistory;

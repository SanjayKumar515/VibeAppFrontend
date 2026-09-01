import React, { useState, useEffect, useCallback } from "react";
import FastImage from "react-native-fast-image";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./status.styles";
import { apiService } from "../../../services/apiService";
import { CommonImagePicker, ImagePickerModal } from "../../../components";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import Icon from "react-native-vector-icons/Ionicons";

const Status = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [myStatus, setMyStatus] = useState<any>(null);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Status Viewer Modal
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewingStatuses, setViewingStatuses] = useState<any[]>([]);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const fetchStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiService.get("/api/status");
      if (res.success) {
        setMyStatus(res.data.myStatus);
        setRecentUpdates(res.data.recentUpdates);
      }
    } catch (error) {
      console.log("Error fetching statuses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handlePickImage = async (type: "Camera" | "Gallery" | "Document") => {
    if (type === "Document") return;
    try {
      const result = await CommonImagePicker(type, 1, false);
      if (result) {
        setIsPickerVisible(false);
        setIsUploading(true);
        const img = result as any;

        // Ensure we send base64 if available so the server can save it
        // Or if it's a local file, we just send the path for now
        const media = img.data
          ? `data:${img.mime};base64,${img.data}`
          : img.path;

        await apiService.post("/api/status", { media, caption: "" });
        fetchStatuses();
      }
    } catch (error) {
      console.log("Error picking image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewStatus = async (userGroup: any) => {
    if (!userGroup || !userGroup.statuses || userGroup.statuses.length === 0)
      return;

    setViewingStatuses(userGroup.statuses);
    setCurrentStatusIndex(0);
    setViewerVisible(true);

    // Mark all as viewed
    for (const status of userGroup.statuses) {
      if (!status.isRead) {
        try {
          await apiService.post(`/api/status/${status.id}/view`, {});
          status.isRead = true; // Optimistic update
        } catch (e) {
          console.log("Failed to view status", e);
        }
      }
    }
    fetchStatuses(); // Refresh in background
  };

  const handleNextStatus = () => {
    if (currentStatusIndex < viewingStatuses.length - 1) {
      setCurrentStatusIndex((prev) => prev + 1);
    } else {
      setViewerVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Updates</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>

        {/* My Status */}
        <TouchableOpacity
          style={styles.myStatusContainer}
          onPress={() => {
            if (myStatus && myStatus.statuses.length > 0) {
              handleViewStatus(myStatus);
            } else {
              setIsPickerVisible(true);
            }
          }}
        >
          <View style={styles.myStatusImageContainer}>
            {myStatus && myStatus.statuses.length > 0 ? (
              <View
                style={[
                  styles.statusRing,
                  { borderColor: "#d3d3d3", margin: 0, padding: 2 },
                ]}
              >
                <FastImage
                  source={{
                    uri:
                      myStatus.statuses[myStatus.statuses.length - 1].media ||
                      currentUser?.avatar,
                  }}
                  style={styles.placeholderImage}
                />
              </View>
            ) : (
              <FastImage
                source={{
                  uri: currentUser?.avatar || "https://i.pravatar.cc/150",
                }}
                style={styles.placeholderImage}
              />
            )}

            <TouchableOpacity
              style={styles.addIconContainer}
              onPress={() => setIsPickerVisible(true)}
            >
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.nameText}>My status</Text>
            <Text style={styles.timeText}>
              {myStatus && myStatus.statuses.length > 0
                ? "Tap to view your updates"
                : "Tap to add status update"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.recentUpdatesText}>Recent updates</Text>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#00a884" />
        </View>
      ) : (
        <FlatList
          data={recentUpdates}
          keyExtractor={(item) => item.user.id}
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#667781", marginTop: 20 }}
            >
              No recent updates
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.statusItemContainer}
              onPress={() => handleViewStatus(item)}
            >
              <View
                style={[
                  styles.statusRing,
                  { borderColor: item.allRead ? "#d3d3d3" : "#00a884" },
                ]}
              >
                <FastImage
                  source={{
                    uri: item.statuses[item.statuses.length - 1].media,
                  }}
                  style={styles.placeholderImage}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.nameText}>{item.user.name}</Text>
                <Text style={styles.timeText}>
                  {new Date(
                    item.statuses[item.statuses.length - 1].createdAt,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Image Picker */}
      <ImagePickerModal
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelect={handlePickImage}
      />

      {/* Fullscreen Status Viewer */}
      <Modal visible={viewerVisible} transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {viewingStatuses.length > 0 && (
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={handleNextStatus}
            >
              <FastImage
                source={{ uri: viewingStatuses[currentStatusIndex].media }}
                style={{ flex: 1 } as any}
                resizeMode={FastImage.resizeMode.contain}
              />
              {/* Progress bars at top */}
              <View
                style={{
                  position: "absolute",
                  top: 50,
                  left: 10,
                  right: 10,
                  flexDirection: "row",
                }}
              >
                {viewingStatuses.map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      height: 3,
                      backgroundColor:
                        idx <= currentStatusIndex
                          ? "#fff"
                          : "rgba(255,255,255,0.3)",
                      marginHorizontal: 2,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={{ position: "absolute", top: 60, right: 20 }}
                onPress={() => setViewerVisible(false)}
              >
                <Icon name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {/* Uploading Overlay */}
      {isUploading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Uploading Status...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Status;

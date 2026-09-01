import React, { useState, useEffect } from "react";
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { updateUser, signOut } from "../../../store/slices/authSlice";
import { socketService } from "../../../services/socketService";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import {
  CommonImagePicker,
  ImagePickerModal,
  CommonLoader,
} from "../../../components";
import { storage } from "../../../utils/storage";

const Profile = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [name, setName] = useState(currentUser?.name || "");
  const [about, setAbout] = useState(
    currentUser?.about || "Hey there! I am using WhatsApp.",
  );
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const { showLoader, hideLoader } = CommonLoader();

  useEffect(() => {
    const handleUpdateProfile = (response: any) => {
      hideLoader();
      if (response.success) {
        setIsEditingName(false);
        setIsEditingAbout(false);
        const updatedUser = { ...currentUser, name, avatar, about };
        dispatch(updateUser({ name, avatar, about }));
        // Sync with storage
        storage.setItem("user", updatedUser);
      } else {
        Alert.alert("Error", response.msg || "Failed to update profile");
        // Revert to original data on failure
        setName(currentUser?.name || "");
        setAbout(currentUser?.about || "Hey there! I am using WhatsApp.");
        setAvatar(currentUser?.avatar || "");
      }
    };

    socketService.on("updateProfile", handleUpdateProfile);

    return () => {
      socketService.off("updateProfile");
    };
  }, [name, avatar, about, dispatch]);

  const handleSaveName = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    if (name === currentUser?.name) {
      setIsEditingName(false);
      return;
    }
    showLoader();
    socketService.emit("updateProfile", { name, avatar, about });
  };

  const handleSaveAbout = () => {
    if (!about.trim()) {
      Alert.alert("Error", "About cannot be empty");
      return;
    }
    if (about === (currentUser?.about || "Hey there! I am using WhatsApp.")) {
      setIsEditingAbout(false);
      return;
    }
    showLoader();
    socketService.emit("updateProfile", { name, avatar, about });
  };

  const handleAvatarSelect = async (
    type: "Camera" | "Gallery" | "Document",
  ) => {
    setIsImagePickerVisible(false);
    if (type === "Document") return; // Not supported for avatar
    try {
      const result = await CommonImagePicker(type, 1, false);
      if (result) {
        const img = result as any;
        const newAvatarUri = img.path;
        setAvatar(newAvatarUri);

        // Immediately save the new avatar
        showLoader();
        socketService.emit("updateProfile", {
          name,
          avatar: newAvatarUri,
          about,
        });
      }
    } catch (error) {
      console.log("Picker Error: ", error);
    }
  };
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          showLoader();
          dispatch(signOut());
          storage.removeItem("user");
          storage.removeItem("token");
          socketService.disconnect();
          hideLoader();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <FastImage
            source={{ uri: avatar || "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editAvatarBtn}
            onPress={() => setIsImagePickerVisible(true)}
          >
            <Icon name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info List */}

        {/* Name Item */}
        <View style={styles.listItem}>
          <View style={styles.iconContainer}>
            <Icon name="person" size={24} color={colors.textSecondary} />
          </View>
          <View
            style={[styles.itemContent, { borderBottomColor: colors.border }]}
          >
            <View style={styles.itemHeader}>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
                Name
              </Text>
            </View>
            <View style={styles.itemInputRow}>
              {isEditingName ? (
                <TextInput
                  style={[
                    styles.itemInput,
                    {
                      color: colors.text,
                      borderBottomColor: colors.PRIMARY[400],
                      borderBottomWidth: 2,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  onBlur={handleSaveName}
                  onSubmitEditing={handleSaveName}
                />
              ) : (
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  {name || "Unknown User"}
                </Text>
              )}
              {!isEditingName && (
                <TouchableOpacity onPress={() => setIsEditingName(true)}>
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color={colors.text || "#00a884"}
                  />
                </TouchableOpacity>
              )}
              {isEditingName && (
                <TouchableOpacity
                  onPress={handleSaveName}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialIcons
                    name="check"
                    size={26}
                    color={colors.text || "#00a884"}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text
              style={[styles.itemDescription, { color: colors.textSecondary }]}
            >
              This is not your username or pin. This name will be visible to
              your WhatsApp contacts.
            </Text>
          </View>
        </View>

        {/* About Item */}
        <View style={styles.listItem}>
          <View style={styles.iconContainer}>
            <Icon
              name="information-circle-outline"
              size={26}
              color={colors.textSecondary}
            />
          </View>
          <View
            style={[styles.itemContent, { borderBottomColor: colors.border }]}
          >
            <View style={styles.itemHeader}>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
                About
              </Text>
            </View>
            <View style={styles.itemInputRow}>
              {isEditingAbout ? (
                <TextInput
                  style={[
                    styles.itemInput,
                    {
                      color: colors.text,
                      borderBottomColor: colors.PRIMARY[400],
                      borderBottomWidth: 2,
                    },
                  ]}
                  value={about}
                  onChangeText={setAbout}
                  autoFocus
                  onBlur={handleSaveAbout}
                  onSubmitEditing={handleSaveAbout}
                />
              ) : (
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  {about}
                </Text>
              )}
              {!isEditingAbout && (
                <TouchableOpacity onPress={() => setIsEditingAbout(true)}>
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color={colors.text || "#00a884"}
                  />
                </TouchableOpacity>
              )}
              {isEditingAbout && (
                <TouchableOpacity
                  onPress={handleSaveAbout}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialIcons
                    name="check"
                    size={26}
                    color={colors.text || "#00a884"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Phone Item */}
        <View style={styles.listItem}>
          <View style={styles.iconContainer}>
            <Icon name="call" size={22} color={colors.textSecondary} />
          </View>
          <View style={[styles.itemContent, { borderBottomWidth: 0 }]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
                Phone
              </Text>
            </View>
            <View style={styles.itemInputRow}>
              <Text style={[styles.itemValue, { color: colors.text }]}>
                {currentUser?.phoneNumber || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Item */}
        <TouchableOpacity style={[styles.listItem, { marginTop: 20 }]} onPress={handleLogout}>
          <View style={styles.iconContainer}>
            <Icon name="log-out-outline" size={26} color="#ef4444" />
          </View>
          <View style={[styles.itemContent, { borderBottomWidth: 0, justifyContent: 'center', paddingTop: 10 }]}>
            <Text style={{ fontSize: 17, color: "#ef4444", fontWeight: "600" }}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <ImagePickerModal
        visible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onSelect={handleAvatarSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  content: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 30,
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00a884",
    padding: 12,
    borderRadius: 24,
  },
  listItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    paddingTop: 10,
    alignItems: "flex-start",
  },
  itemContent: {
    flex: 1,
    borderBottomWidth: 1,
    paddingBottom: 20,
    paddingTop: 5,
  },
  itemHeader: {
    marginBottom: 5,
  },
  itemLabel: {
    fontSize: 14,
  },
  itemInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemValue: {
    fontSize: 17,
    flex: 1,
  },
  itemInput: {
    fontSize: 17,
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  itemDescription: {
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
});

export default Profile;

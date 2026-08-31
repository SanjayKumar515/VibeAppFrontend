import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDispatch } from "react-redux";

import { signIn } from "../../../store/slices/authSlice";
import getStyles from "./signin.styles";
import { useTheme } from "../../../theme/ThemeContext";
import { apiService } from "../../../services/apiService";
import { socketService } from "../../../services/socketService";
import { storage } from "../../../utils/storage";
import { jwtDecode } from "jwt-decode";

import { CommonLoader } from "../../../components/CommonLoader/commonLoader";
import { getFcmToken } from "../../../services/notificationService";

const Signin = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { showLoader, hideLoader } = CommonLoader();

  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleSignInWithPhoneNumber = async () => {
    Keyboard.dismiss();
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter your phone number.");
      return;
    }

    try {
      showLoader();
      const fullNumber = `+91${phoneNumber}`; // Hardcoding India code to match UI
      let fcmToken = await getFcmToken();

      if (!fcmToken) {
        // Fallback or handle error if push notifications are disabled
        console.log("Failed to get FCM token, using dummy_token");
        fcmToken = "dummy_token";
      }

      const response = await apiService.post("/auth/request-otp", {
        phoneNumber: fullNumber,
        fcmToken: fcmToken,
      });

      hideLoader();

      if (response.success) {
        setIsOtpSent(true);
        Alert.alert("Success", "SMS verification code sent.");
      } else {
        throw new Error(response.msg || "Failed to send OTP");
      }
    } catch (error: any) {
      hideLoader();
      console.log("OTP Request Error:", error);

      Alert.alert("OTP Error", error?.message || "Something went wrong");
    }
  };

  const confirmCode = async () => {
    Keyboard.dismiss();
    if (!code) {
      Alert.alert("Error", "Please enter the 6-digit code.");
      return;
    }

    try {
      if (!isOtpSent) {
        Alert.alert("Error", "Please request OTP first");
        return;
      }

      showLoader();
      const fullNumber = `+91${phoneNumber}`;

      // Verify with backend directly
      const response = await apiService.post("/auth/verify-otp", {
        phoneNumber: fullNumber,
        otp: code,
      });

      if (response.success) {
        const backendToken = response.token;

        // Decode the JWT to get the user ID
        const decoded = jwtDecode(backendToken) as any;
        const userPayload = decoded.user; // contains id, name, phoneNumber, avatar, about

        // Connect socket with token
        socketService.connect(backendToken);

        hideLoader();

        // Persist session
        await storage.setItem('token', backendToken);
        await storage.setItem('user', userPayload);

        dispatch(
          signIn({
            user: userPayload,
            token: backendToken,
          }),
        );
      } else {
        throw new Error(response.msg || "Backend verification failed");
      }
    } catch (error: any) {
      hideLoader();
      console.log("Confirm OTP Error:", error);
      Alert.alert(
        "Verification Failed",
        error?.message ||
          "The code you entered is incorrect. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                {!isOtpSent
                  ? "Enter your phone number"
                  : "Verify your phone number"}
              </Text>
              {!isOtpSent ? (
                <Text style={styles.subtitle}>
                  WhatsApp will need to verify your phone number. Carrier
                  charges may apply.{" "}
                  <Text style={styles.linkText}>What's my number?</Text>
                </Text>
              ) : (
                <Text style={styles.subtitle}>
                  Waiting to automatically detect an SMS sent to +91{" "}
                  {phoneNumber}.{" "}
                  <Text style={styles.linkText}>Wrong number?</Text>
                </Text>
              )}
            </View>

            {!isOtpSent ? (
              <View style={styles.inputWrapper}>
                <View style={styles.countryPickerContainer}>
                  <Text style={styles.countryText}>India</Text>
                </View>

                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.plusText}>+</Text>
                    <Text style={styles.countryCodeText}>91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="phone number"
                    placeholderTextColor="#a0a0a0"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.phoneInputContainer,
                    { justifyContent: "center", width: "100%" },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      {
                        flex: 0,
                        width: 150,
                        textAlign: "center",
                        fontSize: 24,
                        letterSpacing: 4,
                      },
                    ]}
                    placeholder="--- ---"
                    placeholderTextColor="#a0a0a0"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
                <Text style={[styles.subtitle, { marginTop: 24 }]}>
                  Enter 6-digit code
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={!isOtpSent ? handleSignInWithPhoneNumber : confirmCode}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signin;

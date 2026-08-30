import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithPhoneNumber, getIdToken, ConfirmationResult } from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';

import { signIn } from '../../../store/slices/authSlice';
import getStyles from './signin.styles';
import { useTheme } from '../../../theme/ThemeContext';

const Signin = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmResult, setConfirmResult] =
    useState<ConfirmationResult | null>(null);

  const handleSignInWithPhoneNumber = async () => {
    Keyboard.dismiss();
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    try {
      const auth = getAuth();
      const fullNumber = `+91${phoneNumber}`; // Hardcoding India code to match UI
      const confirmation = await signInWithPhoneNumber(auth, fullNumber);

      setConfirmResult(confirmation);

      Alert.alert('Success', 'SMS verification code sent.');
    } catch (error: any) {
      console.log('Phone Auth Error:', error);

      Alert.alert('OTP Error', error?.message || 'Something went wrong');
    }
  };

  const confirmCode = async () => {
    Keyboard.dismiss();
    if (!code) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }

    try {
      if (!confirmResult) {
        Alert.alert('Error', 'Please request OTP first');
        return;
      }

      const userCredential = await confirmResult.confirm(code);
      const user = userCredential.user;
      const token = await getIdToken(user);

      dispatch(
        signIn({
          user: {
            id: user.uid,
            email: user.phoneNumber || '',
          },
          token: token,
        }),
      );

    } catch (error: any) {
      console.log('Confirm OTP Error:', error);
      Alert.alert('Invalid code', 'The code you entered is incorrect. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                {!confirmResult ? 'Enter your phone number' : 'Verify your phone number'}
              </Text>
              {!confirmResult ? (
                <Text style={styles.subtitle}>
                  WhatsApp will need to verify your phone number. Carrier charges may apply.{' '}
                  <Text style={styles.linkText}>What's my number?</Text>
                </Text>
              ) : (
                <Text style={styles.subtitle}>
                  Waiting to automatically detect an SMS sent to +91 {phoneNumber}.{' '}
                  <Text style={styles.linkText}>Wrong number?</Text>
                </Text>
              )}
            </View>

            {!confirmResult ? (
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
                <View style={[styles.phoneInputContainer, { justifyContent: 'center', width: '100%' }]}>
                  <TextInput
                    style={[styles.input, { flex: 0, width: 150, textAlign: 'center', fontSize: 24, letterSpacing: 4 }]}
                    placeholder="--- ---"
                    placeholderTextColor="#a0a0a0"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
                <Text style={[styles.subtitle, { marginTop: 24 }]}>Enter 6-digit code</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={!confirmResult ? handleSignInWithPhoneNumber : confirmCode}
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

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import OnboardingSwiper from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeColors } from '../../../theme/ThemeContext';

const Onboarding = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <OnboardingSwiper
        onSkip={() => navigation.navigate('SignIn')}
        onDone={() => navigation.navigate('SignIn')}
        pages={[
          {
            backgroundColor: colors.PRIMARY[100],
            image: <View style={styles.placeholder}><Text>Image 1</Text></View>,
            title: 'Welcome to VideoCallApp',
            subtitle: 'Connect with your friends and family easily',
          },
          {
            backgroundColor: colors.PRIMARY[200],
            image: <View style={styles.placeholder}><Text>Image 2</Text></View>,
            title: 'High Quality Video',
            subtitle: 'Experience crystal clear video and audio',
          },
        ]}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.PRIMARY[300], // Usually white
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  }
});

export default Onboarding;

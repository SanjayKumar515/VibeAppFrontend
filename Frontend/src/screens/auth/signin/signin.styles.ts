import { StyleSheet, Platform } from 'react-native';
import { Fonts } from '../../../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { ThemeColors } from '../../../theme/ThemeContext';

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: wp(5),
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: hp(6),
    marginBottom: hp(3),
  },
  headerTitle: {
    fontSize: 20,
    color: colors.tabBarActive, // WhatsApp Green equivalent
    fontFamily: Fonts.Bold,
    marginBottom: hp(2),
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: Fonts.Regular,
    lineHeight: 20,
  },
  linkText: {
    color: '#027eb5',
  },
  inputWrapper: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  countryPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(70),
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarActive,
    paddingBottom: 8,
    marginBottom: hp(2),
  },
  countryText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: Fonts.Regular,
    flex: 1,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(70),
  },
  countryCodeBox: {
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarActive,
    paddingBottom: 8,
    marginRight: wp(4),
    width: wp(15),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: Fonts.Regular,
  },
  countryCodeText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: Fonts.Regular,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontFamily: Fonts.Regular,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarActive,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    paddingTop: 0,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: hp(6),
  },
  nextButton: {
    backgroundColor: colors.tabBarActive,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  nextButtonText: {
    color: colors.PRIMARY[300], // Usually white or contrasting text
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});

export default getStyles;

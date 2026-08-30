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
    backgroundColor: colors.background, // Or a specific chat background color like #efe6dd in light mode
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 5,
    backgroundColor: colors.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: colors.text,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    color: colors.textSecondary,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 10,
    marginLeft: 5,
  },
  messageList: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  bubbleContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    marginBottom: hp(1),
  },
  bubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: colors.tabBarActive, // Use active color or a specific green for sent messages
    borderTopRightRadius: 0,
  },
  bubbleReceived: {
    alignSelf: 'flex-start',
    backgroundColor: colors.SECONDARY ? colors.SECONDARY[100] : colors.border,
    borderTopLeftRadius: 0,
  },
  messageTextSent: {
    color: colors.PRIMARY[300], // White usually
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },
  messageTextReceived: {
    color: colors.text,
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },
  messageTimeSent: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTimeReceived: {
    color: colors.textSecondary,
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    backgroundColor: colors.background,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: 24,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    minHeight: 48,
    maxHeight: 100,
    lineHeight: 20,
    marginLeft: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884', // WhatsApp green color
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default getStyles;

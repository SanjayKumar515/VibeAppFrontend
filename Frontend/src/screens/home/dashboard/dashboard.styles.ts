import { StyleSheet } from 'react-native';
import { Fonts, Typography } from '../../../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { ThemeColors } from '../../../theme/ThemeContext';

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    color: colors.tabBarActive, // WhatsApp Green
    fontFamily: Fonts.Bold,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: wp(5),
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.border,
  },
  chatDetails: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: colors.text,
  },
  chatTime: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    color: colors.textSecondary,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.tabBarActive,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: wp(2),
  },
  unreadText: {
    color: colors.PRIMARY[300], // Usually white
    fontSize: 10,
    fontFamily: Fonts.Bold,
  },
});

export default getStyles;

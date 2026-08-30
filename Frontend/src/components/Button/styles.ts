import { StyleSheet } from 'react-native';
import { Fonts, Typography } from '../../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { ThemeColors } from '../../theme/ThemeContext';

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  buttonContainer: {
    height: hp(6),
    marginVertical: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: wp(10),
  },

  disabledButtonContainer: {
    backgroundColor: colors.SECONDARY[200],
    borderWidth: 1,
    borderColor: colors.SECONDARY[200],
  },
  buttonText: {
    fontSize: wp(4.5),
    textAlign: 'center',
    marginHorizontal: wp(1),
    fontFamily: Fonts.Bold,
  },
  disabledButtonText: {
    color: colors.PRIMARY[300],
  },
  buttonView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableOpacityStyle: {
    flex: 1,
  },
  iconStyle: {
    resizeMode: 'contain',
    height: hp('3'),
    width: wp('5'),
    marginRight: wp('2'),
    tintColor: colors.PRIMARY[300],
  },
  fileSizeText: {
    ...Typography.BodyRegular12,
    color: colors.PRIMARY[300],
  }
});

export default getStyles;

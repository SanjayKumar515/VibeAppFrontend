import { StyleSheet } from "react-native";
import {Typography} from "../../constant";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ThemeColors } from "../../theme/ThemeContext";

const getStyles = (colors: ThemeColors) => StyleSheet.create({

  modalViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: wp(95),
    backgroundColor: colors.PRIMARY[100],
    borderRadius: 20,
    alignItems: 'center',
    padding: hp(2),
  },
  modalTitleText: {
    color: colors.PRIMARY[300],
    textAlign: 'center',
    ...Typography.H4Semibold20,
  },
  modalText: {
    marginTop: hp(2),
    color: colors.PRIMARY[300],
    textAlign:'center',
    ...Typography.BodyMedium14,
  },
  actionButtonView: {
    marginTop: hp(3),
    alignSelf: 'center',
    marginBottom: hp(1),
    alignItems: 'center'
  },
  cancelButtonView: {
    marginTop: hp(2),
    alignSelf: 'center',
    marginBottom: hp(2),
    alignItems: 'center'
  },
  cancelButton: {
    borderRadius: 40,
    alignItems: 'center',
    paddingVertical: hp(1.5),
    width: wp(32),
    // backgroundColor: colors.SECONDARY[100],
  },
  caneclButtonText: {
    color: colors.PRIMARY[100],
    ...Typography.BodyBold14,
  },
});

export default getStyles;

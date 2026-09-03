import { StyleSheet } from "react-native";
import { Colors, Typography } from "../../constant";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { ThemeColors } from "../../theme/ThemeContext";

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalViewContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalView: {
      width: wp(95),
      backgroundColor: colors.background || "#FFFFFF",
      borderRadius: 20,
      alignItems: "center",
      padding: hp(2),
    },
    modalTitleText: {
      color: colors.text || "#000000",
      textAlign: "center",
      ...Typography.H4Semibold20,
    },
    modalText: {
      marginTop: hp(2),
      color: colors.text || Colors.PRIMARY[100],
      textAlign: "center",
      ...Typography.BodyMedium14,
    },
    actionButtonView: {
      marginTop: hp(3),
      alignSelf: "center",
      marginBottom: hp(1),
      alignItems: "center",
    },
    cancelButtonView: {
      marginTop: hp(2),
      alignSelf: "center",
      marginBottom: hp(2),
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.tabBarActive,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    caneclButtonText: {
      color: colors.PRIMARY[100],
      ...Typography.BodyBold14,
    },
  });

export default getStyles;

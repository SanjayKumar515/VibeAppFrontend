import {Text,TextStyle,StyleProp } from "react-native";
import { FC } from "react";
import { Typography } from "../../constant";
import { useTheme } from "../../theme/ThemeContext";

interface TextProps {
  style?: StyleProp<TextStyle>,
  children?: React.ReactNode | any,
  onPress?: () => void,
  numberOfLines?: number
}

const TextView: FC<TextProps> = ({
  style,
  children,
  onPress,
  numberOfLines,
}) => {
  const { colors } = useTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color: colors.text }, Typography.BodyRegular12, style]}
      allowFontScaling={false}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

export default TextView;

import {
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
  View,
  ViewStyle,
  Image,
  DimensionValue,
  Text,
} from 'react-native';
import getStyles from './styles';
import { FC } from 'react';
import _ from 'lodash';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTheme } from '../../theme/ThemeContext';

interface ButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  indicatorColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  title?: string | null;
  titleStyle?: TextStyle;
  buttonColor?: string;
  textColor?: string;
  icon?: any;
  showIcon?: boolean;
  showfileSize?: boolean;
  pdfFileSize?: string;
  gradientColors?: string[];
  buttonWidth?: DimensionValue;
}

const Button: FC<ButtonProps> = ({
  onPress,
  isLoading,
  indicatorColor,
  disabled,
  style,
  title,
  titleStyle,
  buttonColor,
  textColor,
  icon,
  showIcon,
  showfileSize,
  pdfFileSize = '50 KB',
  buttonWidth = wp(80),
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const resolvedIndicatorColor = indicatorColor ?? colors.PRIMARY[300];
  const resolvedButtonColor = buttonColor ?? colors.PRIMARY[100];
  const resolvedTextColor = textColor ?? colors.PRIMARY[300];

  const {
    buttonView,
    indicatorStyle,
    touchableOpacityStyle,
    buttonText,
    iconStyle,
  } = styles;

  const handleClick = () => {
    try {
      if (onPress) {
        _.debounce(onPress, 300)();
      }
    } catch (error) {
      console.warn('handleClick', error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.buttonContainer,
        {
          backgroundColor: disabled ? colors.SECONDARY[200] : resolvedButtonColor,
          width: buttonWidth,
        },
        style,
      ]}
      onPress={() => handleClick()}
      disabled={isLoading === true ? true : disabled}
    >
      <View style={touchableOpacityStyle}>
        {isLoading === true ? (
          <View style={buttonView}>
            <View style={indicatorStyle}>
              <ActivityIndicator color={resolvedIndicatorColor} />
            </View>
          </View>
        ) : (
          <View style={buttonView}>
            {showIcon && (
              <Image
                source={icon}
                style={[
                  iconStyle,
                  { tintColor: disabled ? colors.PRIMARY[300] : resolvedTextColor },
                ]}
              />
            )}
            <Text
              style={[
                buttonText,
                { color: disabled ? colors.PRIMARY[300] : resolvedTextColor },
                titleStyle,
              ]}
            >
              {title}
            </Text>

            {showfileSize && (
              <Text style={styles.fileSizeText}>{pdfFileSize}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;

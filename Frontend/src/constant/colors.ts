export const lightColors = {
  //color scheme -
  PRIMARY: {
    100: '#11505d',
    200: '#2c9eaf',
    300: '#FFFFFF',
    400: '#000000',
    500: '#ff480a',
    600: '#f29f17',
    700: '#dadee9',
    800: '#cfedfb',
    900: '#31607f',
  },
  PRIMARYRGB: {
    100: 'rgba(255, 255, 255,0.7)',
  },
  SECONDARY: {
    100: '#544e76', //Enable
    200: '#FCFCFC', //Disable
    300: '#FCFCFC', //Input
    400: '#4B5569',
    800: '#f1f1f1',
    900: '#e2e6e9',
  },

  NEUTRAL: {
    100: '#eff1f5',
    200: '#ECECEC',
    300: '#4B5569',
    400: '#6b6790',
  },

  FLOATINGINPUT: {
    100: '#a9a9a9',
    200: '#aeaeae',
    300: '#b3b4b4',
  },

  SUCCESS: {
    100: '#37871A',
    200: '#008000',
  },

  ERROR: {
    100: '#8D0E0E',
    200: '#A12861',
  },
  HOVER: {
    100: '#375a72',
    200: '#265472',
  },
  LINEAR: {
    100: '#372f56',
    200: '#352e54',
    300: '#453f66',
    400: '#56517a',
    500: '#58517a',
  },

  // Base UI colors for easy access
  background: '#FFFFFF',
  text: '#111b21',
  textSecondary: '#5e5e5e',
  tabBarActive: '#00a884',
  tabBarInactive: '#fff',
  tabBarBackground: '#FFFFFF',
  card: '#FFFFFF',
  border: '#ECECEC',
};

export const darkColors = {
  ...lightColors,
  PRIMARY: {
    ...lightColors.PRIMARY,
    100: '#000000',
    300: '#FFFFFF',
  },

  // Base UI colors for dark mode
  background: '#0b141a',
  text: '#e9edef',
  textSecondary: '#8696a0',
  tabBarActive: '#00a884',
  tabBarInactive: '#8696a0',
  tabBarBackground: '#0b141a',
  card: '#111b21',
  border: '#222d34',
};

// Default export for backward compatibility
const Colors = lightColors;
export default Colors;

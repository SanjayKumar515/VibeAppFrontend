import { StyleSheet } from 'react-native';

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 40,
    },
    imagePlaceholder: {
      width: 250,
      height: 150,
      marginBottom: 30,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 30,
    },
    button: {
      backgroundColor: colors.PRIMARY[400] || '#00a884',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      width: '100%',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

export default getStyles;

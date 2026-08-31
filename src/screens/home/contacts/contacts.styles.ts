import { StyleSheet } from 'react-native';

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backButton: {
      marginRight: 20,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBtn: {
      marginLeft: 20,
    },
    listContent: {
      paddingBottom: 20,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    avatar: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
    },
    contactDetails: {
      flex: 1,
      marginLeft: 15,
      justifyContent: 'center',
    },
    contactName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
    },
    contactAbout: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

export default getStyles;

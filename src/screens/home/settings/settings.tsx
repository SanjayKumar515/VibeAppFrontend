import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { signOut } from '../../../store/slices/authSlice';
import { storage } from '../../../utils/storage';
import { socketService } from '../../../services/socketService';
import { useTheme } from '../../../theme/ThemeContext';

const Settings = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const handleLogout = async () => {
    // Clear storage
    await storage.clear();
    
    // Disconnect socket
    socketService.disconnect();
    
    // Dispatch logout
    dispatch(signOut());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  logoutButton: {
    padding: 15,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Settings;

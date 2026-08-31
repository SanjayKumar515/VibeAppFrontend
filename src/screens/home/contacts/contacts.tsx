import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { AppStackProps } from '../../../@types';
import { useTheme } from '../../../theme/ThemeContext';
import getStyles from './contacts.styles';
import { socketService } from '../../../services/socketService';
import { CommonLoader } from '../../../components';

type NavigationProp = NativeStackNavigationProp<AppStackProps, 'Contacts'>;

const Contacts = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();
  const { showLoader, hideLoader } = CommonLoader();
  
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    // Request contacts on mount
    socketService.emit('getContacts', {});

    // Listen to response
    const handleGetContacts = (response: any) => {
      if (response.success) {
        // Filter out the current user just in case the backend includes them
        const otherUsers = response.data.filter(
          (contact: any) => contact.id !== currentUser?.id
        );
        setContacts(otherUsers);
      } else {
        console.log('Failed to fetch contacts:', response.msg);
      }
    };

    const handleNewConversation = (response: any) => {
      hideLoader();
      if (response.success && response.data) {
        // Navigate to ChatRoom with the new or existing conversation
        
        // Find other participant for display purposes
        const otherParticipant = response.data.participants?.find(
          (p: any) => p._id !== currentUser?.id
        );
        
        const displayName = response.data.type === 'direct' ? otherParticipant?.name || 'Unknown User' : response.data.name;
        const displayAvatar = response.data.type === 'direct' ? otherParticipant?.avatar || 'https://i.pravatar.cc/150' : response.data.avatar || 'https://i.pravatar.cc/150';

        navigation.navigate('ChatRoom', { 
          chatId: response.data._id, 
          name: displayName, 
          avatar: displayAvatar 
        });
      } else {
        Alert.alert('Error', response.msg || 'Failed to open conversation');
      }
    };

    socketService.on('getContacts', handleGetContacts);
    socketService.on('newConversation', handleNewConversation);

    return () => {
      socketService.off('getContacts');
      socketService.off('newConversation');
    };
  }, [currentUser, navigation]);

  const startChat = (contact: any) => {
    if (!currentUser?.id) return;
    
    showLoader();
    // Emit newConversation. Backend will find existing or create new.
    socketService.emit('newConversation', {
      type: 'direct',
      participants: [currentUser.id, contact.id]
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const avatar = item.avatar || 'https://i.pravatar.cc/150';
    const name = item.name || 'Unknown User';
    // Access about from user or default
    const about = item.about || "Hey there! I am using WhatsApp.";

    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => startChat(item)}
      >
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{name}</Text>
          <Text style={styles.contactAbout} numberOfLines={1}>{about}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Select contact</Text>
          <Text style={styles.headerSubtitle}>{contacts.length} contacts</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="search-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>No other registered users found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Contacts;

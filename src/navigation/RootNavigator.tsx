import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Alert, AppState } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { signIn, signOut } from '../store/slices/authSlice';
import { incrementUnread } from '../store/slices/chatSlice';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { storage } from '../utils/storage';
import { navigationRef } from '../../App';

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const activeChatRoomId = useSelector((state: RootState) => state.chat.activeChatRoomId);
  const dispatch = useDispatch();

  const activeChatRoomIdRef = useRef(activeChatRoomId);
  const userRef = useRef(user);

  useEffect(() => {
    activeChatRoomIdRef.current = activeChatRoomId;
    userRef.current = user;
  }, [activeChatRoomId, user]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await storage.getItem<string>('token');
        const user = await storage.getItem<any>('user');

        if (token && user) {
          // Connect socket with stored token
          socketService.connect(token);
          
          dispatch(
            signIn({
              user,
              token,
            })
          );
        }
      } catch (error) {
        console.log('Error loading session from storage:', error);
      } finally {
        setInitializing(false);
      }
    };

    loadSession();

    // Global listener for new messages to increment unread badge
    const handleNewMessage = (response: any) => {
      if (response.success && response.data) {
        dispatch(incrementUnread(response.data.conversationId));

        // Show local notification if not in the active chat and not sent by me
        if (
          activeChatRoomIdRef.current !== response.data.conversationId &&
          response.data.sender?.id !== userRef.current?.id
        ) {
          Alert.alert(
            "New Message",
            `${response.data.sender?.name || 'Someone'} sent you a message.`
          );
        }
      }
    };

    socketService.on('newMessage', handleNewMessage);

    const handleIncomingCall = (data: any) => {
      const fromId = data.callerId || data.from;
      // Ignore call events triggered by ourselves (since it's broadcasted to the conversation room)
      if (fromId === userRef.current?.id) return;

      // Assuming backend sends: { callerId, callerName, callerAvatar, signal }
      if (navigationRef.isReady()) {
        navigationRef.navigate('IncomingCallScreen', {
          callerId: fromId,
          callerName: data.callerName || data.name || 'Unknown',
          callerAvatar: data.callerAvatar || data.avatar || '',
          signal: data.signal
        });
      }
    };

    socketService.on('incomingCall', handleIncomingCall);

    return () => {
      socketService.off('newMessage', handleNewMessage);
      socketService.off('incomingCall', handleIncomingCall);
    };
  }, [dispatch]);

  // AppState listener for online/offline presence tracking
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        socketService.emit('userOnline', {});
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        socketService.emit('userOffline', {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" color="#00a884" />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;

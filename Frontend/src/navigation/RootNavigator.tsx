import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { signIn, signOut } from '../store/slices/authSlice';
import { getAuth } from '@react-native-firebase/auth';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const subscriber = getAuth().onAuthStateChanged(async (user: any) => {
      if (user) {
        // User is logged in natively
        try {
          const token = await user.getIdToken();
          dispatch(
            signIn({
              user: { id: user.uid, email: user.phoneNumber || '' },
              token,
            }),
          );
        } catch (error) {
          console.log('Error getting ID token', error);
          dispatch(signOut());
        }
      } else {
        // User is not logged in
        dispatch(signOut());
      }

      if (initializing) setInitializing(false);
    });

    return subscriber; // Unsubscribe on unmount
  }, [dispatch, initializing]);

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

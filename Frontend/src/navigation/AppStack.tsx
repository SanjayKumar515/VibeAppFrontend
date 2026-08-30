import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackProps } from '../@types';
import HomeStack from './HomeStack';
import ChatRoom from '../screens/home/chat/chatRoom';

const Stack = createNativeStackNavigator<AppStackProps>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeStack} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
    </Stack.Navigator>
  );
};

export default AppStack;

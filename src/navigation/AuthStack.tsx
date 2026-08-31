import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackProps } from "../@types";
import { Onboarding, Signin } from "../screens";

const Stack = createNativeStackNavigator<AuthStackProps>();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="SignIn" component={Signin} />
    </Stack.Navigator>
  );
};

export default AuthStack;

// AppNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CoachScreen from '../screens/CoachScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlayerPlansScreen from '../screens/PlayerPlansScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Coach: { selectedPlayer?: string; workoutData?: any };
  Player: { username: string };
  PlayerPlans: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Coach" component={CoachScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="PlayerPlans" component={PlayerPlansScreen} />
      <Stack.Screen name="Login" component={RoleSelectionScreen} />
    </Stack.Navigator>
  );
}

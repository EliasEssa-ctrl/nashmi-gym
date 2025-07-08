import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoachScreen from './screens/CoachScreen';
import PlayerScreen from './screens/PlayerScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import { CoachProvider } from './context/CoachContext';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar, Platform } from 'react-native';
import ChangePasswordScreen from './screens/ForgotPasswordScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';


export type RootStackParamList = {
  RoleSelection: undefined;
  Coach: undefined;
  Player: { username: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
 

  return (
    <CoachProvider>
      <StatusBar backgroundColor="#1A1A1A" barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="RoleSelection">
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Coach" component={CoachScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Player" component={PlayerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
      </NavigationContainer>
    </CoachProvider>
  );
}

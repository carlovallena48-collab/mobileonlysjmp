// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import StartingScreen from "./screens/StartScreen"; // ✅ Ayan na, StartingScreen na ang pangalan
import SignUpScreen from "./screens/SignUpScreen";
import LoginScreen from "./screens/LoginScreen"; // ✅ Tama na ang import nito
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import NotificationsScreen from "./screens/NotificationScreen";
import SettingsScreen from "./screens/SettingScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import BaptismFormScreen from './screens/BaptismFormScreen';
import MarriageFormScreen from './screens/MarriageFormScreen';
import kumpilFormScreen from './screens/KumpilFormScreen';
import SickCallFormScreen from './screens/SickCallFormScreen';
import MyRequestsScreen from './screens/MyRequestsScreen';
import RequestCertificateScreen from './screens/RequestCertificateScreen';
import MapScreen from './screens/MapScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Panimula screen muna */}
        <Stack.Screen name="Starting" component={StartingScreen} />
        
        {/* Sign In / Sign Up screens */}
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="BaptismForm" component={BaptismFormScreen} />
<Stack.Screen name="MarriageForm" component={MarriageFormScreen} />
<Stack.Screen name="KumpilForm" component={kumpilFormScreen} />
<Stack.Screen name="SickCallForm" component={SickCallFormScreen} />
<Stack.Screen name="MyRequests" component={MyRequestsScreen} />
<Stack.Screen name="RequestCertificate" component={RequestCertificateScreen} />
<Stack.Screen name="MapScreen" component={MapScreen} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}
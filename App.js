// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import StartingScreen from "./screens/StartScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import NotificationsScreen from "./screens/NotificationScreen";
import SettingsScreen from "./screens/SettingScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import BaptismFormScreen from "./screens/BaptismFormScreen";
import MarriageFormScreen from "./screens/MarriageFormScreen";
import KumpilFormScreen from "./screens/KumpilFormScreen";
import SickCallFormScreen from "./screens/SickCallFormScreen";
import MyRequestsScreen from "./screens/MyRequestsScreen";  
import RequestCertificateScreen from "./screens/RequestCertificateScreen";
import MapScreen from "./screens/MapScreen";
import ScheduleHistoryScreen from "./screens/ScheduleHistoryScreen";
import ScheduleDetailScreen from "./screens/ScheduleDetailScreen";
import PamisaFormScreen from "./screens/PamisaFormScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import NotificationScreen from './screens/NotificationScreen';
import FirstCommunionFormScreen from "./screens/FirstCommunionFormScreen";
import BlessingFormScreen from "./screens/BlessingFormScreen";
import HolyOrdenFormScreen from "./screens/HolyOrdenFormScreen";
import KumpisalFormScreen from "./screens/KumpisalFormScreen";
import BurialServiceFormScreen from "./screens/BurialServiceFormScreen";
import ViewCertificateScreen from "./screens/ViewCertificateScreen";
import VolunteerFormScreen from "./screens/VolunteerFormScreen";
import VolunteerHistoryScreen from "./screens/VolunteerHistoryScreen";



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Starting" component={StartingScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="BaptismForm" component={BaptismFormScreen} />
        <Stack.Screen name="MarriageForm" component={MarriageFormScreen} />
        <Stack.Screen name="KumpilForm" component={KumpilFormScreen} />
        <Stack.Screen name="SickCallForm" component={SickCallFormScreen} />
        <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
        <Stack.Screen name="RequestCertificate" component={RequestCertificateScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="ScheduleHistoryScreen" component={ScheduleHistoryScreen} />
        <Stack.Screen name="ScheduleDetailScreen" component={ScheduleDetailScreen} />
        <Stack.Screen name="PamisaForm" component={PamisaFormScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
   <Stack.Screen  name="NotificationScreen"  component= {NotificationScreen} options= {{   title: 'Notifications',headerShown: true   }}/>
       <Stack.Screen name="FirstCommunionForm" component={FirstCommunionFormScreen} />
        <Stack.Screen 
          name="BlessingForm" 
          component={BlessingFormScreen}
          options={{ title: 'Blessing Request' }}
        />
        <Stack.Screen name="HolyOrdenForm" component={HolyOrdenFormScreen} />
        <Stack.Screen name="KumpisalForm" component={KumpisalFormScreen} />
       <Stack.Screen name="BurialServiceForm" component={BurialServiceFormScreen} />
       <Stack.Screen name="ViewRequestCertificate" component={ViewCertificateScreen} />
       <Stack.Screen 
  name="VolunteerFormScreen" 
  component={VolunteerFormScreen}
  options={{
    headerShown: false,
    presentation: 'card'
  }}
/>
<Stack.Screen name="VolunteerHistory" component={VolunteerHistoryScreen} />
   </Stack.Navigator>
 </NavigationContainer>
  );
}

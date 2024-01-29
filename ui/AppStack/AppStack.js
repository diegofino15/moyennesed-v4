import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './MainPage';
import ProfilePage from './Profile/ProfilePage';
import ProfileSettingsPage from './Profile/ProfileSettingsPage';
import InformationPage from './Marks/InformationPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Main page stack
function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainPage"
        component={MainPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InformationPage"
        component={InformationPage}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Profile page stack
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfileSettingsPage"
        component={ProfileSettingsPage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack shown when not logged-in
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainStack"
        component={MainStack}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default AppStack;
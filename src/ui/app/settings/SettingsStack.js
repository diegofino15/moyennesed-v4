import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsPage from './SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import CoefficientsPage from './pages/CoefficientsPage';
import AdvancedSettingsPage from './pages/AdvancedSettingsPage';
import AdsInformationPage from './pages/AdsInformationPage';
import BugReportPage from './pages/BugReportPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Settings page stack
function SettingsStack({ refreshLogin, isConnected, isConnecting, route }) {
  const { openCoefficientsPage } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsPage"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      >
        {(props) => <SettingsPage
          {...props}
          refreshLogin={refreshLogin}
          isConnected={isConnected}
          isConnecting={isConnecting}
        />}
      </Stack.Screen>

      {/* Profile page */}
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Coefficients page */}
      <Stack.Screen
        name="CoefficientsPage"
        component={CoefficientsPage}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Advanced settings page */}
      <Stack.Screen
        name="AdvancedSettingsPage"
        component={AdvancedSettingsPage}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Ads information page */}
      <Stack.Screen
        name="AdsInformationPage"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        component={AdsInformationPage}
      />

      {/* Bug reporting page */}
      <Stack.Screen
        name="BugReportPage"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        component={BugReportPage}
      />
    </Stack.Navigator>
  );
}

export default SettingsStack;
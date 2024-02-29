import { useEffect, useState } from 'react'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './Main/MainPage';
import SubjectPage from './Main/Marks/SubjectPage';
import InformationPage from './Main/Marks/InformationPage';
import SettingsPage from './Settings/SettingsPage';
import ProfilePage from './Settings/Profile/ProfilePage';
import AppData from '../../core/AppData';
import MarkPage from './Main/Marks/MarkPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Main page stack
function MainStack({ refreshLogin, isConnected, isConnecting }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainPage"
        options={{ headerShown: false }}
        initialParams={{
          newAccountID: 0, // Used to update app when switching accounts
        }}
      >
        {(props) => <MainPage
          {...props}
          refreshLogin={refreshLogin}
          isConnected={isConnected}
          isConnecting={isConnecting}
        />}
      </Stack.Screen>

      <Stack.Screen
        name="InformationPage"
        component={InformationPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          lastDateUpdated: null,
        }}
      />

      <Stack.Screen
        name="SubjectStack"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
          period: null,
          subject: null,
          subSubjectID: null,
          openMarkID: null,
        }}
      >
        {(props) => <SubjectStack
          {...props}
        />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function SubjectStack({ route }) {
  const { accountID, subject, subSubjectID, openMarkID } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SubjectPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{ accountID, subject, subSubjectID, openMarkID }}
      >
        {(props) => <SubjectPage
          {...props}
        />}
      </Stack.Screen>

      <Stack.Screen
        name="MarkPage"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialParams={{ accountID, mark: null }}
      >
        {(props) => <MarkPage
          {...props}
        />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}


// Profile page stack
function SettingsStack({ refreshLogin, isConnected, isConnecting }) {
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

      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

// Stack shown when not logged-in
function AppStack({ cameFromAuthStack }) {
  // Login status
  const [isConnected, setIsConnected] = useState(cameFromAuthStack);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-login
  useEffect(() => { if (!cameFromAuthStack) { refreshLogin(); } }, []);
  async function refreshLogin() {
    console.log("Refreshing login...");
    
    setIsConnecting(true);
    setIsConnected(false);
    const successful = await AppData.refreshLogin();
    setIsConnected(successful);
    setIsConnecting(false);
  }
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainStack"
        options={{ headerShown: false }}
      >
        {(props) => <MainStack
          {...props}
          refreshLogin={refreshLogin}
          isConnected={isConnected}
          isConnecting={isConnecting}
        />}
      </Stack.Screen>

      <Stack.Screen
        name="SettingsStack"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'fade_from_bottom',
        }}
      >
        {(props) => <SettingsStack
          {...props}
          refreshLogin={refreshLogin}
          isConnected={isConnected}
          isConnecting={isConnecting}
        />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default AppStack;
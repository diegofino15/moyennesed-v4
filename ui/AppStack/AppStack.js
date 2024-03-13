import { useEffect, useState } from 'react'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './Main/MainPage';
import MarkPage from './Main/SubjectPage/MarkPage';
import SubjectPage from './Main/SubjectPage/SubjectPage';
import SubjectGroupPage from './Main/SubjectsOverview/SubjectGroupPage';
import MarksInformationPage from './Main/MarksOverview/MarksInformationPage';
import HomeworksPage from './Main/Homework/HomeworksPage';
import ExamPage from './Main/Homework/ExamPage';
import HomeworkInformationPage from './Main/Homework/HomeworkInformationPage';
import SettingsPage from './Settings/SettingsPage';
import ProfilePage from './Settings/Profile/ProfilePage';
import AppData from '../../core/AppData';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Main page stack
function MainStack({ refreshLogin, isConnected, isConnecting, globalDisplayUpdater, updateGlobalDisplay }) {
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
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>

      {/* Info pages */}
      <Stack.Screen
        name="MarksInformationPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          lastDateUpdated: null,
        }}
      >
        {(props) => <MarksInformationPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
        />}
      </Stack.Screen>
      <Stack.Screen
        name="HomeworkInformationPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          lastDateUpdated: null,
        }}
      >
        {(props) => <HomeworkInformationPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
        />}
      </Stack.Screen>

      {/* Homeworks */}
      <Stack.Screen
        name="HomeworksPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
        }}
      >
        {(props) => <HomeworksPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>
      
      {/* Exams */}
      <Stack.Screen
        name="ExamPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
          subjectTitle: null,
          examIDs: [],
        }}
      >
        {(props) => <ExamPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
        />}
      </Stack.Screen>

      {/* Subjects */}
      <Stack.Screen
        name="SubjectStack"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
          cacheSubject: {},
          cacheMark: null,
        }}
      >
        {(props) => <SubjectStack
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>

      {/* SubjectGroups */}
      <Stack.Screen
        name="SubjectGroupPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
          cacheSubjectGroup: {},
        }}
      >
        {(props) => <SubjectGroupPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function SubjectStack({ globalDisplayUpdater, updateGlobalDisplay, route }) {
  const { accountID, cacheSubject, cacheMark } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SubjectPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{ accountID, cacheSubject, cacheMark }}
      >
        {(props) => <SubjectPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>

      <Stack.Screen
        name="MarkPage"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialParams={{ accountID, cacheMark }}
      >
        {(props) => <MarkPage
          {...props}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
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
  useEffect(() => { if (!isConnected) { refreshLogin(); } }, []);
  async function refreshLogin() {
    console.log("Refreshing login...");
    
    setIsConnecting(true);
    setIsConnected(false);
    const successful = await AppData.refreshLogin();
    setIsConnected(successful);
    setIsConnecting(false);
    return successful;
  }

  // Update all displays when changing averages (ex: update opened subject
  // page when marks are updated and a new mark appears)
  const [globalDisplayUpdater, setGlobalDisplayUpdater] = useState(0);
  function updateGlobalDisplay() { setGlobalDisplayUpdater(globalDisplayUpdater + 1); }
  
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
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
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
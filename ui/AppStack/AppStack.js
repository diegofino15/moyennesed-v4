import { useEffect, useState } from 'react'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './Main/MainPage';
import MarkPage from './Main/SubjectPage/MarkPage';
import SubjectPage from './Main/SubjectPage/SubjectPage';
import MarksInformationPage from './Main/MarksOverview/MarksInformationPage';
import UpcomingHomeworkPage from './Main/Homework/UpcomingHomeworkPage';
import HomeworkPage from './Main/Homework/HomeworkPage';
import ExamPage from './Main/Homework/ExamPage';
import HomeworkInformationPage from './Main/Homework/HomeworkInformationPage';

import SettingsPage from './Settings/SettingsPage';
import ProfilePage from './Settings/Profile/ProfilePage';
import CoefficientsPage from './Settings/Pages/CoefficientsPage';
import AdvancedSettingsPage from './Settings/Pages/AdvancedSettingsPage';
import AdsInformationPage from './Settings/Pages/AdsInformationPage';
import BugReportPage from './Settings/Pages/BugReportPage';

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
      <Stack.Screen
        name="AdsInformationPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        component={AdsInformationPage}
      />

      {/* Homeworks */}
      <Stack.Screen
        name="UpcomingHomeworkPage"
        options={{ headerShown: false }}
        initialParams={{
          accountID: 0,
          _errorGettingHomework: false,
        }}
      >
        {(props) => <UpcomingHomeworkPage
          {...props}
          isConnected={isConnected}
          isConnecting={isConnecting}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>
      <Stack.Screen
        name="HomeworkPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
          cacheHomework: null,
          cacheSpecificHomework: null,
        }}
      >
        {(props) => <HomeworkPage
          {...props}
          isConnected={isConnected}
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
          isConnected={isConnected}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
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
function SettingsStack({ refreshLogin, isConnected, isConnecting, globalDisplayUpdater, updateGlobalDisplay, route }) {
  const { openCoefficientsPage } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsPage"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
        initialParams={{
          openCoefficientsPage,
        }}
      >
        {(props) => <SettingsPage
          {...props}
          refreshLogin={refreshLogin}
          isConnected={isConnected}
          isConnecting={isConnecting}
          updateGlobalDisplay={updateGlobalDisplay}
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
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialParams={{
          currentAccount: null,
        }}
      >
        {(props) => <CoefficientsPage
          {...props}
          updateGlobalDisplay={updateGlobalDisplay}
          globalDisplayUpdater={globalDisplayUpdater}
        />}
      </Stack.Screen>

      {/* Advanced settings page */}
      <Stack.Screen
        name="AdvancedSettingsPage"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {(props) => <AdvancedSettingsPage
          {...props}
          updateGlobalDisplay={updateGlobalDisplay}
          globalDisplayUpdater={globalDisplayUpdater}
        />}
      </Stack.Screen>

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

// Stack shown when logged-in
function AppStack({ route, cameFromAuthStack }) {
  const { needToRefresh } = route.params;
  
  // Login status
  const [isConnected, setIsConnected] = useState(cameFromAuthStack);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-login
  useEffect(() => { if (!isConnected || needToRefresh) { refreshLogin(); } }, [needToRefresh]);
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
        initialParams={{
          openCoefficientsPage: false,
        }}
      >
        {(props) => <SettingsStack
          {...props}
          refreshLogin={refreshLogin}
          isConnected={isConnected}
          isConnecting={isConnecting}
          globalDisplayUpdater={globalDisplayUpdater}
          updateGlobalDisplay={updateGlobalDisplay}
        />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default AppStack;
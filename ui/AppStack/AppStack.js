import { useEffect, useState } from 'react'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './Main/MainPage';
import MarkPage from './Main/SubjectPage/MarkPage';
import SubjectPage from './Main/SubjectPage/SubjectPage';
import MarksInformationPage from './Main/MarksOverview/MarksInformationPage';
import UpcomingHomeworkPage from './Main/Homework/UpcomingHomeworkPage';
import HomeworkPage from './Main/Homework/HomeworkPage';
import FilesPage from './Main/Homework/FilesPage';
import ExamPage from './Main/Homework/ExamPage';
import HomeworkInformationPage from './Main/Homework/HomeworkInformationPage';

import SettingsPage from './Settings/SettingsPage';
import ProfilePage from './Settings/Pages/Profile/ProfilePage';
import CoefficientsPage from './Settings/Pages/CoefficientsPage';
import AdvancedSettingsPage from './Settings/Pages/AdvancedSettingsPage';
import AdsInformationPage from './Settings/Pages/AdsInformationPage';
import BugReportPage from './Settings/Pages/BugReportPage';

import AppData from '../../src/core/AppData';
import { AppStackContextProvider } from '../../src/util/AppStackContext';


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

      {/* Info pages */}
      <Stack.Screen
        name="MarksInformationPage"
        component={MarksInformationPage}
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
        name="HomeworkInformationPage"
        component={HomeworkInformationPage}
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
        name="AdsInformationPage"
        component={AdsInformationPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />

      {/* Homeworks */}
      <Stack.Screen
        name="UpcomingHomeworkPage"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
          _errorGettingHomework: false,
        }}
      >
        {(props) => <UpcomingHomeworkPage
          {...props}
          isConnected={isConnected}
          isConnecting={isConnecting}
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
        />}
      </Stack.Screen>
      <Stack.Screen
        name="FilesPage"
        component={FilesPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          accountID: 0,
        }}
      />
      
      {/* Exams */}
      <Stack.Screen
        name="ExamPage"
        component={ExamPage}
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
      />

      {/* Subjects */}
      <Stack.Screen
        name="SubjectStack"
        component={SubjectStack}
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
      />
    </Stack.Navigator>
  );
}

function SubjectStack({ route }) {
  const { accountID, cacheSubject, cacheMark } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SubjectPage"
        component={SubjectPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{ accountID, cacheSubject, cacheMark }}
      />

      <Stack.Screen
        name="MarkPage"
        component={MarkPage}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialParams={{ accountID, cacheMark }}
      />
    </Stack.Navigator>
  );
}


// Profile page stack
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
        initialParams={{
          openCoefficientsPage,
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
        initialParams={{
          currentAccount: null,
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

  return (
    <AppStackContextProvider>
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
          initialParams={{
            openCoefficientsPage: false,
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
    </AppStackContextProvider>
  );
}

export default AppStack;
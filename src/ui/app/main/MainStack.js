import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './MainPage';
import MarkPage from './subject-page/MarkPage';
import SubjectPage from './subject-page/SubjectPage';
import MarksInformationPage from './marks-overview/MarksInformationPage';
import UpcomingHomeworkPage from './homework/UpcomingHomeworkPage';
import HomeworkPage from './homework/HomeworkPage';
import FilesPage from './homework/FilesPage';
import ExamPage from './homework/ExamPage';
import HomeworkInformationPage from './homework/HomeworkInformationPage';

import AdsInformationPage from '../settings/pages/AdsInformationPage';


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

// Used to open mark details inside subject page
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

export default MainStack;
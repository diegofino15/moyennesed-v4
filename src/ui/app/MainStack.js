import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './marks/MainPage';
import MarkPage from './marks/subject-page/MarkPage';
import SubjectPage from './marks/subject-page/SubjectPage';
import ExamPage from './homework/ExamPage';
import MarksInformationPage from './marks/marks-overview/MarksInformationPage';
import UpcomingHomeworkPage from './homework/UpcomingHomeworkPage';
import HomeworkPage from './homework/HomeworkPage';
import FilesPage from './homework/FilesPage';
import HomeworkInformationPage from './homework/HomeworkInformationPage';

import AdsInformationPage from './settings/pages/AdsInformationPage';
import CoefficientsPage from './settings/pages/CoefficientsPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Main page stack
function MainStack() {
  return (
    <Stack.Navigator>
      {/* /// Marks /// */}
      <Stack.Screen
        name="MainPage"
        component={MainPage}
        options={{ headerShown: false }}
        initialParams={{
          newAccountID: 0, // Used to update app when switching accounts
        }}
      />
      <Stack.Screen
        name="SubjectStack"
        component={SubjectStack}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          cacheSubject: {},
          cacheMark: null,
        }}
      />
      <Stack.Screen
        name="ExamPage"
        component={ExamPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          subjectTitle: null,
          examIDs: [],
        }}
      />

      {/* /// Homeworks /// */}
      <Stack.Screen
        name="UpcomingHomeworkPage"
        component={UpcomingHomeworkPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          cacheAbstractHomeworks: null
        }}
      />
      <Stack.Screen
        name="HomeworkPage"
        component={HomeworkPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          cacheHomework: null,
          cacheSpecificHomework: null,
        }}
      />
      <Stack.Screen
        name="FilesPage"
        component={FilesPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />
      
      {/* Information pages */}
      <Stack.Screen
        name="MarksInformationPage"
        component={MarksInformationPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
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
    </Stack.Navigator>
  );
}

// Used to open mark details inside subject page
function SubjectStack({ route }) {
  const { cacheSubject, cacheMark } = route.params;
  
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
        initialParams={{ cacheSubject, cacheMark }}
      />

      <Stack.Screen
        name="MarkPage"
        component={MarkPage}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialParams={{ cacheMark }}
      />

      {/* Coefficients page */}
      <Stack.Screen
        name="CoefficientsPage"
        component={CoefficientsPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

export default MainStack;
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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
import CoefficientsPage from '../settings/pages/CoefficientsPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main page stack
function MainStack() {
  return (
    <Tab.Navigator>
      {/* Marks */}
      <Tab.Screen
        name="MarksStack"
        component={MarksStack}
        options={{
          headerShown: false,
        }}
      />

      {/* Homework */}
      <Tab.Screen
        name="HomeworkStack"
        component={HomeworkStack}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// HOMEWORK //
function HomeworkStack() {
  return (
    <Stack.Navigator>
      {/* Homeworks */}
      <Stack.Screen
        name="UpcomingHomeworkPage"
        component={UpcomingHomeworkPage}
        options={{
          headerShown: false,
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

      {/* Information page */}
      <Stack.Screen
        name="HomeworkInformationPage"
        component={HomeworkInformationPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}



// MARKS //

// Marks stack
function MarksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainPage"
        component={MainPage}
        options={{ headerShown: false }}
        initialParams={{
          newAccountID: 0, // Used to update app when switching accounts
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
          cacheSubject: {},
          cacheMark: null,
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
          subjectTitle: null,
          examIDs: [],
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

      {/* Information page */}
      <Stack.Screen
        name="MarksInformationPage"
        component={MarksInformationPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />

      {/* Ads information  page */}
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
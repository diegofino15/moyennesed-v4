import { useEffect } from 'react';
import useState from 'react-usestateref';
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
import CoefficientsPage from '../settings/pages/CoefficientsPage';

import AppData from '../../../core/AppData';
import HapticsHandler from '../../../core/HapticsHandler';
import { useAppStackContext } from '../../../util/AppStackContext';
import { CurrentAccountContextProvider } from '../../../util/CurrentAccountContext';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Main page stack
function MainStack() {
  const { refreshLogin, isConnected, isConnecting, updateGlobalDisplay } = useAppStackContext();
  
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [mainAccount, setMainAccount] = useState({ "accountType": "E" });
  function updateMainAccount() { AppData.getMainAccount().then(account => { if (account) { setMainAccount(account); } }); }
  useEffect(() => { updateMainAccount(); }, [isConnected]);

  // Select a student account to get marks from
  const [showMarksAccount, setShowMarksAccount] = useState({});
  useEffect(() => {
    async function setup() {
      // Check if account is already a student account
      if (mainAccount.accountType == "E") {
        await AppData.setSelectedChildAccount(mainAccount.id);
        setShowMarksAccount(mainAccount);
      } else {
        await AppData.setSelectedChildAccount(Object.keys(mainAccount.children)[0]);
        setShowMarksAccount(Object.values(mainAccount.children)[0]);
      }
    }
    setup();
  }, [mainAccount.id]);

  // Marks
  const [_gotMarksForID, _setGotMarksForID, gotMarksForIDRef] = useState({});
  const [_gettingMarksForID, setGettingMarksForID, gettingMarksForIDRef] = useState({});
  const [_errorGettingMarksForID, _setErrorGettingMarksForID, errorGettingMarksForIDRef] = useState({});

  // Homework
  const [_gotHomeworkForID, _setGotHomeworkForID, gotHomeworkForIDRef] = useState({});
  const [_gettingHomeworkForID, setGettingHomeworkForID, gettingHomeworkForIDRef] = useState({});
  const [_errorGettingHomeworkForID, _setErrorGettingHomeworkForID, errorGettingHomeworkForIDRef] = useState({});
  
  // Auto-get marks and homework for each connected account
  async function getMarks(accountID, manualRefreshing) {
    if (gotMarksForIDRef.current[accountID] && !manualRefreshing) { return; }
    
    setGettingMarksForID({...gettingMarksForIDRef.current, [accountID]: true});
    const status = await AppData.getMarks(accountID);
    gotMarksForIDRef.current[accountID] = status == 1;
    errorGettingMarksForIDRef.current[accountID] = status != 1;
    setGettingMarksForID({ ...gettingMarksForIDRef.current, [accountID]: false });

    updateGlobalDisplay();
  }
  async function getHomework(accountID, manualRefreshing) {
    if (gotHomeworkForIDRef.current[accountID] && !manualRefreshing) { return; }
    
    setGettingHomeworkForID({...gettingHomeworkForIDRef.current, [accountID]: true});
    const status = await AppData.getAllHomework(accountID);
    gotHomeworkForIDRef.current[accountID] = status == 1;
    errorGettingHomeworkForIDRef.current[accountID] = status != 1;
    setGettingHomeworkForID({...gettingHomeworkForIDRef.current, [accountID]: false});
  }
  useEffect(() => {
    async function autoGetMarks() {
      // Check if not already got marks or is getting marks
      if (gettingMarksForIDRef.current[showMarksAccount.id] || gettingHomeworkForIDRef.current[showMarksAccount.id]) { return; }

      // Get marks & homework
      await Promise.all([
        getMarks(showMarksAccount.id, manualRefreshing),
        getHomework(showMarksAccount.id, manualRefreshing),
      ]);
      updateGlobalDisplay();
      if (manualRefreshing) {
        setManualRefreshing(false);
        HapticsHandler.vibrate("light");
      }
    }
    async function reloginAndGetMarks() {
      const reloginSuccessful = await refreshLogin();
      if (reloginSuccessful) { autoGetMarks(); }
      else {
        setManualRefreshing(false);
        HapticsHandler.vibrate("light");
      }
    }
    if (isConnected && showMarksAccount.id) { autoGetMarks(); }
    else if (showMarksAccount.id && !isConnecting && manualRefreshing) { reloginAndGetMarks(); }
    else if (manualRefreshing) { setManualRefreshing(false); }
  }, [isConnected, showMarksAccount.id, manualRefreshing]);  

  
  return (
    <CurrentAccountContextProvider
      // The account whose marks are displayed
      _accountID={showMarksAccount.id}
      setShowMarksAccount={setShowMarksAccount}
      
      // The ÉcoleDirecte account that is connected
      mainAccount={mainAccount}
      updateMainAccount={updateMainAccount}
      
      _gotMarks={gotHomeworkForIDRef.current[showMarksAccount.id]}
      _isGettingMarks={gettingMarksForIDRef.current[showMarksAccount.id]}
      _errorGettingMarks={errorGettingMarksForIDRef.current[showMarksAccount.id]}
      
      _gotHomework={gotHomeworkForIDRef.current[showMarksAccount.id]}
      _isGettingHomework={gettingHomeworkForIDRef.current[showMarksAccount.id]}
      _errorGettingHomework={errorGettingHomeworkForIDRef.current[showMarksAccount.id]}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="MainPage"
          component={MainPage}
          options={{ headerShown: false }}
          initialParams={{
            newAccountID: 0, // Used to update app when switching accounts
          }}
        />

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
          component={UpcomingHomeworkPage}
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'fade_from_bottom',
          }}
          initialParams={{
            accountID: 0,
            _errorGettingHomework: false,
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
            accountID: 0,
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
    </CurrentAccountContextProvider>
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

      {/* Coefficients page */}
      <Stack.Screen
        name="CoefficientsPage"
        component={CoefficientsPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
        initialParams={{
          currentAccount: null,
        }}
      />
    </Stack.Navigator>
  );
}

export default MainStack;
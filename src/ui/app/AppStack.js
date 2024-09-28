import { useEffect } from 'react';
import useState from 'react-usestateref';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainStack from './main/MainStack';
import SettingsStack from './settings/SettingsStack';
import AppData from '../../core/AppData';
import HapticsHandler from '../../core/HapticsHandler';
import { CurrentAccountContextProvider } from '../../util/CurrentAccountContext';
import { AppStackContextProvider, useAppStackContext } from '../../util/AppStackContext';


// Create stack for navigation
const Stack = createNativeStackNavigator();


// Stack shown when logged-in
function AppStack({ route, cameFromAuthStack }) {
  const { needToRefresh } = route.params;
  
  return (
    <AppStackContextProvider
      needToRefresh={needToRefresh}
      cameFromAuthStack={cameFromAuthStack}
    >
      <MainAndSettingsStack/>
    </AppStackContextProvider>
  );
}

function MainAndSettingsStack() {
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
    if (gettingMarksForIDRef.current[accountID]) { return; }

    setGettingMarksForID({...gettingMarksForIDRef.current, [accountID]: true});
    const status = await AppData.getMarks(accountID);
    gotMarksForIDRef.current[accountID] = status == 1;
    errorGettingMarksForIDRef.current[accountID] = status != 1;
    setGettingMarksForID({ ...gettingMarksForIDRef.current, [accountID]: false });
  }
  async function getHomework(accountID, manualRefreshing) {
    if (gotHomeworkForIDRef.current[accountID] && !manualRefreshing) { return; }
    if (gettingHomeworkForIDRef.current[accountID]) { return; }

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
      getHomework={getHomework}
    
      manualRefreshing={manualRefreshing} setManualRefreshing={setManualRefreshing}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="MainStack"
          component={MainStack}
          options={{ headerShown: false }}
        />

        {/* Settings */}
        <Stack.Screen
          name="SettingsStack"
          component={SettingsStack}
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />
      </Stack.Navigator>
    </CurrentAccountContextProvider>
  );
}


export default AppStack;
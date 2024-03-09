import { useEffect } from "react";
import { View } from "react-native";
import useState from "react-usestateref";

import ChildChooser from "./ChildChooser";
import MarksOverview from "./MarksOverview";
import SubjectsOverview from "./SubjectsOverview";
import HapticsHandler from "../../../../util/HapticsHandler";
import AppData from "../../../../core/AppData";
import HomeworkStatus from "./HomeworkStatus";


// Embedded mark page
function EmbeddedMarksPage({
  mainAccount,
  refreshLogin,
  isConnected,
  isConnecting,
  manualRefreshing,
  setManualRefreshing,
  globalDisplayUpdater,
  updateGlobalDisplay,
  navigation,
}) {
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
  const [gotMarksForID, setGotMarksForID, gotMarksForIDRef] = useState({});
  const [gettingMarksForID, setGettingMarksForID, gettingMarksForIDRef] = useState({});
  const [errorGettingMarksForID, setErrorGettingMarksForID, errorGettingMarksForIDRef] = useState({});

  // Homework
  const [gotHomeworkForID, setGotHomeworkForID, gotHomeworkForIDRef] = useState({});
  const [gettingHomeworkForID, setGettingHomeworkForID, gettingHomeworkForIDRef] = useState({});
  const [errorGettingHomeworkForID, setErrorGettingHomeworkForID, errorGettingHomeworkForIDRef] = useState({});
  
  async function getMarksAndHomework(accountID) {
    // Get marks
    setGettingMarksForID({ ...gettingMarksForIDRef.current, [accountID]: true });
    const status = await AppData.getMarks(accountID);
    setGotMarksForID({ ...gotMarksForIDRef.current, [accountID]: status == 1 });
    setErrorGettingMarksForID({ ...errorGettingMarksForIDRef.current, [accountID]: status != 1 });
    setGettingMarksForID({ ...gettingMarksForIDRef.current, [accountID]: false });
    updateGlobalDisplay();

    // Get homework
    setGettingHomeworkForID({ ...gettingHomeworkForIDRef.current, [accountID]: true });
    const status2 = await AppData.getAllHomework(accountID);
    setGotHomeworkForID({ ...gotHomeworkForIDRef.current, [accountID]: status2 == 1 });
    setErrorGettingHomeworkForID({ ...errorGettingHomeworkForIDRef.current, [accountID]: status2 != 1 });
    setGettingHomeworkForID({ ...gettingHomeworkForIDRef.current, [accountID]: false });
    updateGlobalDisplay();
  }
  useEffect(() => {
    async function autoGetMarks() {
      // Check if not already got marks or is getting marks
      if (gettingMarksForIDRef.current[showMarksAccount.id] || gettingHomeworkForIDRef.current[showMarksAccount.id]) { return; }
      if (gotMarksForIDRef.current[showMarksAccount.id] && !manualRefreshing) { return; }

      // Get marks
      await getMarksAndHomework(showMarksAccount.id);
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
  }, [isConnected, showMarksAccount.id, manualRefreshing]);  

  // Selected period
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [latestCurrentPeriod, setLatestCurrentPeriod] = useState(null);
  
  return (
    <View>
      {mainAccount.accountType == "P" && <ChildChooser
        mainAccount={mainAccount}
        showMarksAccount={showMarksAccount}
        setShowMarksAccount={setShowMarksAccount}
      />}
      <MarksOverview
        accountID={showMarksAccount.id}
        selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
        setLatestCurrentPeriod={setLatestCurrentPeriod}
        
        isLoading={isConnecting || gettingMarksForID[showMarksAccount.id]}
        gotMarks={gotMarksForID[showMarksAccount.id]}
        errorGettingMarks={errorGettingMarksForID[showMarksAccount.id]}
        
        globalDisplayUpdater={globalDisplayUpdater}
        navigation={navigation}
      />
      <HomeworkStatus
        accountID={showMarksAccount.id}
        gotHomework={gotHomeworkForID[showMarksAccount.id]}
        isGettingHomework={gettingHomeworkForID[showMarksAccount.id]}
        errorGettingHomework={errorGettingHomeworkForID[showMarksAccount.id]}
        navigation={navigation}
      />
      <SubjectsOverview
        accountID={showMarksAccount.id}
        selectedPeriod={selectedPeriod}
        latestCurrentPeriod={latestCurrentPeriod}
        gotHomework={gotHomeworkForID[showMarksAccount.id]}
        globalDisplayUpdater={globalDisplayUpdater}
        navigation={navigation}
      />
    </View>
  );
}

export default EmbeddedMarksPage;
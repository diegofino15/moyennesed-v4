import { useEffect } from "react";
import { View } from "react-native";
import useState from "react-usestateref";

import ChildChooser from "./ChildChooser";
import MarksOverview from "./MarksOverview";
import SubjectsOverview from "./SubjectsOverview";
import HapticsHandler from "../../../../util/HapticsHandler";
import AppData from "../../../../core/AppData";


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

  // Auto-get marks
  const [gotMarksForID, setGotMarksForID, gotMarksForIDRef] = useState({});
  const [gettingMarksForID, setGettingMarksForID, gettingMarksForIDRef] = useState({});
  const [errorGettingMarksForID, setErrorGettingMarksForID, errorGettingMarksForIDRef] = useState({});
  async function getMarksForID(accountID) {
    setGettingMarksForID({ ...gettingMarksForIDRef.current, [accountID]: true });
    const status = await AppData.getMarks(accountID);
    setGotMarksForID({ ...gotMarksForIDRef.current, [accountID]: status == 1 });
    setErrorGettingMarksForID({ ...errorGettingMarksForIDRef.current, [accountID]: status != 1 });
    setGettingMarksForID({ ...gettingMarksForIDRef.current, [accountID]: false });
    updateGlobalDisplay();
  }
  useEffect(() => {
    async function autoGetMarks() {
      // Check if not already got marks or is getting marks
      if (gettingMarksForIDRef.current[showMarksAccount.id]) { return; }
      if (gotMarksForIDRef.current[showMarksAccount.id] && !manualRefreshing) { return; }

      // Get marks
      await getMarksForID(showMarksAccount.id);
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
        
        isLoading={isConnecting || gettingMarksForID[showMarksAccount.id]}
        gotMarks={gotMarksForID[showMarksAccount.id]}
        errorGettingMarks={errorGettingMarksForID[showMarksAccount.id]}
        
        globalDisplayUpdater={globalDisplayUpdater}
        navigation={navigation}
      />
      <SubjectsOverview
        accountID={showMarksAccount.id}
        selectedPeriod={selectedPeriod}
        
        globalDisplayUpdater={globalDisplayUpdater}
        navigation={navigation}
      />
    </View>
  );
}

export default EmbeddedMarksPage;
import { useEffect } from "react";
import { View } from "react-native";
import MarksOverview from "./MarksOverview";
import ChildChooser from "./ChildChooser";
import AppData from "../../../core/AppData";
import useState from "react-usestateref";
import HapticsHandler from "../../../core/HapticsHandler";


// Embedded mark page
function EmbeddedMarksPage({
  mainAccount,
  manualRefreshing,
  setManualRefreshing,
}) {
  // Update display
  const [displayRefresher, _increment] = useState(0);
  function updateDisplay() { _increment(displayRefresher + 1); }
  
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
    updateDisplay();
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
    if (showMarksAccount.id) { autoGetMarks(); }
  }, [showMarksAccount.id, manualRefreshing]);  

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
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        gotMarks={gotMarksForID[showMarksAccount.id]}
        gettingMarks={gettingMarksForID[showMarksAccount.id]}
        errorGettingMarks={errorGettingMarksForID[showMarksAccount.id]}
        showMarksAccount={showMarksAccount}
        displayRefresher={displayRefresher}
      />
    </View>
  );
}

export default EmbeddedMarksPage;
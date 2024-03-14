import { useEffect } from "react";
import { View } from "react-native";
import useState from "react-usestateref";
import { DefaultTheme } from "react-native-paper";

import ChildChooser from "./ChildChooser";
import MarksOverview from "./MarksOverview/MarksOverview";
import SubjectsOverview from "./SubjectsOverview/SubjectsOverview";
import HapticsHandler from "../../../util/HapticsHandler";
import AppData from "../../../core/AppData";
import HomeworkStatus from "./Homework/HomeworkStatus";
import CustomSection from "../../components/CustomSection";


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
  const [gotMarksForID, _setGotMarksForID, gotMarksForIDRef] = useState({});
  const [gettingMarksForID, setGettingMarksForID, gettingMarksForIDRef] = useState({});
  const [errorGettingMarksForID, _setErrorGettingMarksForID, errorGettingMarksForIDRef] = useState({});

  // Homework
  const [gotHomeworkForID, _setGotHomeworkForID, gotHomeworkForIDRef] = useState({});
  const [gettingHomeworkForID, setGettingHomeworkForID, gettingHomeworkForIDRef] = useState({});
  const [errorGettingHomeworkForID, _setErrorGettingHomeworkForID, errorGettingHomeworkForIDRef] = useState({});
  
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
        latestCurrentPeriod={latestCurrentPeriod} setLatestCurrentPeriod={setLatestCurrentPeriod}
        
        isLoading={isConnecting || gettingMarksForID[showMarksAccount.id]}
        gotMarks={gotMarksForID[showMarksAccount.id]}
        errorGettingMarks={errorGettingMarksForID[showMarksAccount.id]}
        
        globalDisplayUpdater={globalDisplayUpdater}
        navigation={navigation}
      />
      {latestCurrentPeriod == selectedPeriod && (
        <View>
          <CustomSection
            title={"Devoirs & Contrôles"}
            viewStyle={{ marginHorizontal: 20 }}
            marginTop={10}
            textAreaStyle={{ backgroundColor: DefaultTheme.colors.background }}
          />
          <HomeworkStatus
            accountID={showMarksAccount.id}
            gotHomework={gotHomeworkForID[showMarksAccount.id]}
            isGettingHomework={isConnecting || gettingHomeworkForID[showMarksAccount.id]}
            errorGettingHomework={errorGettingHomeworkForID[showMarksAccount.id]}
            navigation={navigation}
          />
        </View>
      )}

      <CustomSection
        title={"Matières"}
        viewStyle={{ marginHorizontal: 20, top: 15 }}
        marginTop={10}
        textAreaStyle={{ backgroundColor: DefaultTheme.colors.background }}
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
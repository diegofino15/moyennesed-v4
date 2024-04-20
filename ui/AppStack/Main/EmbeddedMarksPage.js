import { useEffect } from "react";
import { Switch, Text, View } from "react-native";
import { ArrowRightIcon, CornerDownRightIcon, InfoIcon, Wand2Icon, UserRoundIcon, ChevronsUpDownIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import ChildChooser from "./ChildChooser";
import MarksOverview from "./MarksOverview/MarksOverview";
import SubjectsOverview from "./SubjectsOverview/SubjectsOverview";
import HapticsHandler from "../../../core/HapticsHandler";
import AppData from "../../../core/AppData";
import HomeworkStatus from "./Homework/HomeworkStatus";
import CustomSection from "../../components/CustomSection";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import CoefficientHandler from "../../../core/CoefficientHandler";
import CustomLink from "../../components/CustomLink";
import CustomChooser from "../../components/CustomChooser";


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
    else if (manualRefreshing) { setManualRefreshing(false); }
  }, [isConnected, showMarksAccount.id, manualRefreshing]);  

  // Selected period
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [latestCurrentPeriod, setLatestCurrentPeriod] = useState(null);

  // Show warning telling the user the guess parameters have been set automatically
  const [showGuessParametersWarning, setShowGuessParametersWarning] = useState({});
  useEffect(() => { AppData.showGuessParametersWarning = (accountID) => setShowGuessParametersWarning({...showGuessParametersWarning, [accountID]: true}) }, []);

  return (
    <View>
      {mainAccount.accountType == "P" && <ChildChooser
        mainAccount={mainAccount}
        showMarksAccount={showMarksAccount}
        setShowMarksAccount={setShowMarksAccount}
      />}
      {showGuessParametersWarning[showMarksAccount.id] && (
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <CustomSection
            title={"Paramètres automatiques"}
            viewStyle={{ marginTop: 0 }}
            textAreaStyle={{ backgroundColor: DefaultTheme.colors.background }}
          />
          <CustomSimpleInformationCard
            content={"Devine coefficient notes"}
            icon={<Wand2Icon size={20} color={DefaultTheme.colors.primary}/>}
            rightIcon={(
              <Switch
                value={CoefficientHandler.guessMarkCoefficientEnabled[showMarksAccount.id]}
                onValueChange={async (value) => {
                  await CoefficientHandler.setGuessMarkCoefficientEnabled(showMarksAccount.id, value);
                  await AppData.recalculateAverageHistory(showMarksAccount.id);
                  updateGlobalDisplay();
                }}
              />
            )}
            style={{ marginBottom: 10 }}
          />
          <CustomSimpleInformationCard
            content={"Devine coefficient matières"}
            icon={<Wand2Icon size={20} color={DefaultTheme.colors.primary}/>}
            rightIcon={(
              <Switch
                value={CoefficientHandler.guessSubjectCoefficientEnabled[showMarksAccount.id]}
                onValueChange={async (value) => {
                  await CoefficientHandler.setGuessSubjectCoefficientEnabled(showMarksAccount.id, value);
                  await AppData.recalculateAverageHistory(showMarksAccount.id);
                  updateGlobalDisplay();
                }}
              />
            )}
          />
          {CoefficientHandler.guessSubjectCoefficientEnabled[showMarksAccount.id] && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CornerDownRightIcon size={30} color={DefaultTheme.colors.onSurface} style={{ marginRight: 5 }}/>
              <CustomSimpleInformationCard
                content={"Niveau"}
                icon={<UserRoundIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                rightIcon={(
                  <CustomChooser
                    defaultItem={(
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[DefaultTheme.fonts.labelLarge, { marginRight: 5 }]}>{CoefficientHandler.choosenProfiles[showMarksAccount.id] ?? "Choisir..."}</Text>
                        <ChevronsUpDownIcon size={20} color={DefaultTheme.colors.onSurface}/>
                      </View>
                    )}
                    selected={CoefficientHandler.choosenProfiles[showMarksAccount.id]}
                    setSelected={async (profile) => {
                      await CoefficientHandler.setChoosenProfile(showMarksAccount.id, profile);
                      await AppData.recalculateAverageHistory(showMarksAccount.id);
                      updateGlobalDisplay();
                    }}
                    items={Object.keys(CoefficientHandler.profiles).map(key => {
                      return {
                        id: key,
                        title: key,
                      }
                    })}
                  />
                )}
                style={{ marginTop: 5, flexGrow: 1 }}
              />
            </View>
          )}
          <CustomLink
            title={"Plus d'infos"}
            icon={<InfoIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            linkIcon={<ArrowRightIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            onPress={() => navigation.navigate('SettingsStack', { openCoefficientsPage: true })}
            style={{ marginTop: 10 }}
          />
          <CustomSection textAreaStyle={{ paddingHorizontal: 0 }} viewStyle={{ marginTop: 0 }}/>
        </View>
      )}
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
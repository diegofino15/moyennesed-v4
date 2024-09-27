import { useEffect } from "react";
import useState from "react-usestateref";
import { Text, View } from "react-native";
import { CornerDownRightIcon, InfoIcon, Wand2Icon, UserRoundIcon, ChevronsUpDownIcon, AlertTriangleIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ChildChooser from "./ChildChooser";
import HomeworkStatus from "./homework/HomeworkStatus";
import MarksOverview from "./marks-overview/MarksOverview";
import SubjectsOverview from "./subjects-overview/SubjectsOverview";
import CustomSection from "../../components/CustomSection";
import CustomChooser from "../../components/CustomChooser";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import AppData from "../../../core/AppData";
import HapticsHandler from "../../../core/HapticsHandler";
import CoefficientHandler from "../../../core/CoefficientHandler";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";


// Embedded mark page
function EmbeddedMarksPage({
  mainAccount,
  refreshLogin,
  isConnected,
  isConnecting,
  manualRefreshing,
  setManualRefreshing,
  navigation,
}) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  
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

  // Get periods of student (and update at every change)
  const [periods, setPeriods] = useState({});
  const [manualUpdater, setManualUpdater] = useState(0);
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (showMarksAccount.id in cacheData) {
        setPeriods(cacheData[showMarksAccount.id].data);
        setManualUpdater(manualUpdater + 1);
      } else { setPeriods({}); }
    });
  }, [showMarksAccount.id, globalDisplayUpdater]);

  return (
    <View>
      {mainAccount.accountType == "P" && <ChildChooser
        mainAccount={mainAccount}
        showMarksAccount={showMarksAccount}
        setShowMarksAccount={setShowMarksAccount}
      />}

      {/* Warning showing when guess parameters have been automatically set */}
      {showGuessParametersWarning[showMarksAccount.id] && (
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <PressableScale style={{
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderColor: theme.colors.surfaceOutline,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }} onPress={() => navigation.navigate('SettingsStack', { openCoefficientsPage: true })}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Wand2Icon size={20} color={theme.colors.primary} style={{ marginRight: 10 }}/>
              <Text style={theme.fonts.bodyLarge}>Paramètres ajustés !</Text>
            </View>
            <InfoIcon size={20} color={theme.colors.onSurfaceDisabled}/>

            {/* Alert badge */}
            <AlertTriangleIcon size={30} color={theme.colors.error} style={{
              position: 'absolute',
              top: -15,
              right: -10,
              zIndex: 1,
              transform: [{
                rotate: '20deg'
              }]
            }}/>
          </PressableScale>
          {CoefficientHandler.guessSubjectCoefficientEnabled[showMarksAccount.id] && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CornerDownRightIcon size={30} color={theme.colors.onSurface} style={{ marginRight: 5 }}/>
              <CustomSimpleInformationCard
                content={"Niveau"}
                icon={<UserRoundIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
                rightIcon={(
                  <CustomChooser
                    defaultItem={(
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[theme.fonts.bodyLarge, { marginRight: 5 }]}>{CoefficientHandler.choosenProfiles[showMarksAccount.id] ?? "Choisir..."}</Text>
                        <ChevronsUpDownIcon size={20} color={theme.colors.onSurface}/>
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
        </View>
      )}

      {/* Global average and recent marks */}
      <MarksOverview
        accountID={showMarksAccount.id}
        selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
        latestCurrentPeriod={latestCurrentPeriod} setLatestCurrentPeriod={setLatestCurrentPeriod}
        periods={periods}

        isLoading={isConnecting || gettingMarksForID[showMarksAccount.id]}
        gotMarks={gotMarksForID[showMarksAccount.id]}
        errorGettingMarks={errorGettingMarksForID[showMarksAccount.id]}
        
        manualUpdater={manualUpdater}
        navigation={navigation}
      />

      {/* Exams and homework overview */}
      {latestCurrentPeriod == selectedPeriod && (
        <View>
          <CustomSection
            title={"Devoirs & Evaluations"}
            viewStyle={{ marginHorizontal: 20 }}
            marginTop={10}
            textAreaStyle={{ backgroundColor: theme.colors.background }}
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

      {/* Subjects */}
      <CustomSection
        title={"Matières"}
        viewStyle={{ marginHorizontal: 20, top: 15 }}
        marginTop={10}
        textAreaStyle={{ backgroundColor: theme.colors.background }}
      />
      <SubjectsOverview
        accountID={showMarksAccount.id}
        selectedPeriod={selectedPeriod}
        latestCurrentPeriod={latestCurrentPeriod}
        periods={periods}
        gotHomework={gotHomeworkForID[showMarksAccount.id]}
        navigation={navigation}
      />
    </View>
  );
}

export default EmbeddedMarksPage;
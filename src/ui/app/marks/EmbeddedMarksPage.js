import { useEffect } from "react";
import useState from "react-usestateref";
import { Text, View } from "react-native";
import { CornerDownRightIcon, InfoIcon, Wand2Icon, UserRoundIcon, ChevronsUpDownIcon, AlertTriangleIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";

import ChildChooser from "./ChildChooser";
import HomeworkStatus from "../homework/HomeworkStatus";
import MarksOverview from "./marks-overview/MarksOverview";
import SubjectsOverview from "./subjects-overview/SubjectsOverview";
import CustomSection from "../../components/CustomSection";
import CustomChooser from "../../components/CustomChooser";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import MarksHandler from "../../../core/MarksHandler";
import CoefficientHandler from "../../../core/CoefficientHandler";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";
import StorageHandler from "../../../core/StorageHandler";


// Embedded mark page
function EmbeddedMarksPage({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  const { accountID, mainAccount } = useCurrentAccountContext(); 

  // Selected period
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [latestCurrentPeriod, setLatestCurrentPeriod] = useState(null);

  // Show warning telling the user the guess parameters have been set automatically
  const [showGuessParametersWarning, setShowGuessParametersWarning] = useState({});
  useEffect(() => { MarksHandler.showGuessParametersWarning = (accountID) => setShowGuessParametersWarning({...showGuessParametersWarning, [accountID]: true}) }, []);

  // Get periods of student (and update at every change)
  const [periods, setPeriods] = useState({});
  useEffect(() => {
    StorageHandler.getData("marks").then((data) => {
      var cacheData = data ?? {};
      if (accountID in cacheData) {
        setPeriods(cacheData[accountID].data);
      } else { setPeriods({}); }
    });
  }, [accountID, globalDisplayUpdater]);

  return (
    <View>
      {mainAccount.accountType == "P" && <ChildChooser/>}

      {/* Warning showing when guess parameters have been automatically set */}
      {showGuessParametersWarning[accountID] && (
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
          }} onPress={() => navigation.navigate('SettingsStack', { screen: 'CoefficientsPage' })}>
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
          {CoefficientHandler.guessSubjectCoefficientEnabled[accountID] && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CornerDownRightIcon size={30} color={theme.colors.onSurface} style={{ marginRight: 5 }}/>
              <CustomSimpleInformationCard
                content={"Niveau"}
                icon={<UserRoundIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
                rightIcon={(
                  <CustomChooser
                    defaultItem={(
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[theme.fonts.bodyLarge, { marginRight: 5 }]}>{CoefficientHandler.choosenProfiles[accountID] ?? "Choisir..."}</Text>
                        <ChevronsUpDownIcon size={20} color={theme.colors.onSurface}/>
                      </View>
                    )}
                    selected={CoefficientHandler.choosenProfiles[accountID]}
                    setSelected={async (profile) => {
                      await CoefficientHandler.setChoosenProfile(accountID, profile);
                      await MarksHandler.recalculateAverageHistory(accountID);
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
        selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
        latestCurrentPeriod={latestCurrentPeriod} setLatestCurrentPeriod={setLatestCurrentPeriod}
        periods={periods}
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
          <HomeworkStatus navigation={navigation}/>
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
        selectedPeriod={selectedPeriod}
        latestCurrentPeriod={latestCurrentPeriod}
        periods={periods}
        navigation={navigation}
      />
    </View>
  );
}

export default EmbeddedMarksPage;
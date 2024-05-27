import { memo, useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { LandPlotIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import CustomSection from "../../components/CustomSection";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import AppData from "../../../core/AppData";


// Settings page
function AdvancedSettingsPage({ globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  // Currently selected account
  const { currentAccount } = route.params;

  // Update screen
  const [forceUpdate, setForceUpdate] = useState(false);
  function updateScreen() { setForceUpdate(!forceUpdate); }
  useEffect(updateScreen, [globalDisplayUpdater]);

  // Competences
  const [countCompetences, setCountCompetences] = useState(false);

  // Init
  useEffect(() => {
    AppData.getPreference("countMarksWithOnlyCompetences").then(setCountCompetences);
  }, [globalDisplayUpdater, forceUpdate]);

  return (
    <CustomModal
      title={"Paramètres avancés"}
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          <CustomSection
            title={"Calcul des moyennes"}
            viewStyle={{ marginTop: 0 }}
          />
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Les notes sans valeur avec seulement des compétences indiquées seront comptées comme des notes sur 4.</Text>
          <CustomSimpleInformationCard
            content={"Compter les compétences"}
            icon={<LandPlotIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            rightIcon={(
              <Switch
                value={countCompetences}
                onValueChange={async (value) => {
                  await AppData.setPreference("countMarksWithOnlyCompetences", value);
                  await AppData.recalculateAverageHistory(currentAccount.id);
                  updateGlobalDisplay();
                }}
              />
            )}
          />
        </View>
      )}
    />
  );
}

export default memo(AdvancedSettingsPage);
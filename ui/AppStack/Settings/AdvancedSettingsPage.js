import { memo, useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { AlertTriangleIcon, BellOffIcon, BellRingIcon, ChevronsUpDownIcon, CornerDownRightIcon, LandPlotIcon, SparklesIcon, UserRoundIcon, Wand2Icon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import CustomSection from "../../components/CustomSection";
import CustomChooser from "../../components/CustomChooser";
import CustomInformationCard from "../../components/CustomInformationCard";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import CoefficientHandler from "../../../core/CoefficientHandler";
import AppData from "../../../core/AppData";
import AsyncStorage from "@react-native-async-storage/async-storage";


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
  
  // Notifications
  const [allowAlertNotifications, setAllowAlertNotifications] = useState(false);
  const [allowNewMarkNotifications, setAllowNewMarkNotifications] = useState(false);

  // Init
  useEffect(() => {
    AppData.getPreference("countMarksWithOnlyCompetences").then(setCountCompetences);
    AppData.getPreference("allowAlertNotifications").then(setAllowAlertNotifications);
    AppData.getPreference("allowNewMarkNotifications").then(setAllowNewMarkNotifications);
  }, [globalDisplayUpdater]);

  return (
    <CustomModal
      title={"Paramètres avancés"}
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify'}]}>Gérez comment les moyennes sont calculées et vos préférences de notifications.</Text>

          <CustomSection
            title={"Calcul des moyennes"}
          />
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

          <CustomSection
            title={"Notifications"}
          />
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Vous recevrez des notifications lorsque l'app est temporairement indisponible, et lorsque le problème sera réglé.</Text>
          <CustomSimpleInformationCard
            content={"Notifications d'alerte"}
            icon={allowAlertNotifications ? (
              <BellRingIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
            ) : (
              <BellOffIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
            )}
            rightIcon={(
              <Switch
                value={allowAlertNotifications}
                onValueChange={async (value) => {
                  await AppData.setPreference("allowAlertNotifications", value);
                  updateGlobalDisplay();
                }}
              />
            )}
          />

          <CustomSection
            title={"À venir..."}
          />
          <CustomSimpleInformationCard
            content={"Pas encore disponible"}
            textStyle={{ color: DefaultTheme.colors.error }}
            icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
            style={{ borderColor: DefaultTheme.colors.error, borderWidth: 2, marginBottom: 10 }}
          />
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Vous recevrez une notification lorsqu'une nouvelle note est saisie.</Text>
          <CustomSimpleInformationCard
            content={"Notif. nouvelle note"}
            textStyle={DefaultTheme.fonts.labelLarge}
            icon={allowNewMarkNotifications ? (
              <BellRingIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
            ) : (
              <BellOffIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
            )}
            rightIcon={(
              <Switch
                value={allowNewMarkNotifications}
                disabled
              />
            )}
          />
        </View>
      )}
    />
  );
}

export default memo(AdvancedSettingsPage);
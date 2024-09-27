import { memo, useEffect } from "react";
import useState from "react-usestateref";
import { View, Text, Switch } from "react-native";
import { ArrowBigRightDashIcon, LandPlotIcon, MoonIcon, SunIcon, TrashIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomLink from "../../../components/CustomLink";
import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomTextArea from "../../../components/CustomTextArea";
import CustomSeparator from "../../../components/CustomSeparator";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";
import { Themes } from "../../../../util/Styles";
import AppData from "../../../../core/AppData";
import HapticsHandler from "../../../../core/HapticsHandler";


// Theme switcher
function ThemeSwitcher() {
  const { theme, changeTheme, isAutoTheme, setIsAutoTheme } = useGlobalAppContext();

  function ThemeButton({ title, icon, background, borderColor, onPress }) {
    return (
      <View style={{ alignItems: "center" }}>
        <PressableScale style={{
          padding: 10,
          borderRadius: 10,
          backgroundColor: background,
          borderWidth: 2,
          borderColor: borderColor,
          justifyContent: "center",
          alignItems: "center",
        }} onPress={onPress}>
          {icon}
        </PressableScale>
        <Text style={theme.fonts.bodyMedium}>{title}</Text>
      </View>
    );
  }

  async function save(savedTheme, isAuto) {
    await AsyncStorage.setItem("theme", JSON.stringify({
      savedTheme,
      isAutoTheme: isAuto,
    }));
  }

  return (
    <CustomTextArea
      children={(
        <View style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}>
          <ThemeButton
            title={"Sombre"}
            icon={<MoonIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            background={"#171B20"}
            borderColor={theme.dark && !isAutoTheme ? theme.colors.primary : "#31363C"}
            onPress={() => {
              changeTheme(Themes.DarkTheme);
              setIsAutoTheme(false);
              save("dark", false);
            }}
          />
          <ThemeButton
            title={"Clair"}
            icon={<SunIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            background={"#E7EDF3"}
            borderColor={!theme.dark && !isAutoTheme ? theme.colors.primary : "#868D96"}
            onPress={() => {
              changeTheme(Themes.LightTheme);
              setIsAutoTheme(false);
              save("light", false);
            }}
          />

          <View style={{ alignItems: "center" }}>
            <PressableScale style={{
              borderRadius: 10,
              backgroundColor: "#E7EDF3",
              borderWidth: 2,
              borderColor: isAutoTheme ? theme.colors.primary : "#868D96",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              overflow: "hidden",
            }} onPress={() => {
              setIsAutoTheme(true);
              save("dark", true);
            }}>
              <View style={{
                width: 22.5,
                height: 45,
                backgroundColor: "#171B20",
              }}/>
              <View style={{
                width: 22.5,
                height: 45,
                backgroundColor: "#E7EDF3",
              }}/>
            </PressableScale>
            <Text style={theme.fonts.bodyMedium}>Auto</Text>
          </View>
        </View>
      )}
    />
  );
}

// Settings page
function AdvancedSettingsPage({ navigation, route }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  
  // Currently selected account
  const { currentAccount } = route.params;

  // Update screen
  const [forceUpdate, setForceUpdate] = useState(false);
  function updateScreen() { setForceUpdate(!forceUpdate); }
  useEffect(updateScreen, [globalDisplayUpdater]);

  // Competences
  const [countCompetences, setCountCompetences] = useState(false);
  useEffect(() => {
    AppData.getPreference("countMarksWithOnlyCompetences").then(setCountCompetences);
  }, [globalDisplayUpdater, forceUpdate]);

  // Vibrations
  const [enableVibrations, setEnableVibrations] = useState(HapticsHandler.enableVibrations);
  useEffect(() => {
    AppData.getPreference("enableVibrations").then(setEnableVibrations);
  }, [globalDisplayUpdater, forceUpdate]);

  return (
    <CustomModal
      title={"Paramètres avancés"}
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          <CustomSection
            title={"Apparence de l'app"}
            viewStyle={{ marginTop: 0 }}
          />
          <ThemeSwitcher/>

          <CustomSection
            title={"Calcul des moyennes"}
          />
          <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Certaines notes ne comportent pas de valeur numérique, ce paramètres permet de les compter dans la moyenne grâce à la notation de leurs compétences.</Text>
          <CustomSimpleInformationCard
            content={"Compter les compétences"}
            textStyle={theme.fonts.bodyLarge}
            icon={<LandPlotIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
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
            title={"Préférences"}
          />
          <CustomSimpleInformationCard
            content={"Activer les vibrations"}
            textStyle={theme.fonts.bodyLarge}
            icon={<LandPlotIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
            rightIcon={(
              <Switch
                value={enableVibrations}
                onValueChange={async (value) => {
                  await HapticsHandler.toggle(value);
                  updateGlobalDisplay();
                }}
              />
            )}
          />

          <CustomSection
            title={"Avancé"}
          />
          <CustomTextArea
            children={(
              <>
                <CustomLink
                  title={"Effacer les coefficients"}
                  textStyle={{ color: theme.colors.error }}
                  icon={<TrashIcon size={20} color={theme.colors.error}/>}
                  linkIcon={<ArrowBigRightDashIcon size={20} color={theme.colors.error}/>}
                  onPress={() => AppData.resetCoefficients(currentAccount, updateGlobalDisplay)}
                />
                <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginTop: 10 }]}>Remettre à 0 les coefficients, et les notes et matières désactivées.</Text>

                <CustomSeparator style={{ backgroundColor: theme.colors.surfaceOutline, marginVertical: 10 }}/>

                <CustomLink
                  title={"Effacer le cache"}
                  textStyle={{ color: theme.colors.error }}
                  icon={<TrashIcon size={20} color={theme.colors.error}/>}
                  linkIcon={<ArrowBigRightDashIcon size={20} color={theme.colors.error}/>}
                  onPress={() => AppData.eraseCacheData()}
                />
                <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginTop: 10 }]}>Supprimer les données stockées sur l'appareil (ex: fichiers attachés aux devoirs, photo de profil...).</Text>
              </>
            )}
          />

          {/* Add here future settings */}
          <View style={{ height: 100 }}/>
        </View>
      )}
    />
  );
}

export default memo(AdvancedSettingsPage);
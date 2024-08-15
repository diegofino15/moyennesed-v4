import { memo, useEffect } from "react";
import useState from "react-usestateref";
import { View, Text, Switch } from "react-native";
import { LandPlotIcon, MoonIcon, SunIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../components/CustomModal";
import CustomSection from "../../components/CustomSection";
import { useAppContext } from "../../../util/AppContext";
import { Themes } from "../../../util/Styles";
import CustomTextArea from "../../components/CustomTextArea";
import AppData from "../../../core/AppData";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";


// Theme switcher
function ThemeSwitcher() {
  const { theme, changeTheme, isAutoTheme, setIsAutoTheme } = useAppContext();

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
function AdvancedSettingsPage({ globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { theme } = useAppContext();
  
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

          {/* Add here future settings */}
        </View>
      )}
    />
  );
}

export default memo(AdvancedSettingsPage);
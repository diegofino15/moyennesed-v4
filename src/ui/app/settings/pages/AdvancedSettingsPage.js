import { memo, useEffect } from "react";
import useState from "react-usestateref";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { ArrowBigRightDashIcon, LandPlotIcon, LockIcon, MoonIcon, SunIcon, TrashIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomLink from "../../../components/CustomLink";
import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomTextArea from "../../../components/CustomTextArea";
import CustomSeparator from "../../../components/CustomSeparator";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import AccountHandler from "../../../../core/AccountHandler";
import MarksHandler from "../../../../core/MarksHandler";
import HapticsHandler from "../../../../core/HapticsHandler";
import { Themes } from "../../../../util/Styles";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../../util/CurrentAccountContext";


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
function AdvancedSettingsPage({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  const { mainAccount } = useCurrentAccountContext();

  // Update screen
  const [forceUpdate, setForceUpdate] = useState(false);
  function updateScreen() { setForceUpdate(!forceUpdate); }
  useEffect(updateScreen, [globalDisplayUpdater]);

  // Competences
  const [countCompetences, setCountCompetences] = useState(false);
  useEffect(() => {
    AccountHandler.getPreference("countMarksWithOnlyCompetences").then(setCountCompetences);
  }, [globalDisplayUpdater, forceUpdate]);

  // Vibrations
  const [enableVibrations, setEnableVibrations] = useState(HapticsHandler.enableVibrations);
  useEffect(() => {
    AccountHandler.getPreference("enableVibrations").then(setEnableVibrations);
  }, [globalDisplayUpdater, forceUpdate]);

  // Is reconnecting
  const [isReconnecting, setIsReconnecting] = useState(false);

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
          <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Certaines notes ne comportent pas de valeur numérique, ce paramètre permet de les compter dans la moyenne grâce à la notation de leurs compétences.</Text>
          <CustomSimpleInformationCard
            content={"Compter les compétences"}
            textStyle={theme.fonts.bodyLarge}
            icon={<LandPlotIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
            rightIcon={(
              <Switch
                value={countCompetences}
                onValueChange={async (value) => {
                  await AccountHandler.setPreference("countMarksWithOnlyCompetences", value);
                  if (mainAccount.accountType == "E") { await MarksHandler.recalculateAverageHistory(mainAccount.id); }
                  else {
                    for (const childID in mainAccount.children) {
                      await MarksHandler.recalculateAverageHistory(childID);
                    }
                  }
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
                  onPress={() => MarksHandler.resetCoefficients(mainAccount, updateGlobalDisplay)}
                />
                <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginTop: 10 }]}>Remettre à zéro les coefficients, et les notes et matières désactivées.</Text>

                <CustomSeparator style={{ backgroundColor: theme.colors.surfaceOutline, marginVertical: 10 }}/>

                <CustomLink
                  title={"Effacer le cache"}
                  textStyle={{ color: theme.colors.error }}
                  icon={<TrashIcon size={20} color={theme.colors.error}/>}
                  linkIcon={<ArrowBigRightDashIcon size={20} color={theme.colors.error}/>}
                  onPress={() => AccountHandler.eraseCacheData()}
                />
                <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginTop: 10 }]}>Supprimer les données stockées sur l'appareil (ex: fichiers attachés aux devoirs, photo de profil...).</Text>
              </>
            )}
          />

          {/* Connection problems */}
          <CustomSection
            title={"Problèmes de connexion"}
          />
          <CustomTextArea
            children={(
              <>
                <CustomLink
                  title={"S'authentifier à nouveau"}
                  textStyle={{ color: theme.colors.error }}
                  icon={<LockIcon size={20} color={theme.colors.error}/>}
                  linkIcon={isReconnecting ? (
                    <ActivityIndicator size={20} color={theme.colors.error}/>
                  ) : (
                    <ArrowBigRightDashIcon size={20} color={theme.colors.error}/>
                  )}
                  onPress={async () => {
                    setIsReconnecting(true);
                    await AsyncStorage.removeItem("double-auth-tokens");
                    await AccountHandler.refreshLogin();
                    setIsReconnecting(false);
                  }}
                />
                <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginTop: 10 }]}>
                  Vous devrez répondre à une question de double authentification, cela peut résoudre certains problèmes de connexion.
                </Text>
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
import { memo, useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import { ChevronsUpDownIcon, CornerDownRightIcon, SparklesIcon, UserRoundIcon, Wand2Icon } from "lucide-react-native";
import CustomSection from "../../components/CustomSection";
import CoefficientHandler from "../../../core/CoefficientHandler";
import CustomChooser from "../../components/CustomChooser";
import AppData from "../../../core/AppData";
import CustomInformationCard from "../../components/CustomInformationCard";


// Settings page
function CoefficientsPage({ globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  // Currently selected account
  const { currentAccount } = route.params;

  // Update screen
  const [forceUpdate, setForceUpdate] = useState(false);
  function updateScreen() { setForceUpdate(!forceUpdate); }
  useEffect(updateScreen, [globalDisplayUpdater]);

  return (
    <CustomModal
      title={"Coefficients"}
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify'}]}>{currentAccount.accountType == "E" ? "Gérez comment MoyennesED choisit les coefficients de chacune de vos matières et notes." : "Gérez comment sont choisis les coefficients des matières et notes de vos enfants."}</Text>

          <CustomInformationCard
            title={"Ajustage automatique"}
            icon={<SparklesIcon size={20} color={DefaultTheme.colors.primary}/>}
            description={"Ces paramètres sont ajustés automatiquement selon les informations que partage ÉcoleDirecte sur vos coefficients."}
            style={{ borderColor: DefaultTheme.colors.primary, marginTop: 20 }}
          />

          {(currentAccount.accountType == "E" ? [currentAccount] : Object.values(currentAccount.children)).map(account => (
            <View key={account.id}>
              <CustomSection
                title={`${account.firstName} ${account.lastName}`}
                textStyle={DefaultTheme.fonts.bodyLarge}
                textAreaStyle={{ height: 22 }}
              />
              <CustomSimpleInformationCard
                content={"Devine coefficient notes"}
                icon={<Wand2Icon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                rightIcon={(
                  <Switch
                    value={CoefficientHandler.guessMarkCoefficientEnabled[account.id]}
                    onValueChange={async (value) => {
                      CoefficientHandler.guessMarkCoefficientEnabled[account.id] = value;
                      await CoefficientHandler.save();
                      await AppData.recalculateAverageHistory(account.id);
                      updateGlobalDisplay();
                    }}
                  />
                )}
                style={{ marginBottom: 10 }}
              />
              <CustomSimpleInformationCard
                content={"Devine coefficient matières"}
                icon={<Wand2Icon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                rightIcon={(
                  <Switch
                    value={CoefficientHandler.guessSubjectCoefficientEnabled[account.id]}
                    onValueChange={async (value) => {
                      CoefficientHandler.guessSubjectCoefficientEnabled[account.id] = value;
                      await CoefficientHandler.save();
                      await AppData.recalculateAverageHistory(account.id);
                      updateGlobalDisplay();
                    }}
                  />
                )}
              />
              {CoefficientHandler.guessSubjectCoefficientEnabled[account.id] && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CornerDownRightIcon size={30} color={DefaultTheme.colors.onSurface} style={{ marginRight: 5 }}/>
                  <CustomSimpleInformationCard
                    content={"Profil de coefficient"}
                    icon={<UserRoundIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                    rightIcon={(
                      <CustomChooser
                        defaultItem={(
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[DefaultTheme.fonts.labelLarge, { marginRight: 5 }]}>{CoefficientHandler.choosenProfiles[account.id] ?? "Choisir..."}</Text>
                            <ChevronsUpDownIcon size={20} color={DefaultTheme.colors.onSurface}/>
                          </View>
                        )}
                        selected={CoefficientHandler.choosenProfiles[account.id]}
                        setSelected={async (profile) => {
                          CoefficientHandler.choosenProfiles[account.id] = profile;
                          await CoefficientHandler.save();
                          await AppData.recalculateAverageHistory(account.id);
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
          ))}

          <CustomSection title={"Plus d'infos"} textStyle={DefaultTheme.fonts.labelLarge} viewStyle={{ marginTop: 30 }}/>
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify' }]}>MoyennesED détecte les mots clés présents dans les noms des matières et notes pour déterminer le coefficient le plus adapté, et préciser les calculs des moyennes.</Text>
          <View style={{ height: 100 }}/> 
        </View>
      )}
    />
  );
}

export default memo(CoefficientsPage);
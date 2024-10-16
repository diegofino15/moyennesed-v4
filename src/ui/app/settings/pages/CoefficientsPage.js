import { memo, useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { ChevronsUpDownIcon, CornerDownRightIcon, SparklesIcon, UserRoundIcon, Wand2Icon } from "lucide-react-native";
import useState from "react-usestateref";

import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomChooser from "../../../components/CustomChooser";
import CustomInformationCard from "../../../components/CustomInformationCard";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CoefficientHandler from "../../../../core/CoefficientHandler";
import MarksHandler from "../../../../core/MarksHandler";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../../util/CurrentAccountContext";


// Settings page
function CoefficientsPage({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  const { mainAccount } = useCurrentAccountContext();

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
          <Text style={[theme.fonts.labelLarge, { textAlign: 'justify'}]}>{mainAccount.accountType == "E" ? "Gérez comment MoyennesED choisit les coefficients de chacune de vos matières et de vos notes." : "Gérez comment sont choisis les coefficients des matières et des notes de vos enfants."}</Text>

          <CustomInformationCard
            title={"Ajustage automatique"}
            icon={<SparklesIcon size={20} color={theme.colors.primary}/>}
            description={"Ces paramètres sont ajustés automatiquement, mais vous pouvez les activer / désactiver à tout moment."}
            style={{ borderColor: theme.colors.primary, marginTop: 20 }}
          />

          {(mainAccount.accountType == "E" ? [mainAccount] : Object.values(mainAccount.children ?? [])).map(account => (
            <View key={account.id}>
              <CustomSection
                title={`${account.firstName} ${account.lastName}`}
                textStyle={theme.fonts.bodyLarge}
                textAreaStyle={{ height: 22 }}
              />
              <CustomSimpleInformationCard
                content={"Devine coef. notes"}
                textStyle={{ color: theme.colors.primary }}
                icon={<Wand2Icon size={20} color={theme.colors.primary}/>}
                rightIcon={(
                  <Switch
                    value={CoefficientHandler.guessMarkCoefficientEnabled[account.id]}
                    onValueChange={async (value) => {
                      await CoefficientHandler.setGuessMarkCoefficientEnabled(account.id, value);
                      await MarksHandler.recalculateAverageHistory(account.id);
                      updateGlobalDisplay();
                    }}
                  />
                )}
                style={{ marginBottom: 10 }}
              />
              <CustomSimpleInformationCard
                content={"Devine coef. matières"}
                textStyle={{ color: theme.colors.primary }}
                icon={<Wand2Icon size={20} color={theme.colors.primary}/>}
                rightIcon={(
                  <Switch
                    value={CoefficientHandler.guessSubjectCoefficientEnabled[account.id]}
                    onValueChange={async (value) => {
                      await CoefficientHandler.setGuessSubjectCoefficientEnabled(account.id, value);
                      await MarksHandler.recalculateAverageHistory(account.id);
                      updateGlobalDisplay();
                    }}
                  />
                )}
              />
              {CoefficientHandler.guessSubjectCoefficientEnabled[account.id] && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CornerDownRightIcon size={30} color={theme.colors.onSurface} style={{ marginRight: 5 }}/>
                  <CustomSimpleInformationCard
                    content={"Niveau"}
                    icon={<UserRoundIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
                    rightIcon={(
                      <CustomChooser
                        defaultItem={(
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[theme.fonts.bodyLarge, { marginRight: 5 }]}>{CoefficientHandler.choosenProfiles[account.id] ?? "Choisir..."}</Text>
                            <ChevronsUpDownIcon size={20} color={theme.colors.onSurface}/>
                          </View>
                        )}
                        selected={CoefficientHandler.choosenProfiles[account.id]}
                        setSelected={async (profile) => {
                          await CoefficientHandler.setChoosenProfile(account.id, profile);
                          await MarksHandler.recalculateAverageHistory(account.id);
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

          <CustomSection title={"Plus d'infos"} textStyle={theme.fonts.labelLarge} viewStyle={{ marginTop: 30 }}/>
          <Text style={[theme.fonts.labelLarge, { textAlign: 'justify' }]}>Dans le cas où un établissement ne fournit pas les coefficients des notes et des matières, MoyennesED essaiera de les deviner grâce à des mots clés. Cela devrait augmenter la précision des moyennes, mais vous pouvez toujours modifier manuellement les coefficients souhaités.</Text>
          <View style={{ height: 100 }}/> 
        </View>
      )}
    />
  );
}

export default memo(CoefficientsPage);
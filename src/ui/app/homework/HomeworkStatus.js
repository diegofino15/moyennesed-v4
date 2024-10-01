import { Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { HelpCircleIcon } from "lucide-react-native";

import CustomAnimatedChangeableItem from "../../components/CustomAnimatedChangeableItem";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// Homework status
function HomeworkStatus({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { isConnected, isConnecting } = useAppStackContext();
  const { gotHomework, isGettingHomework, errorGettingHomework } = useCurrentAccountContext();
  var isLoading = isConnecting || isGettingHomework || (isConnected && !gotHomework);
  var sureGotHomework = gotHomework && !isGettingHomework;

  return (
    <CustomAnimatedChangeableItem
      item={(
        <PressableScale style={{
          backgroundColor: errorGettingHomework ? theme.colors.errorLight : sureGotHomework ? theme.colors.successLight : isLoading ? theme.colors.primaryLight : theme.colors.errorLight,
          borderColor: errorGettingHomework ? theme.colors.error : sureGotHomework ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error,
          borderWidth: 2,
          borderRadius: 5,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 2,
          paddingHorizontal: 5
        }} onPress={() => { navigation.navigate("HomeworkInformationPage"); }}>
          <Text style={[
            theme.fonts.labelMedium, {
              color: errorGettingHomework ? theme.colors.error : sureGotHomework ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error,
              marginRight: 5,
              height: 22,
          }]}>{errorGettingHomework ? "Erreur" : sureGotHomework ? "A jour" : isLoading ? "Chargement" : "Pas à jour"}</Text>
          <HelpCircleIcon size={20} color={errorGettingHomework ? theme.colors.error : sureGotHomework ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error}/>
        </PressableScale>
      )}
      animationTime={200}
      updaters={[
        isLoading,
        errorGettingHomework,
      ]}
    />
  );
}

export default HomeworkStatus;
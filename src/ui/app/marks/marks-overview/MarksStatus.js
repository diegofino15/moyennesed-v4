import { Text } from "react-native";
import { HelpCircleIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";

import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../../util/CurrentAccountContext";


// Marks status
function MarksStatus({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { isConnected, isConnecting } = useAppStackContext();
  const { gotMarks, isGettingMarks, errorGettingMarks } = useCurrentAccountContext();
  var isLoading = isConnecting || isGettingMarks || (isConnected && !gotMarks);
  var sureGotMarks = gotMarks && !isGettingMarks;
  
  return (
    <CustomAnimatedChangeableItem
      item={(
        <PressableScale style={{
          backgroundColor: errorGettingMarks ? theme.colors.errorLight : sureGotMarks ? theme.colors.successLight : isLoading ? theme.colors.primaryLight : theme.colors.errorLight,
          borderWidth: 2,
          borderColor: errorGettingMarks ? theme.colors.error : sureGotMarks ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error,
          borderRadius: 5,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 2,
          paddingHorizontal: 5
        }} onPress={() => { navigation.navigate("MarksInformationPage"); }} onLongPress={__DEV__ ? () => {} : undefined}>
          <Text style={[
            theme.fonts.labelMedium, {
              color: errorGettingMarks ? theme.colors.error : sureGotMarks ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error,
              marginRight: 5,
              height: 22,
          }]}>{errorGettingMarks ? "Erreur" : sureGotMarks ? "A jour" : isLoading ? "Chargement" : "Pas à jour"}</Text>
          <HelpCircleIcon size={20} color={errorGettingMarks ? theme.colors.error : sureGotMarks ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error}/>
        </PressableScale>
      )}
      animationTime={200}
      updaters={[
        isLoading,
        errorGettingMarks,
      ]}
    />
  );
}

export default MarksStatus;
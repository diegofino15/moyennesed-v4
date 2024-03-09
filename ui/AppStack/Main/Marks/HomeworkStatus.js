import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { HelpCircleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";


// Homework status
function HomeworkStatus({ accountID, gotHomework, isGettingHomework, errorGettingHomework, navigation }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: DefaultTheme.colors.surface,
      padding: 10,
      borderRadius: 10,
    }}>
      {/* Loading status */}
      <PressableScale style={{
        backgroundColor: isGettingHomework ? DefaultTheme.colors.primaryLight : gotHomework ? DefaultTheme.colors.successLight : DefaultTheme.colors.errorLight,
        borderWidth: 2,
        borderColor: isGettingHomework ? DefaultTheme.colors.primary : gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
      }} onPress={() => { if (!isGettingHomework) { navigation.navigate("HomeworkInformationPage", { accountID }); } }}>
        <Text style={[
          DefaultTheme.fonts.labelMedium, {
            color: isGettingHomework ? DefaultTheme.colors.primary : gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error,
            marginVertical: 2,
            marginHorizontal: 5,
            height: 22,
        }]}>{isGettingHomework ? "Chargement..." : gotHomework ? "Contrôles à jour" : errorGettingHomework ? "Erreur" : "Pas à jour"}</Text>
        {(!isGettingHomework) && <HelpCircleIcon size={20} color={gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error} style={{ marginRight: 5 }}/>}
      </PressableScale>
    </View>
  );
}

export default HomeworkStatus;
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { HelpCircleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Homework status
function HomeworkStatus({ accountID, gotHomework, isGettingHomework, errorGettingHomework, navigation }) {
  const [totalTests, setTotalTests] = useState(0);
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      if (!data) { return; }
      const cacheData = JSON.parse(data);
      if (accountID in cacheData) {
        setTotalTests(cacheData[accountID].data.totalTests);
      }
    });
  }, [accountID, gotHomework]);
  
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: DefaultTheme.colors.surface,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
    }}>
      <Text style={DefaultTheme.fonts.bodyMedium}>{totalTests ? totalTests : "Aucun"} contrôle{totalTests > 1 && "s"} à venir</Text>

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
        }]}>{isGettingHomework ? "Chargement..." : gotHomework ? "À jour" : errorGettingHomework ? "Erreur" : "Pas à jour"}</Text>
        {(!isGettingHomework) && <HelpCircleIcon size={20} color={gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error} style={{ marginRight: 5 }}/>}
      </PressableScale>
    </View>
  );
}

export default HomeworkStatus;
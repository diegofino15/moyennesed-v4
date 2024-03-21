import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon, HelpCircleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Homework status
function HomeworkStatus({ accountID, gotHomework, isGettingHomework, errorGettingHomework, navigation }) {
  const [totalExams, setTotalExams] = useState(0);
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      if (!data) { return; }
      const cacheData = JSON.parse(data);
      if (accountID in cacheData) {
        setTotalExams(cacheData[accountID].data.totalExams);
      }
    });
  }, [accountID, gotHomework]);
  
  return (
    <View style={{
      marginHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Middle bar */}
      <View style={{
        position: 'absolute',
        width: '100%',
        height: 3,
        backgroundColor: DefaultTheme.colors.surfaceOutline,
      }}/>
      
      {/* Loading status */}
      <View style={{ backgroundColor: DefaultTheme.colors.background, paddingRight: 10 }}>
        <PressableScale style={{
          backgroundColor: isGettingHomework ? DefaultTheme.colors.primaryLight : gotHomework ? DefaultTheme.colors.successLight : DefaultTheme.colors.errorLight,
          borderWidth: 2,
          borderColor: isGettingHomework ? DefaultTheme.colors.primary : gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error,
          borderRadius: 5,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 2,
          paddingHorizontal: 5,
        }} onPress={() => { if (!isGettingHomework) { navigation.navigate("HomeworkInformationPage", { accountID }); } }}>
          <Text style={[
            DefaultTheme.fonts.labelMedium, {
              color: isGettingHomework ? DefaultTheme.colors.primary : gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error,
              marginRight: 5,
              height: 22,
          }]}>{isGettingHomework ? "Chargement..." : gotHomework ? "À jour" : errorGettingHomework ? "Erreur" : "Pas à jour"}</Text>
          {(!isGettingHomework) && <HelpCircleIcon size={20} color={gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error}/>}
        </PressableScale>
      </View>

      {/* Homework */}
      <View style={{ backgroundColor: DefaultTheme.colors.background, paddingLeft: 5 }}>
        <PressableScale style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 5,
          marginLeft: 5,
          paddingVertical: 5,
          paddingLeft: 10,
          paddingRight: 5,
        }} onPress={() => { navigation.navigate("HomeworksPage", { accountID }); }}>
          <Text style={[DefaultTheme.fonts.labelMedium, { marginRight: 5, height: 22 }]}>Travail à faire</Text>
          <ArrowRightIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
        </PressableScale>
      </View>
    </View>
  );
}

export default HomeworkStatus;
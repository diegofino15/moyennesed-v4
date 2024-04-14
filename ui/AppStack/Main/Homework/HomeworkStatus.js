import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon, HelpCircleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";

import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";


// Homework status
function HomeworkStatus({ accountID, gotHomework, isGettingHomework, errorGettingHomework, navigation }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 10,
      padding: 10,
    }}>
      {/* Loading status */}
      <CustomAnimatedChangeableItem
        item={(
          <PressableScale style={{
            backgroundColor: isGettingHomework ? DefaultTheme.colors.primaryLight : gotHomework ? DefaultTheme.colors.successLight : DefaultTheme.colors.errorLight,
            borderWidth: 2,
            borderColor: isGettingHomework ? DefaultTheme.colors.primary : gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 2,
            paddingHorizontal: 5,
            marginRight: 10,
          }} onPress={() => { if (!isGettingHomework) { navigation.navigate("HomeworkInformationPage", { accountID }); } }}>
            <Text style={[
              DefaultTheme.fonts.labelMedium, {
                color: isGettingHomework ? DefaultTheme.colors.primary : gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error,
                marginRight: 5,
                height: 22,
            }]}>{isGettingHomework ? "Chargement..." : gotHomework ? "À jour" : errorGettingHomework ? "Erreur" : "Pas à jour"}</Text>
            {(!isGettingHomework) && <HelpCircleIcon size={20} color={gotHomework ? DefaultTheme.colors.success : DefaultTheme.colors.error}/>}
          </PressableScale>
        )}
        animationTime={200}
        updaters={[
          isGettingHomework,
          gotHomework,
          errorGettingHomework,
        ]}
      />
      
      {/* Middle bar */}
      <View style={{
        flexGrow: 1,
        height: 3,
        backgroundColor: DefaultTheme.colors.surfaceOutline,
      }}/>

      {/* Homework */}
      <PressableScale style={{
        backgroundColor: DefaultTheme.colors.background,
        borderWidth: 2,
        borderColor: DefaultTheme.colors.surfaceOutline,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 5,
        marginLeft: 10,
        paddingVertical: 5,
        paddingLeft: 10,
        paddingRight: 5,
      }} onPress={() => { navigation.navigate("HomeworksPage", { accountID }); }}>
        <Text style={[DefaultTheme.fonts.labelMedium, { marginRight: 5, height: 22 }]}>Travail à faire</Text>
        <ArrowRightIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
      </PressableScale>
    </View>
  );
}

export default HomeworkStatus;
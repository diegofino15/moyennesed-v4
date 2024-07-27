import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon, HelpCircleIcon } from "lucide-react-native";

import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import { useAppContext } from "../../../../util/AppContext";


// Homework status
function HomeworkStatus({ accountID, gotHomework, isGettingHomework, errorGettingHomework, navigation }) {
  const { theme } = useAppContext();

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      padding: 10,
    }}>
      {/* Loading status */}
      <CustomAnimatedChangeableItem
        item={(
          <PressableScale style={{
            backgroundColor: isGettingHomework ? theme.colors.primaryLight : gotHomework ? theme.colors.successLight : theme.colors.errorLight,
            borderWidth: 2,
            borderColor: isGettingHomework ? theme.colors.primary : gotHomework ? theme.colors.success : theme.colors.error,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 2,
            paddingHorizontal: 5,
            marginRight: 10,
          }} onPress={() => { if (!isGettingHomework) { navigation.navigate("HomeworkInformationPage", { accountID }); } }}>
            <Text style={[
              theme.fonts.labelMedium, {
                color: isGettingHomework ? theme.colors.primary : gotHomework ? theme.colors.success : theme.colors.error,
                marginRight: 5,
                height: 22,
            }]}>{isGettingHomework ? "Chargement..." : gotHomework ? "À jour" : errorGettingHomework ? "Erreur" : "Pas à jour"}</Text>
            {(!isGettingHomework) && <HelpCircleIcon size={20} color={gotHomework ? theme.colors.success : theme.colors.error}/>}
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
        backgroundColor: theme.colors.surfaceOutline,
      }}/>

      {/* Homework */}
      <PressableScale style={{
        backgroundColor: theme.colors.background,
        borderWidth: 2,
        borderColor: theme.colors.surfaceOutline,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 5,
        marginLeft: 10,
        paddingVertical: 5,
        paddingLeft: 10,
        paddingRight: 5,
      }} onPress={() => { navigation.navigate("HomeworksPage", { accountID }); }}>
        <Text style={[theme.fonts.labelMedium, { marginRight: 5, height: 22 }]}>Travail à faire</Text>
        <ArrowRightIcon size={20} color={theme.colors.onSurfaceDisabled}/>
      </PressableScale>
    </View>
  );
}

export default HomeworkStatus;
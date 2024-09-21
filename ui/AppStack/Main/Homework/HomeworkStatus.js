import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon, HelpCircleIcon, NotebookPenIcon } from "lucide-react-native";

import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import { useAppContext } from "../../../../util/AppContext";


// Homework status
function HomeworkStatus({ accountID, gotHomework, isGettingHomework, errorGettingHomework, navigation }) {
  const { theme } = useAppContext();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 20 }}>
      {/* Loading status */}
      <CustomAnimatedChangeableItem
        item={(
          <PressableScale style={{
            backgroundColor: isGettingHomework ? theme.colors.primaryLight : gotHomework ? theme.colors.successLight : theme.colors.errorLight,
            borderColor: isGettingHomework ? theme.colors.primary : gotHomework ? theme.colors.success : theme.colors.error,
            borderWidth: 2,
            borderBottomLeftRadius: 10,
            borderTopLeftRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            height: 45,
          }} onPress={() => { if (!isGettingHomework) { navigation.navigate("HomeworkInformationPage", { accountID }); } }}>
            <Text style={[
              theme.fonts.labelMedium, {
                color: isGettingHomework ? theme.colors.primary : gotHomework ? theme.colors.success : theme.colors.error,
                marginRight: 5,
                height: 22,
            }]}>{isGettingHomework ? "Chargement" : gotHomework ? "A jour" : errorGettingHomework ? "Erreur" : "Pas à jour"}</Text>
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
      
      {/* Button */}
      <PressableScale style={{
        backgroundColor: theme.colors.surface,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.surfaceOutline,
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginLeft: 5,
        height: 45,
      }} onPress={() => { navigation.navigate("UpcomingHomeworkPage", { accountID, _errorGettingHomework: errorGettingHomework }); }}>
        <View/>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <NotebookPenIcon size={20} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>
          <Text style={theme.fonts.bodyLarge}>Travail à faire</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.onSurfaceDisabled}/>
      </PressableScale>
    </View>
  );
}

export default HomeworkStatus;
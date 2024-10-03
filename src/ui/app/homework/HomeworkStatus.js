import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon, HelpCircleIcon, NotebookPenIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomAnimatedChangeableItem from "../../components/CustomAnimatedChangeableItem";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// Homework status
function HomeworkStatus({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { isConnected, isConnecting, globalDisplayUpdater } = useAppStackContext();
  const { accountID, gotHomework, isGettingHomework, errorGettingHomework } = useCurrentAccountContext();
  var isLoading = isConnecting || isGettingHomework || (isConnected && !gotHomework);
  var sureGotHomework = gotHomework && !isGettingHomework;

  // Get abstract homeworks (to load the UpcomingHomeworkPage faster)
  const [abstractHomeworks, setAbstractHomeworks] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        let newAbstractHomeworks = cacheData[accountID].data;
        Object.keys(cacheData[accountID].data.days).map(day => {
          newAbstractHomeworks.days[day] = cacheData[accountID].data.days[day].map(examID => cacheData[accountID].data.homeworks[examID]);
        });
        setAbstractHomeworks(newAbstractHomeworks);
      }
    });
  }, [globalDisplayUpdater]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 20 }}>
      {/* Loading status */}
      <CustomAnimatedChangeableItem
        item={(
          <PressableScale style={{
            backgroundColor: errorGettingHomework ? theme.colors.errorLight : sureGotHomework ? theme.colors.successLight : isLoading ? theme.colors.primaryLight : theme.colors.errorLight,
            borderColor: errorGettingHomework ? theme.colors.error : sureGotHomework ? theme.colors.success : isLoading ? theme.colors.primary : theme.colors.error,
            borderWidth: 2,
            borderBottomLeftRadius: 10,
            borderTopLeftRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            height: 45,
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
      }} onPress={() => { navigation.navigate("UpcomingHomeworkPage", { cacheAbstractHomeworks: abstractHomeworks }); }}>
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
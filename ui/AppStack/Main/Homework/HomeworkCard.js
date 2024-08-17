import { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CheckIcon, CircleIcon } from "lucide-react-native";

import AppData from "../../../../core/AppData";
import ColorsHandler from "../../../../core/ColorsHandler";
import HapticsHandler from "../../../../core/HapticsHandler";
import { useAppContext } from "../../../../util/AppContext";
import { asyncExpectedResult } from "../../../../util/Utils";


// Homework card
function HomeworkCard({
  accountID,
  cacheHomework,
  specificHomework,
  isLoading,
  updateGlobalDisplay,
  navigation,
}) {
  const { theme } = useAppContext();
  
  // Get subject
  const { light, dark } = ColorsHandler.getSubjectColors(cacheHomework.subjectID);

  // Change homework done status
  const [isDone, setIsDone] = useState(cacheHomework.done);
  useEffect(() => { setIsDone(cacheHomework.done); }, [cacheHomework.done]);
  function toggleDone() {
    HapticsHandler.vibrate("light");
    asyncExpectedResult(
      async () => await AppData.markHomeworkAsDone(accountID, cacheHomework.id, !isDone),
      (done) => {
        setIsDone(done);
        updateGlobalDisplay();
      },
      () => setIsDone(!isDone),
    );
  }

  return (
    <View style={{
      marginVertical: 5,
    }}>
      {/* Exam label */}
      {cacheHomework.isExam && (
        <View style={{
          fontFamily: "Text-Italic",
          paddingHorizontal: 10,
          marginLeft: 10,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: theme.colors.error,
          position: 'absolute',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          height: 30,
        }}>
          <Text style={[theme.fonts.bodyMedium, {
            color: theme.colors.error,
          }]}>CONTRÔLE</Text>
        </View>
      )}
      
      <View style={{
        marginTop: cacheHomework.isExam ? 23 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <PressableScale style={{
          backgroundColor: dark,
          paddingHorizontal: 5,
          paddingVertical: 5,
          borderRadius: 10,
          alignItems: 'center',
        }} onPress={() => {
          if (!isLoading) { navigation.navigate("HomeworkPage", { accountID, cacheHomework, cacheSpecificHomework: specificHomework }); }
        }}>
          <Text style={[theme.fonts.bodyLarge, {
            color: 'black',
            width: Dimensions.get('window').width - 125,
            marginHorizontal: 10,
            marginVertical: 5,
          }]} numberOfLines={1}>{cacheHomework.subjectTitle}</Text>

          {specificHomework && !isDone && (
            <View style={{
              backgroundColor: light,
              width: Dimensions.get('window').width - 105,
              borderRadius: 5,
              paddingHorizontal: 5,
              paddingVertical: 2,
              maxHeight: 50,
            }}>
              <Text style={[theme.fonts.bodyMedium, {
                color: "black",
              }]} numberOfLines={2}>{specificHomework.todo} TODO et il y a aussi d'autres choses à faire, la liste est longue. Exercice 1, page 265, cahier numéro 5.</Text>
            </View>
          )}
        </PressableScale>

        {/* Toggle done */}
        <PressableScale style={{
          padding: 10,
        }} onPress={toggleDone}>
          {isDone ? (
            <View style={{
              padding: 5,
              borderRadius: 15,
              backgroundColor: cacheHomework.isExam ? theme.colors.error : light,
            }}>
              <CheckIcon size={18} color={'black'}/>
            </View>
          ) : (
            <CircleIcon size={28} color={cacheHomework.isExam ? theme.colors.error : light}/>
          )}
        </PressableScale>
      </View>
    </View>
  );
}

export default HomeworkCard;
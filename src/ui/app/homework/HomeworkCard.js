import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CheckIcon, CircleIcon } from "lucide-react-native";

import AppData from "../../../core/AppData";
import ColorsHandler from "../../../core/ColorsHandler";
import HapticsHandler from "../../../core/HapticsHandler";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";
import { asyncExpectedResult } from "../../../util/Utils";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// Homework card
function HomeworkCard({
  cacheHomework,
  specificHomework,
  isLoading,
  windowWidth,
  navigation,
}) {
  const { theme } = useGlobalAppContext();
  const { updateGlobalDisplay } = useAppStackContext();
  const { accountID } = useCurrentAccountContext();
  
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
          }]}>EVALUATION</Text>
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
          if (!isLoading) { navigation.navigate("HomeworkPage", { cacheHomework, cacheSpecificHomework: specificHomework }); }
        }}>
          <Text style={[theme.fonts.bodyLarge, {
            color: 'black',
            width: windowWidth - 145,
            marginHorizontal: 10,
            marginVertical: 5,
          }]} numberOfLines={1}>{cacheHomework.subjectTitle}</Text>
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
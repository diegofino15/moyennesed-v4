import { useState } from "react";
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { CheckCircleIcon, CircleIcon } from "lucide-react-native";

import { formatDate2, asyncExpectedResult } from "../../../../../util/Utils";
import AppData from "../../../../../core/AppData";


// Exam card
function HomeworkCard({
  accountID,
  abstractExam,
  specificExam,
}) {
  // Change homework done status
  const [isDone, setIsDone] = useState(abstractExam.done);
  function toggleDone() {
    asyncExpectedResult(
      async () => await AppData.markHomeworkAsDone(accountID, abstractExam.id, !isDone),
      (done) => setIsDone(done),
      () => setIsDone(!isDone),
    );
  }

  
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginVertical: 5,
    }}>
      <PressableScale style={{
        top: -5,
        right: -10,
      }} onPress={toggleDone}>
        {isDone ? (
          <CheckCircleIcon size={30} color={DefaultTheme.colors.onSurface}/>
        ) : (
          <CircleIcon size={30} color={DefaultTheme.colors.onSurface}/>
        )}
      </PressableScale>

      <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: "Text-Italic" }]}>Donné par {specificExam?.givenBy} le {formatDate2(abstractExam.dateGiven)}</Text>
    </View>
  );
}

export default HomeworkCard;
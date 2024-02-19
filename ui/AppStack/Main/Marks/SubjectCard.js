import { Text, View } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";

import { formatAverage } from "../../../../util/Utils";


// Subject card
function SubjectCard({ accountID, periodID, subject, navigation }) {
  function openSubjectPage(subID) {
    navigation.navigate("SubjectPage", {
      accountID: accountID,
      periodID: periodID,
      subjectID: subject.id,
      subSubjectID: subID,
    });
  }
  
  return (
    <PressableScale style={{
      marginVertical: 5,
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    }} onPress={() => openSubjectPage(null)}>
      <Text style={DefaultTheme.fonts.labelLarge}>{subject.title}</Text>
      
      <Text style={DefaultTheme.fonts.headlineMedium}>{formatAverage(subject.average)}</Text>
    </PressableScale>
  );
}

export default SubjectCard;
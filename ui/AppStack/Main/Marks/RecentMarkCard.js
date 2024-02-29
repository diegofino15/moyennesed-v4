import { memo, useEffect } from "react";
import useState from "react-usestateref";
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";

import ColorsHandler from "../../../../util/ColorsHandler";
import { formatDate2 } from "../../../../util/Utils";
import CustomChangingText from "../../../components/CustomChangingText";


// Date text
function InfoText({ subjectTitle, subSubjectTitle, date }) {
  const [showDate, setShowDate, showDateRef] = useState(false);
  async function toggleShowDate() { setShowDate(!showDateRef.current); }

  return (
    <CustomChangingText
      text={showDate ? formatDate2(date) : `${subjectTitle ?? ''}${subSubjectTitle ? ` - ${subSubjectTitle}` : ''}`}
      changeTextContent={toggleShowDate}
      refreshRate={5 * 1000}
      animationTime={500}
      style={DefaultTheme.fonts.labelSmall}
    />
  );
}


// Recent mark card
function RecentMarkCard({ accountID, mark, getSubject, navigation }) {
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);
  
  // Open mark details
  function openMarkDetails() {
    navigation.navigate("SubjectStack", {
      accountID,
      subject: getSubject(),
      subSubjectID: mark.subSubjectID,
      openMarkID: mark.id,
    });
  }

  return (
    <PressableScale style={{
      height: 90,
      width: 300,
      backgroundColor: DefaultTheme.colors.background,
      borderRadius: 10,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
    }} onPress={openMarkDetails}>
      {/* Mark value */}
      <View style={{
        backgroundColor: light,
        width: 60,
        height: 60,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}>
        <Text style={[DefaultTheme.fonts.headlineMedium, { color: 'black' }]}>{mark.valueStr}</Text>

        {mark.valueOn != 20 && (
          <View style={{
            position: 'absolute',
            right: -5,
            bottom: -5,
            paddingVertical: 2,
            paddingHorizontal: 5,
            borderRadius: 5,
            backgroundColor: dark ?? 'black',
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 0 },
          }}>
            <Text style={[DefaultTheme.fonts.headlineSmall, { color: 'black', fontSize: 15 }]}>/{mark.valueOn}</Text>
          </View>
        )}
      </View>

      {/* Mark details */}
      <View style={{
        justifyContent: 'space-evenly',
        width: 200,
      }}>
        <Text style={DefaultTheme.fonts.bodyMedium} numberOfLines={2}>{mark.title}</Text>
        <InfoText subjectTitle={getSubject().title} subSubjectTitle={mark.subSubjectID ? getSubject().subSubjects[mark.subSubjectID].title : null} date={mark.date}/>
      </View>
    </PressableScale>
  );
}

export default memo(RecentMarkCard);
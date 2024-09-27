import { memo } from "react";
import useState from "react-usestateref";
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import ColorsHandler from "../../../../src/core/ColorsHandler";
import { formatDate2 } from "../../../../src/util/Utils";
import CustomChangingText from "../../../components/CustomChangingText";
import CustomTag from "../../../components/CustomTag";
import { useGlobalAppContext } from "../../../../src/util/GlobalAppContext";


// Date text
function InfoText({ subjectTitle, subSubjectTitle, date }) {
  const { theme } = useGlobalAppContext();
  
  const [showDate, setShowDate, showDateRef] = useState(false);
  async function toggleShowDate() { setShowDate(!showDateRef.current); }

  return (
    <CustomChangingText
      text={showDate ? formatDate2(date) : `${subjectTitle ?? ''}${subSubjectTitle ? ` - ${subSubjectTitle}` : ''}`}
      changeTextContent={toggleShowDate}
      refreshRate={5 * 1000}
      animationTime={500}
      style={theme.fonts.labelSmall}
    />
  );
}


// Recent mark card
function RecentMarkCard({ accountID, mark, getSubject, showNewLabel=false, navigation }) {
  const { theme } = useGlobalAppContext();
  
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);
  
  // Open mark details
  function openMarkDetails() {
    navigation.navigate("SubjectStack", {
      accountID,
      cacheSubject: mark.subSubjectID ? getSubject().subSubjects[mark.subSubjectID] : getSubject(),
      cacheMark: mark,
    });
  }

  return (
    <PressableScale style={{
      height: 90,
      width: 300,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      padding: 13,
      borderWidth: 2,
      borderColor: theme.colors.surfaceOutline,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 7.5,
      marginBottom: 10,
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
        <Text style={[theme.fonts.headlineMedium, { color: 'black' }]}>{mark.valueStr ? mark.valueStr : "--"}</Text>

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
            <Text style={[theme.fonts.headlineSmall, { color: 'black', fontSize: 15 }]}>/{mark.valueOn}</Text>
          </View>
        )}
      </View>

      {/* Mark details */}
      <View style={{
        justifyContent: 'space-evenly',
        width: 200,
      }}>
        <Text style={theme.fonts.bodyMedium} numberOfLines={2}>{mark.title}</Text>
        <InfoText subjectTitle={getSubject().title} subSubjectTitle={mark.subSubjectID ? getSubject().subSubjects[mark.subSubjectID].title : null} date={mark.date}/>
      </View>

      {/* Is effective ? */}
      {!mark.isEffective && (
        <CustomTag
          title={"Non significative"}
          color={theme.colors.error}
          onBottom
        />
      )}

      {/* Is new ? */}
      {showNewLabel && (
        <CustomTag
          title={"NOUVEAU"}
          color={theme.colors.error}
          style={{ paddingVertical: 0 }}
        />
      )}
    </PressableScale>
  );
}

export default memo(RecentMarkCard);
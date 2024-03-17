import { Dimensions, FlatList, Text, View } from "react-native";
import { AlertOctagonIcon, CornerDownRightIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";

import CustomTag from "../../../components/CustomTag";
import { formatAverage, formatMark } from "../../../../util/Utils";
import ColorsHandler from "../../../../util/ColorsHandler";


// Embedded subject card
function EmbeddedSubjectCard({
  accountID,
  subject,
  getMark,
  hasExam,
  navigation,
}) {
  const { light, dark } = ColorsHandler.getSubjectColors(subject.id)
  
  // Open subject page
  function openSubjectPage() {
    navigation.navigate("SubjectStack", {
      accountID,
      cacheSubject: subject,
    });
  }

  // Open exam page
  function openExamPage() {
    navigation.navigate("ExamPage", {
      accountID,
      subjectTitle: subject.title,
      examIDs: hasExam,
    })
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {subject.subID && (
        <CornerDownRightIcon
          size={40}
          color={DefaultTheme.colors.onSurfaceDisabled}
          style={{ marginRight: 5 }}
        />
      )}

      <PressableScale style={{
        backgroundColor: light,
        borderRadius: 10,
        marginVertical: 5,
        width: Dimensions.get('window').width - (subject.subID ? 85 : 40),
      }} onPress={openSubjectPage}>
        <View style={{
          backgroundColor: dark,
          borderRadius: 10,
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 0 },
        }}>
          <Text style={[DefaultTheme.fonts.bodyLarge, {
            color: 'black',
            width: Dimensions.get('window').width - (subject.subID ? 195 : 150),
            height: 25,
          }]} numberOfLines={1}>{subject.title}</Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
            <Text style={[DefaultTheme.fonts.headlineMedium, { color: 'black' }]}>{formatAverage(subject.average)}</Text>
            {subject.average && <Text style={[DefaultTheme.fonts.labelSmall, { color: 'black', fontFamily: "Numbers-Medium" }]}>/20</Text>}
          </View>
        </View>
        
        {!Object.keys(subject.subSubjects).length && subject.marks.length ? (
          <View style={{
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}>
            <FlatList
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              data={subject.sortedMarks}
              renderItem={({ item }) => {
                const mark = getMark(item);
                return (
                  <Text style={[DefaultTheme.fonts.headlineMedium, {
                    color: 'black',
                    opacity: mark.isEffective ? 1 : 0.2,
                    fontFamily: "Numbers-Regular",
                  }]}>{formatMark(mark)}</Text>
                );
              }}
              ItemSeparatorComponent={<View style={{ width: 12.5 }}/>} 
            />
          </View>
        ) : null}

        {/* Has exam */}
        {hasExam && (
          <CustomTag
            title={"Alerte contrôle"}
            icon={<AlertOctagonIcon size={15} color={'white'}/>}
            color={DefaultTheme.colors.error}
            secondaryTag={hasExam.length > 1 && <Text style={[DefaultTheme.fonts.labelMedium, { color: 'white' }]}>{hasExam.length}</Text>}
            onPress={openExamPage}
            offset={15}
            shadow
            style={{ paddingHorizontal: 10, paddingVertical: 3 }}
          />
        )}
      </PressableScale>
    </View>
  );
}

// Main subject card
function SubjectCard({
  accountID,
  subject,
  getMark,
  hasExam,
  navigation,
}) {
  return (
    <View style={{ marginTop: hasExam ? 10 : 0 }}>
      <EmbeddedSubjectCard
        accountID={accountID}
        subject={subject}
        getMark={getMark}
        hasExam={hasExam}
        navigation={navigation}
      />

      {/* Sub subjects */}
      {Object.values(subject.subSubjects).map((subSubject, index) => (
        <EmbeddedSubjectCard
          key={index}
          accountID={accountID}
          subject={subSubject}
          getMark={getMark}
          navigation={navigation}
        />
      ))}
    </View>
  );
}

export default SubjectCard;
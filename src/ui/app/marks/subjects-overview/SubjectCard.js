import { Dimensions, FlatList, Text, View } from "react-native";
import { AlertOctagonIcon, CornerDownRightIcon, MegaphoneOffIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";

import CustomTag from "../../../components/CustomTag";
import ColorsHandler from "../../../../core/ColorsHandler";
import { formatAverage, formatMark } from "../../../../util/Utils";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";


// Embedded subject card
function EmbeddedSubjectCard({
  subject,
  getMark,
  hasExam,
  countMarksWithOnlyCompetences,
  navigation,
}) {
  const { theme } = useGlobalAppContext();

  const { light, dark } = ColorsHandler.getSubjectColors(subject.id)
  
  // Open subject page
  function openSubjectPage() {
    navigation.navigate("SubjectStack", {
      cacheSubject: subject,
    });
  }

  // Open exam page
  function openExamPage() {
    navigation.navigate("ExamPage", {
      subjectTitle: subject.title,
      examIDs: hasExam,
    })
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      {subject.subID ? (
        <CornerDownRightIcon
          size={40}
          color={theme.colors.onSurfaceDisabled}
          style={{ marginRight: 5 }}
        />
      ) : null}

      <PressableScale style={{
        backgroundColor: light,
        borderRadius: 10,
        marginVertical: 5,
        flexGrow: 1,
        maxWidth: Dimensions.get('window').width - (subject.subID ? 85 : 40),
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!subject.isEffective && (
              <MegaphoneOffIcon size={20} color={'black'} style={{ marginRight: 5 }}/>
            )}
            <Text style={[theme.fonts.bodyLarge, {
              color: 'black',
              width: Dimensions.get('window').width - (subject.subID ? 195 : 150) - (subject.isEffective ? 0 : 25),
              height: 25,
            }]} numberOfLines={1}>{subject.title}</Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
            <Text style={[theme.fonts.headlineMedium, { color: 'black' }]}>{formatAverage(subject.average)}</Text>
            {subject.average ? <Text style={[theme.fonts.labelSmall, { color: 'black', fontFamily: "Numbers-Medium" }]}>/20</Text> : null}
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
              contentContainerStyle={{
                alignItems: "center"
              }}
              renderItem={({ item }) => {
                const mark = getMark(item);
                return !mark.onlyHasCompetences ? (
                  <Text style={[theme.fonts.headlineMedium, {
                    color: 'black',
                    opacity: mark.isEffective ? 1 : 0.2,
                    fontFamily: "Numbers-Regular",
                  }]}>{formatMark(mark)}</Text>
                ) : (
                  <View style={{
                    borderRadius: 5,
                    backgroundColor: theme.colors.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 2,
                    height: 16,
                    opacity: mark.isEffective && countMarksWithOnlyCompetences ? 1 : 0.2,
                  }}>
                    {mark.competences.map(competence => (
                      <View key={competence.id} style={{
                        backgroundColor: competence.value <= 0 ? theme.colors.onSurfaceDisabled : competence.value == 1 ? theme.colors.error : competence.value == 2 ? "#FFC300" : competence.value == 3 ? theme.colors.primary : theme.colors.success, // To adapt
                        borderRadius: 5,
                        width: 10,
                        height: 10,
                        margin: 1,
                      }}/>
                    ))}
                  </View>
                );
              }}
              ItemSeparatorComponent={<View style={{ width: 12.5 }}/>} 
            />
          </View>
        ) : null}

        {/* Has exam */}
        {hasExam ? (
          <CustomTag
            title={"Alerte évaluation"}
            icon={<AlertOctagonIcon size={15} color={'white'}/>}
            color={theme.colors.error}
            secondaryTag={hasExam.length > 1 && <Text style={[theme.fonts.labelMedium, { color: 'white', height: 22 }]}>{hasExam.length}</Text>}
            onPress={openExamPage}
            offset={15}
            shadow
            style={{ paddingHorizontal: 10, paddingVertical: 3 }}
          />
        ) : null}
      </PressableScale>
    </View>
  );
}

// Main subject card
function SubjectCard({
  subject,
  getMark,
  hasExam,
  countMarksWithOnlyCompetences,
  navigation,
}) {
  return (
    <View style={{ marginTop: hasExam ? 10 : 0 }}>
      <EmbeddedSubjectCard
        subject={subject}
        getMark={getMark}
        hasExam={hasExam}
        countMarksWithOnlyCompetences={countMarksWithOnlyCompetences}
        navigation={navigation}
      />

      {/* Sub subjects */}
      {Object.values(subject.subSubjects).map((subSubject, index) => (
        <EmbeddedSubjectCard
          key={index}
          subject={subSubject}
          getMark={getMark}
          countMarksWithOnlyCompetences={countMarksWithOnlyCompetences}
          navigation={navigation}
        />
      ))}
    </View>
  );
}

export default SubjectCard;
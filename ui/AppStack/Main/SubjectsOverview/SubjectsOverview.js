import { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import SubjectCard from "./SubjectCard";
import AppData from "../../../../core/AppData";
import { formatAverage } from "../../../../src/util/Utils";
import { useGlobalAppContext } from "../../../../src/util/GlobalAppContext";
import { useAppStackContext } from "../../../../src/util/AppStackContext";


// Subjects overview
function SubjectsOverview({
  accountID,
  selectedPeriod,
  latestCurrentPeriod,
  periods,
  gotHomework,
  navigation,
}) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater } = useAppStackContext();
  
  // Get if subject has exam
  const [subjectHasExam, setSubjectHasExam] = useState({});
  const [countMarksWithOnlyCompetences, setCountMarksWithOnlyCompetences] = useState(false);
  useEffect(() => {
    AppData.getSubjectHasExam(accountID).then(setSubjectHasExam);
    AppData.getPreference("countMarksWithOnlyCompetences").then(setCountMarksWithOnlyCompetences);
  }, [accountID, gotHomework, globalDisplayUpdater]);

  return (
    <View>
      {/* Subject groups */}
      {periods[selectedPeriod]?.sortedSubjectGroups?.map(subjectGroupID => {
        const subjectGroup = periods[selectedPeriod].subjectGroups[subjectGroupID];
        return (
          <View key={subjectGroup.id} style={{ marginVertical: 15, marginHorizontal: 20 }}>
            <PressableScale style={{
              paddingHorizontal: 13,
              paddingVertical: 5,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.surfaceOutline,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginVertical: 5,
            }}>
              <Text style={[theme.fonts.labelLarge, {
                fontFamily: 'Text-Medium',
                width: Dimensions.get('window').width - 150,
              }]}>{subjectGroup.title}</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
                <Text style={[theme.fonts.headlineMedium, { color: theme.colors.onSurfaceDisabled }]}>{formatAverage(subjectGroup.average)}</Text>
                {subjectGroup.average ? <Text style={[theme.fonts.labelSmall, { color: theme.colors.onSurfaceDisabled, fontFamily: "Numbers-Medium" }]}>/20</Text> : null}
              </View>
            </PressableScale>
            
            <View style={{
              position: 'absolute',
              left: -10,
              width: 4,
              borderRadius: 5,
              backgroundColor: theme.colors.surfaceOutline,
              height: '100%',
            }}/>

            {subjectGroup.subjects.map(subjectID => {
              return <SubjectCard
                key={subjectID}
                accountID={accountID}
                subject={periods[selectedPeriod].subjects[subjectID]}
                getMark={(markID) => periods[selectedPeriod].marks[markID]}
                hasExam={selectedPeriod == latestCurrentPeriod ? subjectHasExam[subjectID] : undefined}
                countMarksWithOnlyCompetences={countMarksWithOnlyCompetences}
                navigation={navigation}
              />;
            })}
          </View>
      )})}

      {/* Other subjects */}
      <View style={{ marginTop: 15, marginBottom: 20, marginHorizontal: 20 }}>
        {Object.keys(periods[selectedPeriod]?.subjectGroups ?? {}).length > 0 && periods[selectedPeriod]?.subjectsNotInSubjectGroup.length > 0 && (
          <View style={{ position: 'absolute', height: '100%' }}>
            <Text style={[theme.fonts.labelLarge, { fontFamily: 'Text-Medium' }]}>AUTRES MATIÈRES</Text>
            <View style={{
              position: 'absolute',
              left: -10,
              width: 4,
              borderRadius: 5,
              backgroundColor: theme.colors.surfaceOutline,
              height: '100%',
            }}/>
          </View>
        )}

        <View style={{
          marginTop: Object.keys(periods[selectedPeriod]?.subjectGroups ?? {}).length > 0 ? 25 : 0,
        }}>
          {Object.values(periods[selectedPeriod]?.subjectsNotInSubjectGroup ?? {}).map(subjectID => {
            return <SubjectCard
              key={subjectID}
              accountID={accountID}
              subject={periods[selectedPeriod].subjects[subjectID]}
              getMark={(markID) => periods[selectedPeriod].marks[markID]}
              hasExam={selectedPeriod == latestCurrentPeriod ? subjectHasExam[subjectID] : undefined}
              countMarksWithOnlyCompetences={countMarksWithOnlyCompetences}
              navigation={navigation}
            />;
          })}
        </View>
      </View>
    </View>
  );
}

export default SubjectsOverview;
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SubjectCard from "./SubjectCard";
import { formatAverage } from "../../../../../util/Utils";
import AppData from "../../../../../core/AppData";


// Subjects overview
function SubjectsOverview({
  accountID,
  selectedPeriod,
  latestCurrentPeriod,
  gotHomework,
  globalDisplayUpdater,
  navigation,
}) {
  // Get periods of student
  const [periods, setPeriods] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setPeriods(cacheData[accountID].data);
      } else { setPeriods({}); }
    });
  }, [accountID, globalDisplayUpdater]);

  // Get if subject has exam
  const [subjectHasExam, setSubjectHasExam] = useState({});
  useEffect(() => {
    AppData.getSubjectHasExam(accountID).then(setSubjectHasExam);
  }, [accountID, gotHomework]);
  
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
              backgroundColor: DefaultTheme.colors.surface,
              borderWidth: 2,
              borderColor: DefaultTheme.colors.surfaceOutline,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 5,
            }} onPress={() => navigation.navigate("SubjectGroupPage", { accountID, periodID: periods[selectedPeriod].id, subjectGroupID })}>
              <Text style={[DefaultTheme.fonts.labelLarge, { fontFamily: 'Text-Medium' }]}>{subjectGroup.title}</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
                <Text style={[DefaultTheme.fonts.headlineMedium, { color: DefaultTheme.colors.onSurfaceDisabled }]}>{formatAverage(subjectGroup.average)}</Text>
                {subjectGroup.average && <Text style={[DefaultTheme.fonts.labelSmall, { color: DefaultTheme.colors.onSurfaceDisabled, fontFamily: "Numbers-Medium" }]}>/20</Text>}
              </View>
            </PressableScale>
            
            <View style={{
              position: 'absolute',
              left: -10,
              width: 4,
              borderRadius: 5,
              backgroundColor: DefaultTheme.colors.surfaceOutline,
              height: '100%',
            }}/>

            {subjectGroup.subjects.map(subjectID => {
              return <SubjectCard
                key={subjectID}
                accountID={accountID}
                subject={periods[selectedPeriod].subjects[subjectID]}
                getMark={(markID) => periods[selectedPeriod].marks[markID]}
                hasExam={periods[selectedPeriod].id == latestCurrentPeriod ? subjectHasExam[subjectID] : undefined}
                navigation={navigation}
              />;
            })}
          </View>
      )})}

      {/* Other subjects */}
      <View style={{ marginTop: 15, marginHorizontal: 20 }}>
        {Object.keys(periods[selectedPeriod]?.subjectGroups ?? {}).length > 0 && periods[selectedPeriod]?.subjectsNotInSubjectGroup.length > 0 && (
          <View style={{ position: 'absolute', height: '100%' }}>
            <Text style={[DefaultTheme.fonts.labelLarge, { fontFamily: 'Text-Medium' }]}>AUTRES MATIÈRES</Text>
            <View style={{
              position: 'absolute',
              left: -10,
              width: 4,
              borderRadius: 5,
              backgroundColor: DefaultTheme.colors.surfaceOutline,
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
              hasExam={periods[selectedPeriod].id == latestCurrentPeriod ? subjectHasExam[subjectID] : undefined}
              navigation={navigation}
            />;
          })}
        </View>
      </View>
    </View>
  );
}

export default SubjectsOverview;
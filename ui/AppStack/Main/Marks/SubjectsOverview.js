import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SubjectCard from "./SubjectCard";
import { formatAverage } from "../../../../util/Utils";


// Subjects overview
function SubjectsOverview({
  accountID,
  selectedPeriod,

  displayRefresher,
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
  }, [accountID, displayRefresher]);
  
  return (
    <View>
      {/* Subject groups */}
      {periods[selectedPeriod]?.sortedSubjectGroups?.map(subjectGroupID => {
        const subjectGroup = periods[selectedPeriod].subjectGroups[subjectGroupID];
        return (
          <View key={subjectGroup.id} style={{ marginTop: 30 }}>
            <View style={{
              paddingRight: 15,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
              <Text style={[DefaultTheme.fonts.labelLarge, { fontFamily: 'Text-Medium' }]}>{subjectGroup.title}</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
                <Text style={[DefaultTheme.fonts.headlineMedium, { color: DefaultTheme.colors.onSurfaceDisabled }]}>{formatAverage(subjectGroup.average)}</Text>
                {subjectGroup.average && <Text style={[DefaultTheme.fonts.labelSmall, { color: DefaultTheme.colors.onSurfaceDisabled, fontFamily: "Numbers-Medium" }]}>/20</Text>}
              </View>
            </View>

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
                navigation={navigation}
              />;
            })}
          </View>
      )})}

      {/* Other subjects */}
      <View style={{ marginTop: 30 }}>
        {Object.keys(periods[selectedPeriod]?.subjectGroups ?? {}).length > 0 && (
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
          marginTop: Object.keys(periods[selectedPeriod]?.subjectGroups ?? {}).length > 0 ? 25 : 0
        }}>
          {Object.values(periods[selectedPeriod]?.subjectsNotInSubjectGroup ?? {}).map(subjectID => {
            return <SubjectCard
              key={subjectID}
              accountID={accountID}
              subject={periods[selectedPeriod].subjects[subjectID]}
              getMark={(markID) => periods[selectedPeriod].marks[markID]}
              navigation={navigation}
            />;
          })}
        </View>
      </View>
    </View>
  );
}

export default SubjectsOverview;
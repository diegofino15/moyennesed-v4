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
          <View key={subjectGroup.id} style={{
            marginTop: 30,
          }}>
            <View style={{
              paddingRight: 15,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
              <Text style={DefaultTheme.fonts.labelLarge}>{subjectGroup.title}</Text>
              <Text style={[DefaultTheme.fonts.headlineMedium, { color: DefaultTheme.colors.onSurfaceDisabled }]}>{formatAverage(subjectGroup.average)}</Text>
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
                period={periods[selectedPeriod]}
                subject={periods[selectedPeriod].subjects[subjectID]}
                navigation={navigation}
              />;
            })}
          </View>
      )})}

      {/* Other subjects */}
      <View style={{ height: 20 }} /> 
      {Object.values(periods[selectedPeriod]?.subjectsNotInSubjectGroup ?? {}).map(subjectID => {
        return <SubjectCard
          key={subjectID}
          accountID={accountID}
          period={periods[selectedPeriod]}
          subject={periods[selectedPeriod].subjects[subjectID]}
          navigation={navigation}
        />;
      })}
    </View>
  );
}

export default SubjectsOverview;
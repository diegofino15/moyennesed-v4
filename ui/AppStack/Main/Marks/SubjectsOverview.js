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
  const [period, _setPeriod] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("marks").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        _setPeriod(cacheData[accountID].data[selectedPeriod]);
      }
    });
  }, [accountID, selectedPeriod, displayRefresher]);
  
  return (
    <View>
      {/* Subject groups */}
      {Object.values(period?.subjectGroups ?? {}).map(subjectGroup => (
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
              subject={period.subjects[subjectID]}
              getMark={(markID) => period.marks[markID]}
              navigation={navigation}
            />;
          })}
        </View>
      ))}

      {/* Other subjects */}
      <View style={{ height: 20 }} /> 
      {Object.values(period?.subjectsNotInSubjectGroup ?? {}).map(subjectID => {
        return <SubjectCard
          key={subjectID}
          accountID={accountID}
          subject={period.subjects[subjectID]}
          getMark={(markID) => period.marks[markID]}
          navigation={navigation}
        />;
      })}
    </View>
  );
}

export default SubjectsOverview;
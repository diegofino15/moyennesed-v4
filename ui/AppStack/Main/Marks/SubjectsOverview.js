import AsyncStorage from "@react-native-async-storage/async-storage";
import { memo, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Subjects overview
function SubjectsOverview({ selectedPeriod, showMarksAccount, displayRefresher, navigation }) {
  const [period, setPeriod] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("marks").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (showMarksAccount.id in cacheData) {
        setPeriod(cacheData[showMarksAccount.id].data[selectedPeriod]);
      }
    });
  }, [selectedPeriod, displayRefresher]);
  
  return (
    <View>
      {Object.values(period.subjects ?? {}).map(subject => (
        <View key={subject.id}>
          <Text style={DefaultTheme.fonts.labelLarge}>{subject.title}</Text>
          <Text style={DefaultTheme.fonts.labelSmall}>{subject.average}</Text>
        </View>
      ))}
    </View>
  );
}

export default memo(SubjectsOverview);
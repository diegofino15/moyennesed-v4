import { useState, useEffect } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import CustomEvolutionChart from "../../../components/CustomEvolutionChart";


// Subject group page
function SubjectGroupPage({ globalDisplayUpdater, updateGlobalDisplay, route, navigation }) {
  const { accountID, cacheSubjectGroup } = route.params;

    // Get subject group
    const [subjectGroup, setSubjectGroup] = useState(cacheSubjectGroup);
    useEffect(() => {
      AsyncStorage.getItem("marks").then(async (data) => {
        var cacheData = {};
        if (data) { cacheData = JSON.parse(data); }
        if (accountID in cacheData) {
          setSubjectGroup(cacheData[accountID].data[subjectGroup.periodID].subjectGroups[subjectGroup.id]);
        }
      });
    }, [globalDisplayUpdater]);

    return (
      <CustomModal
        title={subjectGroup.title}
        goBackFunction={() => navigation.pop()}
        onlyShowBackButtonOnAndroid
        children={(
          <View>
            <CustomEvolutionChart
              listOfValues={subjectGroup.averageHistory}
              showClassValues={true}
              color={'red'}
              activeColor={'purple'}
              height={300}
              lightColor={'orange'}
            />
          </View>
        )}
      />
    );
}

export default SubjectGroupPage;
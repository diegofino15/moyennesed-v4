import { useEffect } from "react";
import useState from "react-usestateref";
import { View, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeworkDay from "./HomeworkDay";
import CustomModal from "../../../components/CustomModal";
import CustomSeparator from "../../../components/CustomSeparator";

// Exam page
function ExamPage({ globalDisplayUpdater, navigation, route }) {
  const {
    accountID,
    subjectTitle,
    examIDs,
  } = route.params;

  // Get abstract exams (waiting for them to load)
  const [abstractHomeworks, setAbstractExams] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        let newAbstractExams = {};
        Object.keys(cacheData[accountID].data.days).map(day => {
          examIDs.forEach(examID => {
            if (cacheData[accountID].data.days[day].includes(examID)) {
              newAbstractExams[day] ??= {};
              newAbstractExams[day][examID] = cacheData[accountID].data.homeworks[examID];
            }
          });
        });
        setAbstractExams(newAbstractExams);
      }
    });
  }, [globalDisplayUpdater]);
 
  return (
    <CustomModal
      title={`Contrôles - ${subjectTitle}`}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      goBackButtonStyle={{ opacity: 0.6 }}
      headerStyle={{ backgroundColor: DefaultTheme.colors.error }}
      children={(
        <View>
          {Object.keys(abstractHomeworks).map((day, index) => (
            <View key={day}>
              <HomeworkDay
                accountID={accountID}
                day={day}
                exams={abstractHomeworks[day]}
                loadAtDisplay={true}
                openAllAtDisplay={true}
              />
              {index < Object.keys(abstractHomeworks).length - 1 && (
                <CustomSeparator style={{
                  backgroundColor: DefaultTheme.colors.surfaceOutline,
                  left: -10,
                  width: Dimensions.get('window').width - 20,
                  marginTop: 50,
                  marginBottom: 50,
                }}/>
              )}
            </View>
          ))}
        </View>
      )}
    />
  );
}

export default ExamPage;
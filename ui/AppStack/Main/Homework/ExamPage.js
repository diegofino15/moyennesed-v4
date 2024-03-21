import { useEffect } from "react";
import useState from "react-usestateref";
import { View, Dimensions, Platform } from "react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeworkDay from "./HomeworkDay";
import CustomModal from "../../../components/CustomModal";
import CustomSeparator from "../../../components/CustomSeparator";

// Exam page
function ExamPage({ isConnected, isConnecting, globalDisplayUpdater, navigation, route }) {
  const {
    accountID,
    subjectTitle,
    examIDs,
  } = route.params;

  // Get abstract exams (waiting for them to load)
  const [abstractExams, setAbstractExams] = useState({});
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

  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);
 
  return (
    <CustomModal
      title={`Contrôles - ${subjectTitle}`}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      goBackButtonStyle={{ opacity: 0.6 }}
      headerStyle={{ backgroundColor: DefaultTheme.colors.error }}
      setWidth={setWindowWidth}
      children={(
        <View style={{ backgroundColor: DefaultTheme.colors.backdrop }}>
          {Object.keys(abstractExams).map(day => (
            <View key={day} style={{
              marginBottom: 50,
            }}>
              <HomeworkDay
                accountID={accountID}
                day={day}
                homeworks={abstractExams[day]}
                loadAtDisplay
                openAllAtDisplay
                canLoad={isConnected && !isConnecting}
                windowWidth={windowWidth}
              />
            </View>
          ))}
          
          <View style={{ height: 50 }}/> 
        </View>
      )}
    />
  );
}

export default ExamPage;
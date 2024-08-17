import { useEffect } from "react";
import useState from "react-usestateref";
import { View, Dimensions, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeworkDay from "./HomeworkDay";
import CustomModal from "../../../components/CustomModal";
import { useAppContext } from "../../../../util/AppContext";

// Exam page
function ExamPage({ isConnected, isConnecting, globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { theme } = useAppContext();
  
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

  return (
    <CustomModal
      title={`Contrôles - ${subjectTitle}`}
      titleStyle={{ color: 'black' }}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      goBackButtonStyle={{ opacity: 0.6 }}
      headerStyle={{ backgroundColor: theme.colors.error }}
      horizontalPadding={10}
      children={(
        <View style={{ backgroundColor: theme.colors.backdrop }}>
          {Object.keys(abstractExams).map(day => (
            <View key={day} style={{
              marginBottom: 50,
            }}>
              <HomeworkDay
                accountID={accountID}
                day={day}
                homeworks={abstractExams[day]}
                forceAutoLoad={isConnected && !isConnecting}
                navigation={navigation}
                globalDisplayUpdater={globalDisplayUpdater}
                updateGlobalDisplay={updateGlobalDisplay}
              />
            </View>
          ))}
        </View>
      )}
    />
  );
}

export default ExamPage;
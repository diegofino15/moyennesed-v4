import { useEffect } from "react";
import useState from "react-usestateref";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeworkDay from "./HomeworkDay";
import CustomModal from "../../../components/CustomModal";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";


// Exam page
function ExamPage({ navigation, route }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater } = useAppStackContext();

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

  const [windowWidth, setWindowWidth] = useState(0);

  return (
    <CustomModal
      title={`Evaluations - ${subjectTitle}`}
      setWidth={setWindowWidth}
      titleStyle={{ color: 'black' }}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      goBackButtonStyle={{ opacity: 0.6 }}
      headerStyle={{ backgroundColor: theme.colors.error }}
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
                windowWidth={windowWidth}
                navigation={navigation}
              />
            </View>
          ))}
        </View>
      )}
    />
  );
}

export default ExamPage;
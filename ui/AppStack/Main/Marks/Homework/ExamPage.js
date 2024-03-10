import { useEffect } from "react";
import useState from "react-usestateref";
import { ActivityIndicator, Text, View } from "react-native";
import { AlertOctagonIcon, AlertTriangleIcon, DownloadIcon, RefreshCcwIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeworkCard from "./HomeworkCard";
import CustomModal from "../../../../components/CustomModal";
import HapticsHandler from "../../../../../util/HapticsHandler";
import ColorsHandler from "../../../../../util/ColorsHandler";
import { formatDate, formatDate2 } from "../../../../../util/Utils";
import AppData from "../../../../../core/AppData";
import CustomSection from "../../../../components/CustomSection";


// Day
function HomeworkDay({ accountID, day, exams, globalManualRefreshing, loadAtDisplay }) {
  const [manualRefreshing, setManualRefreshing] = useState(globalManualRefreshing);
  useEffect(() => setManualRefreshing(globalManualRefreshing), [globalManualRefreshing]);
  
  const [gettingSpecificHomeworks, setGettingSpecificHomeworks] = useState(false);
  const [errorGettingSpecificHomeworks, setErrorGettingSpecificHomeworks] = useState(false);
  const [waitingToLoad, setWaitingToLoad] = useState(false);

  const [specificHomeworks, setSpecificHomeworks] = useState({});
  const [lastTimeUpdated, setLastTimeUpdated] = useState(null);
  useEffect(() => {
    async function getSpecificHomeworks() {
      if (specificHomeworks[Object.keys(exams)[0]] && !manualRefreshing) { return; }

      setErrorGettingSpecificHomeworks(false);
      setGettingSpecificHomeworks(true);
      const { status, data, date } = await AppData.getSpecificHomeworkForDay(accountID, day, manualRefreshing, !loadAtDisplay);
      if (status == 1) {
        setSpecificHomeworks(data);
        setLastTimeUpdated(date);
        setWaitingToLoad(false);
      } else if (status == 0) {
        setWaitingToLoad(true);
      } else {
        setErrorGettingSpecificHomeworks(true);
        setWaitingToLoad(false);
      }
      setGettingSpecificHomeworks(false);
      if (manualRefreshing) { setManualRefreshing(false); }
    }
    getSpecificHomeworks();
  }, [globalManualRefreshing, manualRefreshing]);
  
  return (
    <View style={{ marginBottom: 30 }}>
      <CustomSection
        title={formatDate2(day).toUpperCase()}
        rightIcon={(
          <PressableScale onPress={() => { if (!gettingSpecificHomeworks) { setManualRefreshing(true); } }}>
            {gettingSpecificHomeworks || manualRefreshing ? (
              <ActivityIndicator size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>
            ) : errorGettingSpecificHomeworks ? (
              <AlertTriangleIcon size={25} color={DefaultTheme.colors.error}/>
            ) : waitingToLoad ? (
              <DownloadIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>
            ) : (
              <RefreshCcwIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>
            )}
          </PressableScale>
        )}
        alignOn="flex-start"
        marginTop={0}
        viewStyle={{ marginRight: 10, marginBottom: 5 }}
        textStyle={DefaultTheme.fonts.labelLarge}
      />

      {Object.values(exams).map(exam => (
        <HomeworkCard
          key={exam.id}
          accountID={accountID}
          abstractExam={exam}
          specificExam={specificHomeworks[exam.id] ?? {}}
        />
      ))}

      <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: "Text-Italic", marginLeft: 10 }]}>{lastTimeUpdated ? `Dernière mise à jour : ${formatDate(lastTimeUpdated)}` : ""}</Text>
    </View>
  );
}


// Exam page
function ExamPage({ globalDisplayUpdater, navigation, route }) {
  const {
    accountID,
    periodID,
    subjectID,
    examIDs,
  } = route.params;

  // Get subject
  const [subject, setSubject] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setSubject(cacheData[accountID].data[periodID].subjects[subjectID]);
      }
    });
  }, []);

  // Subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(subject.id);

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

  // Manual refresh
  const [globalManualRefreshing, setGlobalManualRefreshing] = useState(false);

  // Refresh exams
  function refreshAllExams() {
    HapticsHandler.vibrate("light");
    setGlobalManualRefreshing(true);
  }
 
  return (
    <CustomModal
      titleObject={(
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AlertOctagonIcon size={20} color={'white'} style={{ marginRight: 10 }}/>
          <Text style={DefaultTheme.fonts.titleSmall}>Alerte contrôle</Text>
        </View>
      )}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      extraHeight={200}
      goBackButtonStyle={{ opacity: 0.6 }}
      headerStyle={{ backgroundColor: DefaultTheme.colors.error }}
      rightIconStyle={{ backgroundColor: undefined }}
      rightIconOnPress={refreshAllExams}
      rightIcon={(
        <RefreshCcwIcon size={25} color={'white'} style={{ margin: 2.5 }}/>
      )}
      children={(
        <View>
          {Object.keys(abstractExams).map((day, index) => (
            <HomeworkDay
              key={day}
              accountID={accountID}
              day={day}
              exams={abstractExams[day]}
              globalManualRefreshing={globalManualRefreshing}
              loadAtDisplay={index == 0}
            />
          ))}
        </View>
      )}
    />
  );
}

export default ExamPage;
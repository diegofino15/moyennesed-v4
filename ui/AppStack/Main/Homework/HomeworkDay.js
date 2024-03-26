import { useEffect } from "react";
import useState from "react-usestateref";
import { ActivityIndicator, Text, View } from "react-native";
import { AlertTriangleIcon, RefreshCcwIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";

import HomeworkCard from "./HomeworkCard";
import { formatDate2, formatDate3 } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";


// Homework day
function HomeworkDay({ accountID, day, homeworks, loadAtDisplay=false, openAllAtDisplay=false, canLoad=true, windowWidth }) {
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const [gettingSpecificHomeworks, setGettingSpecificHomeworks] = useState(false);
  const [errorGettingSpecificHomeworks, setErrorGettingSpecificHomeworks] = useState(false);
  const [waitingToLoad, setWaitingToLoad] = useState(false);

  const [specificHomeworks, setSpecificHomeworks] = useState({});

  async function loadSpecificHomework(forceCache=false) {
    if (!canLoad) { return; }
    
    setErrorGettingSpecificHomeworks(false);
    setGettingSpecificHomeworks(true);
    const { status, data, date } = await AppData.getSpecificHomeworkForDay(accountID, day, manualRefreshing, forceCache);
    if (status == 1) {
      setSpecificHomeworks(data);
      setWaitingToLoad(false);
    } else if (status == 0) {
      setWaitingToLoad(true);
    } else {
      setErrorGettingSpecificHomeworks(true);
      setWaitingToLoad(false);
    }
    setGettingSpecificHomeworks(false);
  }

  useEffect(() => {
    async function getSpecificHomeworks() {
      if (specificHomeworks[Object.keys(homeworks)[0]] && !manualRefreshing) { return; }

      await loadSpecificHomework(!loadAtDisplay);
      if (manualRefreshing) { setManualRefreshing(false); }
    }
    getSpecificHomeworks();
  }, [manualRefreshing, canLoad]);

  return (
    <View style={{
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 0,
      width: windowWidth - 20,
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 10,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 12.5,
        marginBottom: 10,
      }}>
        <View style={{
          paddingHorizontal: 15,
          paddingVertical: 5,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          backgroundColor: DefaultTheme.colors.primaryLight,
          left: -10,
        }}>
          <Text style={[DefaultTheme.fonts.labelLarge, { color: DefaultTheme.colors.primary, height: 25 }]}>{
            formatDate3(day) == formatDate3(null, new Date()) ? "Aujourd'hui" : formatDate2(day)
          }</Text>
        </View>
        
        <PressableScale onPress={() => { if (!gettingSpecificHomeworks) { setManualRefreshing(true); } }}>
          {gettingSpecificHomeworks || manualRefreshing ? (
            <ActivityIndicator size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>
          ) : errorGettingSpecificHomeworks ? (
            <AlertTriangleIcon size={25} color={DefaultTheme.colors.error}/>
          ) : !waitingToLoad && (
            <RefreshCcwIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>
          )}
        </PressableScale>
      </View>

      {Object.values(homeworks).map(exam => (
        <HomeworkCard
          key={exam.id}
          accountID={accountID}
          abstractHomework={exam}
          specificHomework={specificHomeworks[exam.id] ?? {}}
          loadSpecificHomework={loadSpecificHomework}
          isAlreadyLoading={gettingSpecificHomeworks}
          openAtDisplay={openAllAtDisplay}
          windowWidth={windowWidth}
        />
      ))}
    </View>
  );
}

export default HomeworkDay;
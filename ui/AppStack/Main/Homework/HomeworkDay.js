import { useEffect } from "react";
import useState from "react-usestateref";
import { ActivityIndicator, Text, View } from "react-native";
import { AlertTriangleIcon, DownloadIcon, RefreshCcwIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";

import HomeworkCard from "./HomeworkCard";
import CustomSection from "../../../components/CustomSection";
import { formatDate, formatDate2 } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";


// Homework day
function HomeworkDay({ accountID, day, homeworks, loadAtDisplay=false, openAllAtDisplay=false, canLoad=true, windowWidth }) {
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const [gettingSpecificHomeworks, setGettingSpecificHomeworks] = useState(false);
  const [errorGettingSpecificHomeworks, setErrorGettingSpecificHomeworks] = useState(false);
  const [waitingToLoad, setWaitingToLoad] = useState(false);

  const [specificHomeworks, setSpecificHomeworks] = useState({});
  const [lastTimeUpdated, setLastTimeUpdated] = useState(null);

  async function loadSpecificHomework(forceCache=false) {
    if (!canLoad) { return; }
    
    setErrorGettingSpecificHomeworks(false);
    setGettingSpecificHomeworks(true);
    const { status, data, date } = await AppData.getSpecificHomeworkForDay(accountID, day, manualRefreshing, forceCache);
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
    <View>
      {/* <CustomSection
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
        marginTop={10}
        textAreaStyle={{ left: 0 }}
        viewStyle={{ marginRight: 12.5, marginBottom: 5 }}
        textStyle={DefaultTheme.fonts.labelLarge}
      /> */}

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <View style={{
          paddingHorizontal: 15,
          paddingVertical: 5,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          backgroundColor: DefaultTheme.colors.primary,
          left: -20,
        }}>
          <Text style={[DefaultTheme.fonts.labelLarge, { color: DefaultTheme.colors.onPrimary }]}>{formatDate2(day).toUpperCase()}</Text>
        </View>
        
        <PressableScale style={{
          left: -10,
        }} onPress={() => { if (!gettingSpecificHomeworks) { setManualRefreshing(true); } }}>
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

      {Object.keys(homeworks).length == 0 && (
        <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: "center", marginTop: "50%" }]}>Aucun devoir pour ce jour</Text>
      )}

      <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: "Text-Italic", marginLeft: 10 }]}>{lastTimeUpdated ? `Dernière mise à jour : ${formatDate(lastTimeUpdated)}` : ""}</Text>
    </View>
  );
}

export default HomeworkDay;
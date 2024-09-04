import { useEffect } from "react";
import useState from "react-usestateref";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import HomeworkCard from "./HomeworkCard";
import AppData from "../../../../core/AppData";
import { formatDate2, wait } from "../../../../util/Utils";
import { useAppContext } from "../../../../util/AppContext";


// Homework day
function HomeworkDay({ accountID, day, homeworks, autoLoad=false, globalDisplayUpdater, updateGlobalDisplay, navigation }) {
  const { theme } = useAppContext();

  // Auto-load the specific homeworks
  const [specificHomeworks, setSpecificHomeworks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  async function getCacheSpecificHomeworks() {
    const data = await AsyncStorage.getItem("specific-homework");
    if (data) {
      const cacheData = JSON.parse(data);
      if (accountID in cacheData && day in cacheData[accountID].days) {
        setSpecificHomeworks(cacheData[accountID].homeworks);
        return 1;
      }
    }
    return -1;
  }
  async function loadSpecificHomeworks(onlyIfCache=false) {
    // Check if specific homework is in cache
    var status = await getCacheSpecificHomeworks();
    if (status == 1 || onlyIfCache || isLoading) {
      return;
    }

    // Fetch specific homework
    setIsLoading(true);
    await wait(2000);
    status = await AppData.getSpecificHomeworkForDay(accountID, day);
    if (status == 1) {
      await getCacheSpecificHomeworks();
      updateGlobalDisplay();
    }
    setIsLoading(false);
  }
  useEffect(() => { loadSpecificHomeworks(!autoLoad); }, [globalDisplayUpdater]);
  
  return (
    <View style={{
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 5,
      width: Dimensions.get('window').width - 40,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12.5,
        marginBottom: 10,
      }}>
        <View style={{
          paddingHorizontal: 15,
          paddingVertical: 5,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          backgroundColor: theme.colors.primaryLight,
          left: -10,
        }}>
          <Text style={[theme.fonts.labelLarge, { color: theme.colors.primary, height: 25 }]}>{
            formatDate2(day, true, true)
          }</Text>
        </View>
        {isLoading && (
          <ActivityIndicator size={25} color={theme.colors.onSurfaceDisabled}/>
        )}
      </View>

      {Object.values(homeworks).map(homework => (
        <HomeworkCard
          key={homework.id}
          accountID={accountID}
          cacheHomework={homework}
          specificHomework={specificHomeworks[homework.id] ?? null}
          isLoading={isLoading}
          updateGlobalDisplay={updateGlobalDisplay}
          navigation={navigation}
        />
      ))}
    </View>
  );
}

export default HomeworkDay;
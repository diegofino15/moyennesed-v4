import { useState, useEffect } from "react";
import { Text, View } from "react-native";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import HomeworkCard from "./HomeworkCard";
import { formatDate2 } from "../../../util/Utils";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";
import StorageHandler from "../../../core/StorageHandler";


// Homework day
function HomeworkDay({ day, homeworks, windowWidth, navigation }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater } = useAppStackContext();
  const { accountID } = useCurrentAccountContext();

  // Pre-load the specific homeworks to open HomeworkPage faster
  const [specificHomeworks, setSpecificHomeworks] = useState({});
  async function getCacheSpecificHomeworks() {
    const cacheData = await StorageHandler.getData("specific-homework");
    if (cacheData) {
      if (accountID in cacheData && day in cacheData[accountID].days) {
        setSpecificHomeworks(cacheData[accountID].homeworks);
      }
    }
  }
  useEffect(() => { getCacheSpecificHomeworks(); }, [globalDisplayUpdater]);

  return (
    <View style={{
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 5,
      width: windowWidth - 40,
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
      </View>

      {Object.values(homeworks).map(homework => (
        <HomeworkCard
          key={homework.id}
          cacheHomework={homework}
          specificHomework={specificHomeworks[homework.id] ?? null}
          windowWidth={windowWidth}
          navigation={navigation}
        />
      ))}
    </View>
  );
}

export default HomeworkDay;
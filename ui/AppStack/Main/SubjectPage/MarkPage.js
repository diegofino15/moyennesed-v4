import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import ColorsHandler from "../../../../util/ColorsHandler";


// Mark page
function MarkPage({ globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { accountID, cacheMark } = route.params;

  // Auto-refresh info
  const [mark, setMark] = useState(cacheMark);
  useEffect(() => {
    AsyncStorage.getItem("marks").then((data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setMark(cacheData[accountID].data[mark.periodID].marks[mark.id]);
      }
    });
  }, [globalDisplayUpdater]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);
  
  return (
    <CustomModal
      goBackFunction={() => navigation.goBack()}
      titleStyle={{ color: 'black' }}
      headerStyle={{ backgroundColor: dark }}
      goBackButtonStyle={{ opacity: 0.6 }}
      title={"Détails de la note"}
      children={(
        <View>
          <Text style={DefaultTheme.fonts.labelLarge}>{mark.title}</Text>
        </View>
      )}
    />
  );
}

export default MarkPage;
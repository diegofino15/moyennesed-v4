import { useEffect } from "react";
import useState from "react-usestateref";
import { Dimensions, Text, View } from "react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { formatDate3 } from "../../../../util/Utils";
import ColorsHandler from "../../../../util/ColorsHandler";
import AppData from "../../../../core/AppData";
import { PressableScale } from "react-native-pressable-scale";


// Next exam card
function NextExamCard({ accountID, examID, gotHomework, navigation }) {
  // Get which exam it is
  const [abstractExam, setAbstractExam, abstractExamRef] = useState(null);
  const [specificExam, setSpecificExam] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setAbstractExam(cacheData[accountID].data.homeworks[examID]);
      }

      // Get specific exam
      if (!gotHomework) { return; }
      AppData.getSpecificHomeworkForDay(accountID, abstractExamRef.current.dateFor, false, false).then(({ status, data, date }) => {
        if (status == 1) {
          setSpecificExam(data[examID]);
        }
      });
    });
  }, [accountID, examID, gotHomework]);

  // Subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(abstractExam?.subjectID);

  // Expand animation
  const [height, setHeight] = useState(0);
  const onLayout = (event) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && layoutHeight != height) {
      setHeight(layoutHeight);
    }
  }
  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = specificExam ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    }
  });
  
  return (
    <Animated.View style={[animatedStyle, {
      overflow: 'hidden',
      marginTop: specificExam ? 10 : 0,
    }]}>
      <View style={{ position: 'absolute' }} onLayout={onLayout}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          left: 10,
          width: Dimensions.get('window').width - 80,
        }}>
          <Text style={DefaultTheme.fonts.bodyMedium}>PROCHAIN CONTRÔLE</Text>
          <Text style={DefaultTheme.fonts.bodyMedium}>-</Text>
          <Text style={DefaultTheme.fonts.bodyMedium}>{formatDate3(abstractExam?.dateFor, null, true)}</Text>
        </View>

        <PressableScale style={{
          borderWidth: 2,
          borderColor: DefaultTheme.colors.error,
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 5,
          paddingTop: 30,
          width: Dimensions.get('window').width - 60,
        }} onPress={() => navigation.navigate("ExamPage", { accountID, subjectTitle: abstractExam?.subjectTitle, examIDs: [examID] })}>
          <View style={{
            backgroundColor: dark,
            borderTopLeftRadius: 10,
            borderBottomRightRadius: 10,
            left: -2,
            top: -2,
            position: 'absolute',
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}>
            <Text style={[DefaultTheme.fonts.bodyMedium, { color: 'black', height: 22 }]}>{abstractExam?.subjectTitle}</Text>
          </View>

          <Text style={DefaultTheme.fonts.bodyMedium} numberOfLines={3}>{specificExam?.todo}</Text>
        </PressableScale>
      </View>
    </Animated.View>
  );
}

export default NextExamCard;
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { ChevronLeftIcon, SquarePenIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import CustomTextInput from "../../../components/CustomTextInput";
import AppData from "../../../../core/AppData";


// Subject page
function SubjectPage({ route, navigation }) {
  const { accountID, periodID, subjectID, subSubjectID } = route.params;

  // Get selected subject
  const [period, _setPeriod] = useState({});
  const [subject, _setSubject] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("marks").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        _setPeriod(cacheData[accountID].data[periodID]);
        if (subSubjectID) { _setSubject(cacheData[accountID].data[periodID].subjects[subjectID].subSubjects[subSubjectID]); }
        else { _setSubject(cacheData[accountID].data[periodID].subjects[subjectID]); }
      }
    });
  }, []);

  // Change subject title
  const [currentSubjectTitle, setCurrentSubjectTitle] = useState("");
  useEffect(() => setCurrentSubjectTitle(subject.title), [subject.title]);

  return (
    <CustomModal
      showScrollView={false}
      children={(
        <View>
          {/* Header */}
          <View style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderColor: DefaultTheme.colors.surfaceOutline,
          }}>
            <PressableScale style={{
              borderWidth: 2,
              borderColor: DefaultTheme.colors.surfaceOutline,
              backgroundColor: DefaultTheme.colors.surface,
              padding: 5,
              borderRadius: 10,
              marginRight: 10,
            }} onPress={() => navigation.pop()}>
              <ChevronLeftIcon size={30} color={DefaultTheme.colors.onSurface}/>
            </PressableScale>

            <Text style={[DefaultTheme.fonts.titleSmall, { color: DefaultTheme.colors.onSurface }]}>{subject.title}</Text>
            <View style={{ width: 44 }}/>
            {/* <CustomTextInput
              icon={currentSubjectTitle == subject?.title || !currentSubjectTitle ? (
                <SquarePenIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
              ) : (
                <PressableScale style={{
                  backgroundColor: DefaultTheme.colors.primary,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  left: -20,
                }} onPress={() => {}}>
                  <Text style={[DefaultTheme.fonts.labelMedium, { color: DefaultTheme.colors.onPrimary }]}>Fini</Text>
                </PressableScale>
              )}
              iconOnRight
              label={subject?.defaultTitle}
              initialValue={currentSubjectTitle}
              onChangeText={setCurrentSubjectTitle}
              style={{
                borderWidth: 2,
                width: Dimensions.get('window').width - 75,
              }}
              textAreaStyle={{ height: 41 }}
            /> */}
          </View>

          {/* Content */}
          <ScrollView style={{
            padding: 20,
            width: '100%',
            height: '100%',
          }}>
            {subject.marks?.map((markID) => (
              <View key={markID}>
                <Text style={DefaultTheme.fonts.labelMedium}>{period.marks[markID].title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    />
  );
}

export default SubjectPage;
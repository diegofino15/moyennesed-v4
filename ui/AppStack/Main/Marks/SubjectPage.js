import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { ChevronLeftIcon, GraduationCapIcon, SquarePenIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import CustomTextInput from "../../../components/CustomTextInput";
import AppData from "../../../../core/AppData";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CustomSection from "../../../components/CustomSection";
import MarkCard from "./MarkCard";


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

  return (
    <CustomModal
      title={subject.title}
      goBackFunction={() => navigation.pop()}
      headerStyle={{
        backgroundColor: DefaultTheme.colors.backdrop,
        borderBottomWidth: 1,
      }}
      extraHeight={200}
      children={(
        <View>
          {/* Teachers */}
          {subject.teachers && <CustomSection title={"Professeur.es"}/>}
          {subject.teachers?.map((teacher, index) => (
            <CustomSimpleInformationCard
              key={index}
              icon={<GraduationCapIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              content={teacher}
              style={{ marginBottom: 10 }}
            />
          ))}
          
          {/* Marks */}
          {subject.marks && <CustomSection title={"Notes"}/>}
          {subject.marks?.map((markID) => (
            <MarkCard
              key={markID}
              mark={period.marks[markID]}
              navigation={navigation}
            />
          ))}
        </View>
      )}
    />
  );
}

export default SubjectPage;
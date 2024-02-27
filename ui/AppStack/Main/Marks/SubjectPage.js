import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { ChevronLeftIcon, ChevronRightIcon, GraduationCapIcon, SquarePenIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import CustomTextInput from "../../../components/CustomTextInput";
import AppData from "../../../../core/AppData";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CustomSection from "../../../components/CustomSection";
import MarkCard from "./MarkCard";
import ColorsHandler from "../../../../util/ColorsHandler";


// Subject page
function SubjectPage({ route, navigation }) {
  const { accountID, periodID, subjectID, subSubjectID, openMarkID } = route.params;

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

  // Open mark details
  function openMarkDetails(markID) {
    navigation.navigate("MarkPage", {
      accountID,
      mark: period.marks[markID],
    });
  }

  // Auto-open mark page if selected
  useEffect(() => { if (openMarkID && period.id) { openMarkDetails(openMarkID); } }, [period.id]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(subjectID);

  return (
    <CustomModal
      title={!subject.subID && subject.title}
      titleObject={subject.subID && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{period.subjects[subject.id]?.title}</Text>
          <ChevronRightIcon size={25} color={'black'}/>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{subject.title}</Text>
        </View>
      )}
      headerStyle={{ backgroundColor: dark }}
      titleStyle={{ color: 'black' }}
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
          {subject.sortedMarks?.map((markID) => (
            <MarkCard
              key={markID}
              mark={period.marks[markID]}
              openMarkDetails={() => openMarkDetails(markID)}
              outline={markID == openMarkID}
            />
          ))}
        </View>
      )}
    />
  );
}

export default SubjectPage;
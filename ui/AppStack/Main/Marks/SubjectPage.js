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
  const { accountID, period, subject, subSubjectID, openMarkID } = route.params;
  const [shownSubject, setShownSubject] = useState({});
  useEffect(() => {
    if (subSubjectID) { setShownSubject(subject.subSubjects[subSubjectID]); }
    else { setShownSubject(subject); }
  }, []);
  
  // Open mark details
  function openMarkDetails(markID) {
    navigation.navigate("MarkPage", {
      accountID,
      mark: period.marks[markID],
    });
  }

  // Auto-open mark page if selected
  useEffect(() => { if (openMarkID && period.id) { setTimeout(() => openMarkDetails(openMarkID), 100) } }, [period.id]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(subject.id);

  return (
    <CustomModal
      title={!shownSubject.subID && shownSubject.title}
      titleObject={shownSubject.subID && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{period.subjects[shownSubject.id]?.title}</Text>
          <ChevronRightIcon size={25} color={'black'}/>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{shownSubject.title}</Text>
        </View>
      )}
      headerStyle={{ backgroundColor: dark }}
      titleStyle={{ color: 'black' }}
      extraHeight={200}
      children={(
        <View>
          {/* Teachers */}
          {shownSubject.teachers && <CustomSection title={"Professeur.es"}/>}
          {shownSubject.teachers?.map((teacher, index) => (
            <CustomSimpleInformationCard
              key={index}
              icon={<GraduationCapIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              content={teacher}
              style={{ marginBottom: 10 }}
            />
          ))}
          
          {/* Marks */}
          {shownSubject.marks && <CustomSection title={"Notes"}/>}
          {shownSubject.sortedMarks?.map((markID) => (
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
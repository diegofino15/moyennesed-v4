import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ChevronRightIcon, GraduationCapIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CustomSection from "../../../components/CustomSection";
import MarkCard from "./MarkCard";
import ColorsHandler from "../../../../util/ColorsHandler";


// Subject page
function SubjectPage({ route, navigation }) {
  const { accountID, subject, subSubjectID, openMarkID } = route.params;
  
  // Used for sub subjects
  const [shownSubject, setShownSubject] = useState({});
  useEffect(() => {
    if (subSubjectID) { setShownSubject(subject.subSubjects[subSubjectID]); }
    else { setShownSubject(subject); }
  }, []);

  // Actual marks
  const [marks, setMarks] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        let tempMarks = {};
        for (let markID of subject.sortedMarks) { tempMarks[markID] = cacheData[accountID].data[subject.periodID].marks[markID]; }
        setMarks(tempMarks);
      }
    });
  }, []);
  
  // Open mark details
  function openMarkDetails(markID) {
    navigation.navigate("MarkPage", {
      accountID,
      mark: marks[markID],
    });
  }

  // Auto-open mark page if selected
  useEffect(() => { if (openMarkID && Object.keys(marks ?? {}).length > 0) { setTimeout(() => openMarkDetails(openMarkID), 100) } }, [marks]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(subject.id);

  return (
    <CustomModal
      title={!shownSubject.subID && shownSubject.title}
      titleObject={shownSubject.subID && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{subject.title}</Text>
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
          {marks && <CustomSection title={"Notes"}/>}
          {marks && shownSubject?.sortedMarks?.map((markID) => (
            <MarkCard
              key={markID}
              mark={marks[markID]}
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
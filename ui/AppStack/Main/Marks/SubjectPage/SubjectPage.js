import { useEffect } from "react";
import useState from "react-usestateref";
import { Text, View, Dimensions, Platform } from "react-native";
import { ChevronRightIcon, ChevronsUpDownIcon, GraduationCapIcon, PaletteIcon, PenIcon, SquarePenIcon, TrashIcon, Users2Icon, WeightIcon, XIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MarkCard from "./MarkCard";
import SubjectColorPicker from "./SubjectColorPicker";
import CustomSection from "../../../../components/CustomSection";
import CustomSimpleInformationCard from "../../../../components/CustomSimpleInformationCard";
import CustomChooser from "../../../../components/CustomChooser";
import CustomModal from "../../../../components/CustomModal";
import ColorsHandler from "../../../../../util/ColorsHandler";
import { formatAverage } from "../../../../../util/Utils";
import { PressableScale } from "react-native-pressable-scale";
import HapticsHandler from "../../../../../util/HapticsHandler";


// Subject page
function SubjectPage({ globalDisplayUpdater, updateGlobalDisplay, route, navigation }) {
  const { accountID, periodID, subjectID, subSubjectID, openMarkID } = route.params;
  
  // Used for sub subjects
  const [mainSubject, setMainSubject] = useState({}); // Only used for subSubjects
  const [shownSubject, setShownSubject, shownSubjectRef] = useState({});
  const [marks, setMarks] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        if (subSubjectID) {
          setShownSubject(cacheData[accountID].data[periodID].subjects[subjectID].subSubjects[subSubjectID]);
          setMainSubject(cacheData[accountID].data[periodID].subjects[subjectID]);
        } else { setShownSubject(cacheData[accountID].data[periodID].subjects[subjectID]); }

        let tempMarks = {};
        for (let markID of shownSubjectRef.current.sortedMarks) { tempMarks[markID] = cacheData[accountID].data[periodID].marks[markID]; }
        setMarks(tempMarks);
      }
    });
  }, [globalDisplayUpdater]);

  // Open mark details
  function openMarkDetails(markID) {
    navigation.navigate("MarkPage", {
      accountID,
      mark: marks[markID],
    });
  }

  // Auto-open mark page if selected
  const [hasRedirected, setHasRedirected] = useState(false);
  useEffect(() => {
    if (hasRedirected) { return; }
    if (openMarkID && Object.keys(marks ?? {}).length > 0) {
      setTimeout(() => openMarkDetails(openMarkID), 100);
      setHasRedirected(true);
    }
  }, [marks]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(accountID, subjectID);
  const [showChangeColorModal, setShowChangeColorModal] = useState(false);
  function resetColor() {
    ColorsHandler.resetSubjectColors(accountID, subjectID);
    updateGlobalDisplay();
    HapticsHandler.vibrate("light");
  }

  // Changeable coefficient
  const [coefficient, setCoefficient] = useState(null);
  const [possibleCoefficients, setPossibleCoefficients] = useState([]);
  useEffect(() => {
    setCoefficient(shownSubject.coefficient ?? 1);
    const maxCoef = 25;
    const step = 0.5;
    setPossibleCoefficients([shownSubject.coefficient, ...[...Array(Math.floor(maxCoef/step) + 1).keys() ].map((i) => i * step)])
  }, [shownSubject]);

  return (
    <CustomModal
      title={!shownSubject.subID && shownSubject.title}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      goBackButtonStyle={{ opacity: 0.6 }}
      titleObject={shownSubject.subID && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{mainSubject.title}</Text>
          <ChevronRightIcon size={25} color={'black'}/>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: 'black' }]}>{shownSubject.title}</Text>
        </View>
      )}
      headerStyle={{ backgroundColor: dark }}
      titleStyle={{ color: 'black' }}
      extraHeight={200}
      style={{ paddingHorizontal: 0 }}
      children={(
        <View>
          {/* Top portion */}
          <View>
            {/* Average */}
            <View style={{
              alignSelf: 'center',
              alignItems: 'center',
              marginVertical: 20,
            }}>
              <Text style={[DefaultTheme.fonts.headlineLarge, {
                fontSize: 45,
              }]}>{formatAverage(shownSubject?.average)}</Text>
              <Text style={[DefaultTheme.fonts.labelLarge, {
                top: -5,
              }]}>MOYENNE DE LA {shownSubject.subID ? "SOUS-" : ""}MATIÈRE</Text>
            </View>

            {/* Class average */}
            {shownSubject?.classAverage && (
              <View style={{
                position: 'absolute',
                top: -10,
                right: 10,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 5,
                backgroundColor: dark,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Users2Icon size={20} color={'black'}/>
                <Text style={[DefaultTheme.fonts.headlineMedium, { color: 'black', fontSize: 17 }]}> : {formatAverage(shownSubject?.classAverage)}</Text>
              </View>
            )}

            {/* Color picker */}
            <View style={{
              position: 'absolute',
              top: -10,
              left: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <PressableScale style={{
                backgroundColor: dark,
                borderRadius: 5,
                padding: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }} onPress={() => setShowChangeColorModal(true)}>
                <PaletteIcon size={20} color={'black'}/>
                <Text style={[DefaultTheme.fonts.labelMedium, { color: 'black', marginHorizontal: 5 }]}>Couleur</Text>
              </PressableScale>
              {ColorsHandler.isSubjectCustom(accountID, subjectID) && (
                <PressableScale style={{
                  marginLeft: 5,
                  backgroundColor: DefaultTheme.colors.errorLight,
                  borderWidth: 2,
                  borderColor: DefaultTheme.colors.error,
                  padding: 3,
                  borderRadius: 5,
                }} onPress={resetColor}>
                  <TrashIcon size={20} color={DefaultTheme.colors.error}/>
                </PressableScale>
              )}
            </View>
          </View>

          {/* Actual page */}
          <View style={{
            marginTop: 10,
            backgroundColor: DefaultTheme.colors.backdrop,
            padding: 20,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
            borderRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            width: Dimensions.get('window').width + 4,
            left: -2,
          }}>
            {/* Coefficient */}
            <CustomSimpleInformationCard
              icon={<WeightIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              content={"Coefficient"}
              rightIcon={(
                <CustomChooser
                  selected={coefficient}
                  setSelected={setCoefficient}
                  getItemForSelected={(selected) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <XIcon size={15} color={DefaultTheme.colors.onSurface}/>
                      <Text style={DefaultTheme.fonts.headlineMedium}>{`${selected}`.replace('.', ',')}</Text>
                      <ChevronsUpDownIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled} style={{
                        marginLeft: 5,
                      }}/>
                    </View>
                  )}
                  items={possibleCoefficients.map(value => {
                    return {
                      'title': `${value}`.replace('.', ','),
                      'id': value,
                    }
                  })}
                />
              )}
            />
            
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
        </View>
      )}
      childrenOutsideScrollView={(
        <View>
          {/* Color picker modal */}
          {showChangeColorModal && (
            <SubjectColorPicker
              accountID={accountID}
              subjectID={subjectID}
              visible={showChangeColorModal}
              exitModal={() => setShowChangeColorModal(false)}
              initialValue={dark}
              updateGlobalDisplay={updateGlobalDisplay}
            />
          )}
        </View>
      )}
    />
  );
}

export default SubjectPage;
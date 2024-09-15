import { useEffect, useRef } from "react";
import useState from "react-usestateref";
import { Text, View, Dimensions, ScrollView, Platform } from "react-native";
import { AlertTriangleIcon, ChevronRightIcon, DraftingCompassIcon, EllipsisIcon, EyeIcon, EyeOffIcon, GraduationCapIcon, MegaphoneOffIcon, PaletteIcon, TrashIcon, TrendingUpIcon, Users2Icon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MarkCard from "./MarkCard";
import SubjectColorPicker from "./SubjectColorPicker";
import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomChooser from "../../../components/CustomChooser";
import CustomEvolutionChart from "../../../components/CustomEvolutionChart";
import CustomCoefficientPicker from "../../../components/CustomCoefficientPicker";
import CustomAnimatedIndicator from "../../../components/CustomAnimatedIndicator";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import { asyncExpectedResult, formatAverage } from "../../../../util/Utils";
import { useAppContext } from "../../../../util/AppContext";
import CoefficientHandler from "../../../../core/CoefficientHandler";
import HapticsHandler from "../../../../core/HapticsHandler";
import ColorsHandler from "../../../../core/ColorsHandler";
import AppData from "../../../../core/AppData";


// Subject page
function SubjectPage({
  globalDisplayUpdater,
  updateGlobalDisplay,
  route,
  navigation,
}) {
  const { theme } = useAppContext();
  
  const { accountID, cacheSubject, cacheMark } = route.params;

  // Refresh the shown subject in case of marks refresh
  const [mainSubject, setMainSubject] = useState({}); // Only used for subSubjects
  const [shownSubject, setShownSubject, shownSubjectRef] = useState(cacheSubject);
  const [marks, setMarks] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        if (shownSubject.subID) {
          setShownSubject(cacheData[accountID].data[shownSubject.periodID].subjects[shownSubject.id].subSubjects[shownSubject.subID]);
          setMainSubject(cacheData[accountID].data[shownSubject.periodID].subjects[shownSubject.id]);
        } else { setShownSubject(cacheData[accountID].data[shownSubject.periodID].subjects[shownSubject.id]); }

        let tempMarks = {};
        for (let markID of shownSubjectRef.current.sortedMarks) { tempMarks[markID] = cacheData[accountID].data[shownSubject.periodID].marks[markID]; }
        setMarks(tempMarks);
      }
    });
  }, [globalDisplayUpdater]);

  // Open mark details
  function openMarkDetails(mark) {
    navigation.navigate("MarkPage", {
      accountID,
      cacheMark: mark,
    });
  }
  // Auto-open mark details (on recent mark click)
  const [hasRedirected, setHasRedirected] = useState(false);
  useEffect(() => {
    if (hasRedirected) { return; }
    if (cacheMark) {
      openMarkDetails(cacheMark);
      setHasRedirected(true);
    }
  }, [marks]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(shownSubject.id);
  const [showChangeColorModal, setShowChangeColorModal] = useState(false);
  function resetColor() {
    ColorsHandler.resetSubjectColors(shownSubject.id);
    updateGlobalDisplay();
    HapticsHandler.vibrate("light");
  }

  // Show evolution
  const scrollViewRef = useRef(null);
  const [showEvolution, setShowEvolution] = useState(false);
  useEffect(() => {
    if (showEvolution) {
      scrollViewRef.current?.scrollTo({x: windowWidth, animated: true});
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [showEvolution]);

  // Changeable coefficient
  async function changeCoefficient(newCoefficient) {
    await AppData.setCustomData(
      accountID,
      "subjects",
      `${shownSubject.id}/${shownSubject.subID ?? ""}`,
      "coefficient",
      newCoefficient,
    );
    await AppData.recalculateAverageHistory(accountID);
    updateGlobalDisplay();
  }
  async function resetCustomCoefficient() {
    await AppData.removeCustomData(
      accountID,
      "subjects",
      `${shownSubject.id}/${shownSubject.subID ?? ""}`,
      "coefficient",
    );
    await AppData.recalculateAverageHistory(accountID);
    updateGlobalDisplay();
  }

  // Is subject effective
  const [isEffective, setIsEffective] = useState(shownSubject.isEffective ?? true);
  function toggleIsEffective() {
    asyncExpectedResult(
      async () => {
        await AppData.setCustomData(
          accountID,
          "subjects",
          `${shownSubject.id}/${shownSubject.subID ?? ""}`,
          "isEffective",
          !shownSubject.isEffective,
        );
        await AppData.recalculateAverageHistory(accountID);
      },
      () => updateGlobalDisplay(),
      () => setIsEffective(!shownSubject.isEffective),
    );
  }

  // Custom settings
  const [countMarksWithOnlyCompetences, setCountMarksWithOnlyCompetences] = useState(false);
  useEffect(() => {
    AppData.getPreference("countMarksWithOnlyCompetences").then(setCountMarksWithOnlyCompetences);
  }, [globalDisplayUpdater]);

  // Chart
  const [showClassValueOnChart, setShowClassValueOnChart] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);

  return (
    <CustomModal
      titleStyle={{ color: "black" }}
      goBackFunction={() => navigation.pop()}
      goBackButtonStyle={{ opacity: 0.6 }}
      onlyShowBackButtonOnAndroid
      titleObject={(
        <View style={{ flexDirection: "row", alignItems: "center", maxWidth: '100%', overflow: 'hidden', justifyContent: "flex-end", paddingHorizontal: 50, }}>
          {!isEffective && <MegaphoneOffIcon size={25} color={'black'} style={{ marginRight: 5 }}/>}
          {shownSubject.subID && <Text style={[theme.fonts.titleSmall, { color: "black" }]} numberOfLines={1}>{mainSubject.title ?? "---"}</Text>}
          {shownSubject.subID && <ChevronRightIcon size={25} color={"black"}/>}
          <Text style={[theme.fonts.titleSmall, { color: "black", maxWidth: windowWidth - 70 }]} numberOfLines={1}>{shownSubject.title ?? "---"}</Text>
        </View>
      )}
      rightIcon={(
        <CustomChooser
          title={"Plus d'infos"}
          defaultItem={<EllipsisIcon size={25} color={'black'}/>}
          items={[
            { title: "Code matière", subtitle: `${shownSubject.id}${shownSubject.subID ? ` -> ${shownSubject.subID}` : ""}` },
            { title: shownSubject.isEffective ? "Désactiver cette matière" : "Activer cette matière", onPress: toggleIsEffective, destructive: shownSubject.isEffective },
          ]}
        />
      )}
      rightIconStyle={{ backgroundColor: undefined, borderWidth: 0, padding: 7 }}
      headerStyle={{ backgroundColor: dark }}
      style={{ paddingVertical: 0 }}
      setWidth={setWindowWidth}
      children={
        <View style={{ backgroundColor: theme.colors.backdrop }}>
          {/* Top portion */}
          <View style={{ paddingTop: 20 }}>
            {/* Average & Evolution */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              style={{
                marginTop: 30,
                height: 100,
              }}
            >
              <View style={{
                alignItems: "center",
                marginBottom: 20,
                width: windowWidth - 40,
              }}>
                <Text style={[theme.fonts.headlineLarge, {
                  fontSize: 45,
                }]}>{formatAverage(shownSubject?.average)}</Text>
                <Text style={[theme.fonts.labelLarge, { top: -5 }]}>
                  MOYENNE DE LA {shownSubject.subID ? "SOUS-" : ""}MATIÈRE
                </Text>
              </View>

              {windowWidth ? (
                <View style={{ left: 10 }}>
                  <CustomEvolutionChart
                    listOfValues={shownSubject.averageHistory}
                    showClassValues={shownSubject.hasClassAverage && showClassValueOnChart}
                    color={light}
                    lightColor={dark}
                    activeColor={dark}
                    height={100}
                    windowWidth={windowWidth - 40}
                  />
                </View>
              ) : null}
            </ScrollView>

            {/* Color picker */}
            <View style={{
              position: "absolute",
              top: 10,
              left: -10,
              flexDirection: "row",
              alignItems: "center",
            }}>
              <PressableScale style={{
                backgroundColor: dark,
                borderRadius: 5,
                padding: 5,
                flexDirection: "row",
                alignItems: "center",
              }} onPress={() => setShowChangeColorModal(true)}>
                <PaletteIcon size={20} color={"black"}/>
                <Text style={[theme.fonts.labelMedium, {
                  color: "black",
                  marginHorizontal: 5,
                  height: 22,
                }]}>Couleur</Text>
              </PressableScale>
              {ColorsHandler.isSubjectCustom(shownSubject.id) && (
                <PressableScale style={{
                  marginLeft: 5,
                  borderWidth: 2,
                  borderColor: dark,
                  padding: 3,
                  borderRadius: 5,
                }} onPress={resetColor}>
                  <TrashIcon size={20} color={dark}/>
                </PressableScale>
              )}
            </View>

            {/* Class average */}
            {shownSubject?.classAverage && (
              <View style={{
                position: "absolute",
                top: 10,
                right: -10,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <CustomAnimatedIndicator
                  value={showEvolution}
                  startX={50}
                  endX={0}
                  style={{ marginRight: 5 }}
                  child={
                    <PressableScale style={{
                      padding: 3,
                      borderWidth: 2,
                      borderColor: dark,
                      borderRadius: 5,
                    }} onPress={() => setShowClassValueOnChart(!showClassValueOnChart)}>
                      {showClassValueOnChart ? (
                        <EyeIcon size={20} color={dark}/>
                      ) : (
                        <EyeOffIcon size={20} color={dark}/>
                      )}
                    </PressableScale>
                  }
                />
                <PressableScale style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                  backgroundColor: dark,
                  flexDirection: "row",
                  alignItems: "center",
                }}>
                  <Users2Icon size={20} color={"black"}/>
                  <Text style={[theme.fonts.headlineMedium, {
                    color: "black",
                    fontSize: 17,
                    height: 22,
                    top: Platform.select({ ios: 1, android: -2 }),
                  }]}> : {formatAverage(shownSubject?.classAverage)}</Text>
                </PressableScale>
              </View>
            )}
          </View>

          {/* Switch average & evolution */}
          {shownSubject.averageHistory?.length > 1 && (
            <PressableScale style={{
              position: "absolute",
              alignSelf: "center",
              top: 150,
              zIndex: 10,
              backgroundColor: light,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 15,
              paddingVertical: 3,
              borderRadius: 5,
            }} onPress={() => {
              setShowEvolution(!showEvolution);
              HapticsHandler.vibrate("light");
            }}>
              {showEvolution ? (
                <DraftingCompassIcon size={20} color={"black"} />
              ) : (
                <TrendingUpIcon size={20} color={"black"} />
              )}
              <Text style={[theme.fonts.labelMedium, {
                color: "black",
                marginLeft: 5,
                height: 22,
              }]}>{showEvolution ? "Moyenne" : "Evolution"}</Text>
            </PressableScale>
          )}

          {/* Actual page */}
          <View style={{
            marginTop: 10,
            backgroundColor: theme.colors.backdrop,
            padding: 20,
            paddingTop: 25,
            borderWidth: 2,
            borderColor: theme.colors.surfaceOutline,
            borderRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            width: windowWidth + 4,
            left: -22,
          }}>
            {/* Is effective */}
            {!isEffective && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderWidth: 2,
                  borderColor: theme.colors.error,
                  backgroundColor: theme.colors.errorLight,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexGrow: 1,
                }}>
                  <AlertTriangleIcon size={20} color={theme.colors.error} style={{ marginRight: 10 }}/>
                  <Text style={[theme.fonts.labelMedium, {
                    color: theme.colors.error,
                    height: 22,
                  }]}>Matière désactivée</Text>
                </View>

                <PressableScale onPress={toggleIsEffective} style={{
                  backgroundColor: theme.colors.primaryLight,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  marginLeft: 5,
                }}>
                  <Text style={[theme.fonts.bodyMedium, {
                    color: theme.colors.primary,
                    height: 22,
                  }]}>Activer</Text>
                </PressableScale>
              </View>
            )}
            
            {/* Coefficient */}
            <CustomCoefficientPicker
              coefficient={shownSubject.coefficient}
              setCoefficient={changeCoefficient}
              resetCoefficient={resetCustomCoefficient}
              isCustom={shownSubject.isCustomCoefficient}
              isGuessed={CoefficientHandler.guessSubjectCoefficientEnabled[accountID]}
              openGuessParametersPage={() => {
                if (CoefficientHandler.guessSubjectCoefficientEnabled[accountID] && !shownSubject.isCustomCoefficient) {
                  navigation.navigate('SettingsStack', { openCoefficientsPage: true });
                }
              }}
              dark={dark}
            />

            {/* Teachers */}
            {shownSubject.teachers && (
              <CustomSection title={`Professeur.e${shownSubject.teachers.length > 1 ? "s" : ""}`}/>
            )}
            {shownSubject.teachers?.map((teacher, index) => (
              <CustomSimpleInformationCard
                key={index}
                icon={<GraduationCapIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                content={teacher}
                textStyle={{
                  ...theme.fonts.bodyLarge,
                  width: windowWidth - 100,
                }}
                style={{ marginVertical: 5 }}
              />
            ))}

            {/* Marks */}
            {marks && <CustomSection title={"Notes"} />}
            {marks &&
              shownSubject?.sortedMarks?.map((markID) => (
                <MarkCard
                  key={markID}
                  mark={marks[markID]}
                  subjectTitle={
                    Object.keys(shownSubject.subSubjects).length > 0 &&
                    shownSubject.subSubjects[marks[markID].subSubjectID].title
                  }
                  openMarkDetails={() => openMarkDetails(marks[markID])}
                  outline={markID == cacheMark?.id}
                  windowWidth={windowWidth}
                  countMarksWithOnlyCompetences={countMarksWithOnlyCompetences}
                />
              ))}
          </View>
        </View>
      }
      childrenOutsideScrollView={
        <View>
          {/* Color picker modal */}
          {showChangeColorModal && (
            <SubjectColorPicker
              subjectID={shownSubject.id}
              visible={showChangeColorModal}
              exitModal={() => setShowChangeColorModal(false)}
              initialValue={dark}
              updateGlobalDisplay={updateGlobalDisplay}
              windowWidth={windowWidth}
            />
          )}
        </View>
      }
    />
  );
}

export default SubjectPage;
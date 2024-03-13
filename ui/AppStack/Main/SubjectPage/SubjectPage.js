import { useEffect, useRef } from "react";
import useState from "react-usestateref";
import { Text, View, Dimensions, ScrollView, Platform } from "react-native";
import { ChevronRightIcon, ChevronsUpDownIcon, DraftingCompassIcon, EyeIcon, EyeOffIcon, GraduationCapIcon, PaletteIcon, TrashIcon, TrendingUpIcon, Users2Icon, WeightIcon, XIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MarkCard from "./MarkCard";
import CoefficientPicker from "./CoefficientPicker";
import SubjectColorPicker from "./SubjectColorPicker";
import CustomSection from "../../../components/CustomSection";
import CustomEvolutionChart from "../../../components/CustomEvolutionChart";
import CustomAnimatedIndicator from "../../../components/CustomAnimatedIndicator";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CustomModal from "../../../components/CustomModal";
import ColorsHandler from "../../../../util/ColorsHandler";
import { formatAverage } from "../../../../util/Utils";
import HapticsHandler from "../../../../util/HapticsHandler";
import AppData from "../../../../core/AppData";


// Subject page
function SubjectPage({
  globalDisplayUpdater,
  updateGlobalDisplay,
  route,
  navigation,
}) {
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
      scrollViewRef.current?.scrollTo({x: Dimensions.get('window').width, animated: true});
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [showEvolution]);

  // Changeable coefficient
  const [coefficient, setCoefficient] = useState(null);
  useEffect(() => { setCoefficient(shownSubject.coefficient ?? 1); }, [shownSubject]);
  async function changeCoefficient(newCoefficient) {
    if (newCoefficient === coefficient) { return; }
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
  const [isCoefficientModalVisible, setIsCoefficientModalVisible] = useState(false);

  // Chart
  const [showClassValueOnChart, setShowClassValueOnChart] = useState(false);

  return (
    <CustomModal
      title={!shownSubject.subID && (shownSubject.title ?? "---")}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      goBackButtonStyle={{ opacity: 0.6 }}
      titleObject={shownSubject.subID && (
        <View style={{ flexDirection: "row", alignItems: "center", maxWidth: '100%', overflow: 'hidden' }}>
          <Text style={[DefaultTheme.fonts.titleSmall, { color: "black" }]}>{mainSubject.title ?? "---"}</Text>
          <ChevronRightIcon size={25} color={"black"} />
          <Text style={[DefaultTheme.fonts.titleSmall, { color: "black" }]}>{shownSubject.title ?? "---"}</Text>
        </View>
      )}
      headerStyle={{ backgroundColor: dark }}
      titleStyle={{ color: "black" }}
      extraHeight={200}
      style={{ padding: 0 }}
      children={
        <View>
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
                width: Dimensions.get("window").width,
              }}>
                <Text style={[DefaultTheme.fonts.headlineLarge, {
                  fontSize: 45,
                }]}>{formatAverage(shownSubject?.average)}</Text>
                <Text style={[DefaultTheme.fonts.labelLarge, { top: -5 }]}>
                  MOYENNE DE LA {shownSubject.subID ? "SOUS-" : ""}MATIÈRE
                </Text>
              </View>

              <CustomEvolutionChart
                listOfValues={shownSubject.averageHistory}
                showClassValues={shownSubject.hasClassAverage && showClassValueOnChart}
                color={light}
                lightColor={dark}
                activeColor={dark}
                height={100}
              />
            </ScrollView>

            {/* Color picker */}
            <View style={{
              position: "absolute",
              top: 10,
              left: 10,
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
                <Text style={[DefaultTheme.fonts.labelMedium, {
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
                right: 10,
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
                  <Text style={[DefaultTheme.fonts.headlineMedium, {
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
              <Text style={[DefaultTheme.fonts.labelMedium, {
                color: "black",
                marginLeft: 5,
                height: 22,
              }]}>{showEvolution ? "Moyenne" : "Evolution"}</Text>
            </PressableScale>
          )}

          {/* Actual page */}
          <View style={{
            marginTop: 10,
            backgroundColor: DefaultTheme.colors.backdrop,
            padding: 20,
            paddingTop: 25,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
            borderRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            width: Dimensions.get("window").width + 4,
            left: -2,
          }}>
            {/* Coefficient */}
            <CustomSimpleInformationCard
              icon={<WeightIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              content={"Coefficient"}
              style={{ marginBottom: 5 }}
              rightIcon={
                <PressableScale style={{
                  flexDirection: "row",
                  alignItems: "center",
                }} onPress={() => setIsCoefficientModalVisible(true)}>
                  <XIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
                  <Text style={DefaultTheme.fonts.headlineMedium}>{`${coefficient}`.replace(".", ",")}</Text>
                  <ChevronsUpDownIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled} style={{ marginLeft: 5 }}/>
                </PressableScale>
              }
            />
            {isCoefficientModalVisible && (
              <CoefficientPicker
                isModalVisible={isCoefficientModalVisible}
                setIsModalVisible={setIsCoefficientModalVisible}
                initialValue={coefficient}
                setCoefficient={(newCoefficient) => {
                  setCoefficient(newCoefficient);
                  changeCoefficient(newCoefficient);
                }}
              />
            )}

            {/* Teachers */}
            {shownSubject.teachers && (
              <CustomSection title={`Professeur.e${shownSubject.teachers.length > 1 ? "s" : ""}`}/>
            )}
            {shownSubject.teachers?.map((teacher, index) => (
              <CustomSimpleInformationCard
                key={index}
                icon={<GraduationCapIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                content={teacher}
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
            />
          )}
        </View>
      }
    />
  );
}

export default SubjectPage;
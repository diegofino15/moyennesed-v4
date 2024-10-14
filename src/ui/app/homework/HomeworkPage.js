import { useEffect, useState } from "react";
import { View, Platform, Dimensions, Text, Switch, ActivityIndicator } from "react-native";
import { AlertTriangleIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, EllipsisIcon, GraduationCapIcon, LibraryIcon, ListTodoIcon, SwatchBookIcon, XIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../components/CustomModal";
import CustomSection from "../../components/CustomSection";
import CustomChooser from "../../components/CustomChooser";
import CustomSeparator from "../../components/CustomSeparator";
import CustomFileAttachment from "../../components/CustomFileAttachment";
import CustomSimpleInformationCard from "../../components/CustomSimpleInformationCard";
import HomeworkHandler from "../../../core/HomeworkHandler";
import ColorsHandler from "../../../core/ColorsHandler";
import HapticsHandler from "../../../core/HapticsHandler";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../util/AppStackContext";
import { asyncExpectedResult, formatDate, formatDate2 } from "../../../util/Utils";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// homework page
function HomeworkPage({ navigation, route }) {
  const { theme } = useGlobalAppContext();
  const { isConnected, globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  const { accountID } = useCurrentAccountContext();

  const { cacheHomework, cacheSpecificHomework } = route.params;

  // Auto-update the cache homework
  const [homework, setHomework] = useState(cacheHomework);
  async function loadHomework() {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setHomework(cacheData[accountID].data.homeworks[cacheHomework.id]);
      }
    });
  }
  useEffect(() => { loadHomework(); }, [globalDisplayUpdater]);
  
  // Auto-update the specific homework, and auto-load on page open
  const [specificHomework, setSpecificHomework] = useState(cacheSpecificHomework);
  const [lastTimeUpdatedSpecificHomework, setLastTimeUpdatedSpecificHomework] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  async function getCacheSpecificHomework() {
    const data = await AsyncStorage.getItem("specific-homework");
    if (data) {
      const cacheData = JSON.parse(data);
      if (accountID in cacheData && homework.dateFor in cacheData[accountID].days && homework.id in cacheData[accountID].homeworks) {          
        setSpecificHomework(cacheData[accountID].homeworks[homework.id]);
        setLastTimeUpdatedSpecificHomework(cacheData[accountID].days[homework.dateFor].date);
        setErrorLoading(false);
        return 1;
      }
    }
    return -1;
  }
  async function loadSpecificHomework(force=false) {
    // Check if specific homework is in cache
    if (!force) {
      let status = await getCacheSpecificHomework();
      if (status == 1) {
        setIsLoading(false);
        return;
      }
    }

    if (!isConnected) { return; }
    
    // Fetch specific homework
    setIsLoading(true);
    const status = await HomeworkHandler.getSpecificHomeworkForDay(accountID, homework.dateFor);
    if (status == 1) {
      await getCacheSpecificHomework();
      updateGlobalDisplay();
    }
    else { setErrorLoading(true); }
    setIsLoading(false);
  }
  useEffect(() => { loadSpecificHomework(); }, [globalDisplayUpdater]);

  // Change homework done status
  const [isDone, setIsDone] = useState(homework.done);
  const [isSettingDone, setIsSettingDone] = useState(false);
  function toggleDone() {
    HapticsHandler.vibrate("light");
    setIsSettingDone(true);
    asyncExpectedResult(
      async () => await HomeworkHandler.markHomeworkAsDone(accountID, homework.id, !isDone),
      (done) => {
        setIsDone(done);
        setIsSettingDone(false);
        updateGlobalDisplay();
      },
      () => setIsDone(!isDone),
    );
  }

  // Is todo or sessionContent collapsed
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(false);
  const [isSessionContentCollapsed, setIsSessionContentCollapsed] = useState(false);

  // Get subject colors
  const { dark } = ColorsHandler.getSubjectColors(homework.subjectID);
  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);
  
  return (
    <CustomModal
      goBackFunction={() => navigation.goBack()}
      titleStyle={{ color: 'black' }}
      headerStyle={{ backgroundColor: dark }}
      goBackButtonStyle={{ opacity: 0.6 }}
      onlyShowBackButtonOnAndroid
      setWidth={setWindowWidth}
      title={"Détails du devoir"}
      rightIconStyle={{ backgroundColor: undefined, borderWidth: 0, padding: 7 }}
      rightIcon={isLoading ? (
        <ActivityIndicator size={25} color={'black'}/>
      ) : (
        <CustomChooser
          title={"Plus d'infos"}
          defaultItem={<EllipsisIcon size={25} color={'black'}/>}
          items={[
            { title: "Code devoir", subtitle: `${homework.id}` },
            { title: "Actualiser", onPress: () => loadSpecificHomework(true), icon: {
              ios: 'arrow.clockwise',
            } },
            { title: isDone ? "Marquer comme non fait" : "Marquer comme fait", onPress: toggleDone, icon: {
              ios: homework.done ? 'xmark.circle' : 'checkmark.circle',
              android: homework.done ? 'ic_delete' : 'ic_input_add',
            } },
          ]}
        />
      )}
      children={(
        <View style={{ backgroundColor: theme.colors.backdrop }}>
          {/* Done ? */}
          <CustomSimpleInformationCard
            icon={isSettingDone ? (
              <ActivityIndicator size={25} color={theme.colors.onSurfaceDisabled}/>
            ) : isDone ? (
              <CheckIcon size={25} color={theme.colors.onSurfaceDisabled}/>
            ) : (
              <XIcon size={25} color={theme.colors.onSurfaceDisabled}/>
            )}
            content={"Effectué"}
            rightIcon={(
              <Switch
                value={isDone}
                onValueChange={toggleDone}
              />
            )}
          />

          <CustomSeparator style={{ marginVertical: 20 }}/>
          
          {/* Subject */}
          <CustomSimpleInformationCard
            icon={<SwatchBookIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            content={'Matière'}
            rightIcon={(
              <Text style={[theme.fonts.bodyLarge, {
                width: windowWidth - 170,
                textAlign: "right",
              }]} numberOfLines={1}>{homework.subjectTitle}</Text>
            )}
            style={{ marginBottom: 10 }}
          />
          {/* Due when ? */}
          <CustomSimpleInformationCard
            icon={<CalendarIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            content={"Pour le"}
            rightIcon={(
              <Text style={[theme.fonts.bodyLarge, {
                width: windowWidth - 160,
                textAlign: "right",
              }]}>{formatDate2(homework.dateFor, false, true)}</Text>
            )}
            style={{ marginBottom: 10 }}
          />
          {/* Is exam ? */}
          {homework.isExam && (
            <CustomSimpleInformationCard
              icon={<AlertTriangleIcon size={25} color={theme.colors.error}/>}
              content={"Evaluation"}
              textStyle={{ color: theme.colors.error }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.error,
                backgroundColor: theme.colors.backdrop,
                marginBottom: 10,
              }}
            />
          )}

          {/* Content */}
          {errorLoading ? (
            <View style={{
              marginTop: 100,
              alignItems: 'center'
            }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <AlertTriangleIcon size={25} color={theme.colors.error} style={{ marginRight: 5 }}/>
                <Text style={theme.fonts.bodyLarge}>Une erreur est survenue</Text>
              </View>
              <Text style={theme.fonts.labelMedium}>Impossible de charger le devoir</Text>
            </View>
          ) : !specificHomework ? (
            <ActivityIndicator size={30} color={theme.colors.onSurfaceDisabled} style={{
              marginTop: 100,
            }}/>
          ) : (
            <>
              {/* Todo */}
              <PressableScale style={{
                marginTop: 20,
                backgroundColor: theme.colors.surface,
                borderWidth: 2,
                borderColor: theme.colors.surfaceOutline,
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }} onPress={() => setIsTodoCollapsed(!isTodoCollapsed)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ListTodoIcon size={25} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 10 }}/>
                  <Text style={theme.fonts.bodyLarge}>À faire</Text>
                </View>

                {isTodoCollapsed ? (
                  <ChevronLeftIcon size={25} color={theme.colors.onSurfaceDisabled}/>
                ) : (
                  <ChevronDownIcon size={25} color={theme.colors.onSurfaceDisabled}/>
                )}
              </PressableScale>
              {!isTodoCollapsed && (
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 20 }}>
                  <View style={{
                    marginRight: 10,
                    width: 4,
                    borderRadius: 5,
                    backgroundColor: theme.colors.surfaceOutline,
                    height: '100%',
                  }}/>
                  <Text style={[theme.fonts.bodyLarge, {
                    textAlign: "justify",
                    width: windowWidth - 54,
                  }]}>{specificHomework?.todo}</Text>
                </View>
              )}

              {/* Session content */}
              {specificHomework?.sessionContent ? (
                <>
                  <PressableScale style={{
                    marginTop: 20,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.surfaceOutline,
                    borderRadius: 10,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }} onPress={() => setIsSessionContentCollapsed(!isSessionContentCollapsed)}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <LibraryIcon size={25} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 10 }}/>
                      <Text style={theme.fonts.bodyLarge}>Contenu de séance</Text>
                    </View>

                    {isSessionContentCollapsed ? (
                      <ChevronLeftIcon size={25} color={theme.colors.onSurfaceDisabled}/>
                    ) : (
                      <ChevronDownIcon size={25} color={theme.colors.onSurfaceDisabled}/>
                    )}
                  </PressableScale>
                  {!isSessionContentCollapsed && (
                    <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 20 }}>
                      <View style={{
                        marginRight: 10,
                        width: 4,
                        borderRadius: 5,
                        backgroundColor: theme.colors.surfaceOutline,
                        height: '100%',
                      }}/>
                      <Text style={[theme.fonts.bodyLarge, {
                        textAlign: "justify",
                        width: windowWidth - 54,
                      }]}>{specificHomework?.sessionContent}</Text>
                    </View>
                  )}
                </>
              ) : null}

              {/* File attachments */}
              {specificHomework?.files.length > 0 && (
                <>
                  <CustomSection
                    title={"Fichiers attachés"}
                  />
                  {specificHomework.files.map(file => (
                    <CustomFileAttachment
                      key={file.id}
                      file={file}
                      windowWidth={windowWidth}
                    />
                  ))}
                </>
              )}


              <CustomSection
                title={"Plus d'infos"}
              />

              {/* When was it given */}
              <CustomSimpleInformationCard
                icon={<CalendarIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                content={"Saisi le"}
                rightIcon={(
                  <Text style={[theme.fonts.bodyLarge, {
                    width: windowWidth - 160,
                    textAlign: "right",
                  }]}>{formatDate2(homework.dateGiven)}</Text>
                )}
                style={{ marginBottom: 10 }}
              />
              {/* Who gave it */}
              <CustomSimpleInformationCard
                icon={<GraduationCapIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                content={"Saisi par"}
                rightIcon={(
                  <Text style={[theme.fonts.bodyLarge, {
                    width: windowWidth - 180,
                    textAlign: "right",
                  }]}>{specificHomework?.givenBy ?? "--"}</Text>
                )}
              />

              {/* Info */}
              <Text style={[theme.fonts.labelMedium, {
                fontFamily: 'Text-Italic',
                marginTop: 10,
                marginBottom: 50,
              }]}>Dernière mise à jour : {formatDate(lastTimeUpdatedSpecificHomework)}</Text>
            </>
          )}
        </View>
      )}
    />
  );
}

export default HomeworkPage;
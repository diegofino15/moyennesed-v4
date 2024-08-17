import { useEffect, useState } from "react";
import { View, Platform, Dimensions, Text, Switch, ActivityIndicator } from "react-native";
import { AlertTriangleIcon, CalendarIcon, CheckIcon, ChevronDownIcon, DownloadIcon, ExternalLinkIcon, FileIcon, GraduationCapIcon, SwatchBookIcon, XIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FileViewer from "react-native-file-viewer";
import * as DropdownMenu from 'zeego/dropdown-menu'
import * as RNFS from "react-native-fs";

import CustomModal from "../../../components/CustomModal";
import CustomChooser from "../../../components/CustomChooser";
import CustomSection from "../../../components/CustomSection";
import CustomSeparator from "../../../components/CustomSeparator";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import AppData from "../../../../core/AppData";
import ColorsHandler from "../../../../core/ColorsHandler";
import HapticsHandler from "../../../../core/HapticsHandler";
import { useAppContext } from "../../../../util/AppContext";
import { asyncExpectedResult, formatDate, formatDate2 } from "../../../../util/Utils";


// File attachment
function HomeworkFileAttachment({ accountID, file, windowWidth }) {
  const { theme } = useAppContext();
  
  const [isDownloading, setIsDownloading] = useState(false);
  async function openAttachment() {
    setIsDownloading(true);
    const { promise, localFile } = await AppData.downloadHomeworkFile(accountID, file);
    promise.then(() => {
      FileViewer.open(localFile);
      setIsDownloading(false);
    });
  }

  const [fileExists, setFileExists] = useState(false);
  useEffect(() => {
    RNFS.exists(`${RNFS.DocumentDirectoryPath}/${file.title}`).then(setFileExists);
  }, [isDownloading]);

  return (
    <CustomChooser
      title={"Options"}
      items={fileExists ? [{
        title: "Supprimer le document",
        key: 0,
        destructive: true,
      }] : []}
      setSelected={() => {
        RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${file.title}`);
        setFileExists(false);
      }}
      longPress
      defaultItem={(
        <PressableScale
          onPress={() => openAttachment()}
          onLongPress={fileExists ? () => {} : undefined}
          key={file.id}
        >
          <CustomSimpleInformationCard
            icon={<FileIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            content={file.title}
            textStyle={{
              width: windowWidth - 130,
            }}

            rightIcon={(
              <View style={{
                marginRight: 5,
              }}>
                {fileExists ? (
                  <ExternalLinkIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                ) : isDownloading ? (
                  <ActivityIndicator size={20} color={theme.colors.onSurfaceDisabled}/>
                ) : (
                  <DownloadIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                )}
              </View>
            )}
            style={{
              marginVertical: 5,
              borderWidth: 2,
              borderColor: theme.colors.surfaceOutline,
            }}
          />
        </PressableScale>
      )}
    />
  );
}

// More info
function MoreInfoPopup({ homework, toggleDone, forceRefresh }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <ChevronDownIcon size={30} color={'black'}/>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Plus d'infos</DropdownMenu.Label>

        {Platform.select({ ios: (
          <>
          <DropdownMenu.Item key={1}>
            <DropdownMenu.ItemTitle>Code devoir</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle>{`${homework.id}`}</DropdownMenu.ItemSubtitle>
          </DropdownMenu.Item>

          <DropdownMenu.Item key={2} onSelect={forceRefresh}>
            <DropdownMenu.ItemIcon ios={{
              name: 'arrow.clockwise',
            }}/> 
            <DropdownMenu.ItemTitle>{"Actualiser"}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>

          <DropdownMenu.Item key={3} destructive={homework.done} onSelect={toggleDone}>
            <DropdownMenu.ItemIcon ios={{
              name: homework.done ? 'xmark.circle' : 'checkmark.circle',
            }}/> 
            <DropdownMenu.ItemTitle>{homework.done ? "Marquer comme non fait" : "Marquer comme fait"}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          </>
        ), android: (
          <>
          <DropdownMenu.Item key={1}>
            <DropdownMenu.ItemTitle>{`Code devoir : ${homework.id}`}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>

          <DropdownMenu.Item key={2} destructive={homework.done} onSelect={toggleDone}>
            <DropdownMenu.ItemIcon androidIconName={homework.done ? 'ic_delete' : 'ic_input_add'}/> 
            <DropdownMenu.ItemTitle>{homework.done ? "Marquer comme non fait" : "Marquer comme fait"}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          </>
        ) })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

// homework page
function HomeworkPage({ isConnected, globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { theme } = useAppContext();
  
  const { accountID, cacheHomework, cacheSpecificHomework } = route.params;

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
    const status = await AppData.getSpecificHomeworkForDay(accountID, homework.dateFor);
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
      async () => await AppData.markHomeworkAsDone(accountID, homework.id, !isDone),
      (done) => {
        setIsDone(done);
        setIsSettingDone(false);
        updateGlobalDisplay();
      },
      () => setIsDone(!isDone),
    );
  }

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
      rightIcon={(
        <BlurView style={{
          borderRadius: 10,
          overflow: "hidden",
        }} tint="dark" intensity={30}>
          {isLoading ? (
            <ActivityIndicator size={30} color={'black'}/>
          ) : (
            <MoreInfoPopup homework={homework} toggleDone={toggleDone} forceRefresh={() => loadSpecificHomework(true)}/>
          )}
        </BlurView>
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
            content={"Matière"}
            rightIcon={(
              <Text style={[theme.fonts.labelLarge, {
                marginLeft: 5,
              }]} numberOfLines={1}>{homework.subjectTitle}</Text>
            )}
            style={{ marginBottom: 10 }}
          />
          {/* Due when ? */}
          <CustomSimpleInformationCard
            icon={<CalendarIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            content={"Pour le"}
            rightIcon={(
              <Text style={theme.fonts.labelLarge}>{formatDate2(homework.dateFor, false, true)}</Text>
            )}
            style={{ marginBottom: 10 }}
          />

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
              <CustomSection
                title={"À faire"}
              />
              <Text style={[theme.fonts.bodyLarge, { textAlign: "justify" }]}>{specificHomework?.todo}</Text>

              {/* Session content */}
              {specificHomework?.sessionContent && (
                <>
                  <CustomSection
                    title={"Contenu de séance"}
                    marginTop={50}
                  />
                  <Text style={[theme.fonts.bodyLarge, { textAlign: "justify" }]}>{specificHomework?.sessionContent}</Text>
                </>
              )}

              {/* File attachments */}
              {specificHomework?.files.length > 0 && (
                <>
                  <CustomSection
                    title={"Fichiers attachés"}
                    marginTop={50}
                  />
                  {specificHomework.files.map(file => (
                    <HomeworkFileAttachment
                      key={file.id}
                      accountID={accountID}
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
                content={"Donné le"}
                rightIcon={(
                  <Text style={theme.fonts.labelLarge}>{formatDate2(homework.dateGiven)}</Text>
                )}
                style={{ marginBottom: 10 }}
              />
              {/* Who gave it */}
              <CustomSimpleInformationCard
                icon={<GraduationCapIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                content={"Donné par"}
                rightIcon={(
                  <Text style={[theme.fonts.labelLarge, {
                    marginLeft: 5,
                  }]} numberOfLines={1}>{specificHomework?.givenBy ?? "--"}</Text>
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
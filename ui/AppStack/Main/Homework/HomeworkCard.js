import { useEffect } from "react";
import useState from "react-usestateref";
import { View, Text, ActivityIndicator, Platform, TextInput } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CalendarIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, CircleIcon, DownloadIcon, ExternalLinkIcon, FileIcon, GraduationCapIcon } from "lucide-react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

import CustomSeparator from "../../../components/CustomSeparator";
import CustomChooser from "../../../components/CustomChooser";
import { formatDate2, asyncExpectedResult } from "../../../../util/Utils";
import ColorsHandler from "../../../../core/ColorsHandler";
import HapticsHandler from "../../../../core/HapticsHandler";
import AppData from "../../../../core/AppData";
import { useAppContext } from "../../../../util/AppContext";


// Attachment
function Attachment({ accountID, file, windowWidth }) {
  const [isDownloading, setIsDownloading] = useState(false);
  async function openAttachment(file) {
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
      defaultItem={(
        <PressableScale key={file.id} style={{
          marginVertical: 5,
          padding: 5,
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          backgroundColor: theme.colors.backdrop,
          borderRadius: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} onPress={() => openAttachment(file)} onLongPress={fileExists ? () => {} : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FileIcon size={20} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>
            <Text style={[theme.fonts.bodyMedium, {
              width: windowWidth - 150,
              height: 22,
            }]} numberOfLines={1}>{file.title}</Text>
          </View>
          {fileExists ? (
            <ExternalLinkIcon size={20} color={theme.colors.onSurface}/>
          ) : isDownloading ? (
            <ActivityIndicator size={20} color={theme.colors.onSurface}/>
          ) : (
            <DownloadIcon size={20} color={theme.colors.onSurface}/>
          )}
        </PressableScale>
      )}
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
    />
  );
}

// Little info card
function LittleInfoCard({ title, icon, style }) {
  const { theme } = useAppContext();
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surfaceOutline,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 2,
      ...style,
    }}>
      {icon}
      <Text style={[theme.fonts.labelMedium, {
        height: 22,
      }]}>{title}</Text>
    </View>
  );
}


// Exam card
function HomeworkCard({
  accountID,
  abstractHomework,
  specificHomework,
  loadSpecificHomework,
  isAlreadyLoading,
  openAtDisplay,
  windowWidth,
}) {
  const { theme } = useAppContext();
  
  // Get subject
  const { light, dark } = ColorsHandler.getSubjectColors(abstractHomework.subjectID);

  // Change homework done status
  const [isDone, setIsDone] = useState(abstractHomework.done);
  function toggleDone() {
    HapticsHandler.vibrate("light");
    asyncExpectedResult(
      async () => await AppData.markHomeworkAsDone(accountID, abstractHomework.id, !isDone),
      (done) => setIsDone(done),
      () => setIsDone(!isDone),
    );
  }

  // Is expanded
  const [wantsToOpen, setWantsToOpen] = useState(openAtDisplay);
  useEffect(() => {
    if (!isAlreadyLoading && specificHomework.todo && wantsToOpen) {
      setWantsToOpen(false);
      setIsExpanded(true);
    }
  }, [isAlreadyLoading]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  function toggleExpand() {
    if (isExpanded) { setIsExpanded(false); return; }
    
    if (specificHomework.todo) { setIsExpanded(true); }
    else {
      if (isAlreadyLoading) { setWantsToOpen(true); }
      else {
        setIsLoading(true);
        loadSpecificHomework().then(() => {
          setIsExpanded(true);
          setIsLoading(false);
        });
      }
    }
  }

  // Expand animation
  const [height, setHeight] = useState(0);
  const onLayout = (event) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && layoutHeight != height) {
      setHeight(layoutHeight);
    }
  }
  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = isExpanded ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    }
  });

  return (
    <View style={{
      marginVertical: 5,
    }}>
      {abstractHomework.isExam && (
        <View style={{
          fontFamily: "Text-Italic",
          paddingHorizontal: 10,
          marginLeft: 10,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: theme.colors.error,
          position: 'absolute',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          height: 30,
        }}>
          <Text style={[theme.fonts.bodyMedium, {
            color: theme.colors.error,
          }]}>CONTRÔLE</Text>
        </View>
      )}
      
      <View style={{
        marginTop: abstractHomework.isExam ? 23 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <PressableScale style={{
          paddingLeft: 15,
          paddingRight: 5,
          borderRadius: 10,
          backgroundColor: dark,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          flexGrow: 1,
          marginRight: 5,
        }} onPress={toggleExpand}>
          <Text style={[theme.fonts.bodyLarge, {
            color: 'black',
            width: windowWidth - 160,
            height: 25,
          }]} numberOfLines={1}>{abstractHomework.subjectTitle}</Text>

          <View style={{ padding: 10 }}>
            {isExpanded ? (
              <ChevronUpIcon size={25} color={'black'}/>
            ) : isLoading ? (
              <ActivityIndicator size={25} color={'black'}/>
            ) : (
              <ChevronDownIcon size={25} color={'black'}/>
            )}
          </View>
        </PressableScale>

        {/* Toggle done */}
        <PressableScale style={{
          padding: 10,
        }} onPress={toggleDone}>
          {isDone ? (
            <View style={{
              padding: 5,
              borderRadius: 15,
              backgroundColor: abstractHomework.isExam ? theme.colors.error : light,
            }}>
              <CheckIcon size={18} color={'black'}/>
            </View>
          ) : (
            <CircleIcon size={28} color={abstractHomework.isExam ? theme.colors.error : light}/>
          )}
        </PressableScale>
      </View>

      <Animated.View style={[animatedStyle, {
        overflow: 'hidden',
        borderRadius: 10,
        marginTop: 5,
      }]}>
        <View style={{
          position: 'absolute',
          padding: 10,
          width: windowWidth - 40,
        }} onLayout={onLayout}>
          {/* What to do */}
          {Platform.select({ ios: (
            <TextInput
              style={theme.fonts.bodyMedium}
              multiline
              editable={false}
              scrollEnabled={false}
            >{specificHomework?.todo}</TextInput>
          ), android: (
            <Text style={theme.fonts.bodyMedium} selectable>{specificHomework?.todo}</Text>
          ) })}

          {/* Files */}
          {specificHomework.files?.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <CustomSeparator style={{ backgroundColor: theme.colors.surfaceOutline, marginVertical: 10 }}/>
              <Text style={theme.fonts.labelLarge}>Pièces jointes</Text>
              {specificHomework.files.map(file => (
                <Attachment key={file.id} accountID={accountID} file={file} windowWidth={windowWidth}/>
              ))}
            </View>
          )}

          {/* Professor name */}
          <LittleInfoCard
            title={specificHomework.givenBy}
            icon={<GraduationCapIcon size={20} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>}
            style={{ marginTop: 20 }}
          />
          <LittleInfoCard
            title={`Donné le ${formatDate2(abstractHomework.dateGiven)}`}
            icon={<CalendarIcon size={20} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>}
            style={{ marginVertical: 5 }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

export default HomeworkCard;
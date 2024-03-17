import { useEffect, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, CircleIcon, DownloadIcon, ExternalLinkIcon, FileIcon } from "lucide-react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

import CustomSeparator from "../../../components/CustomSeparator";
import { formatDate2, asyncExpectedResult } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";
import ColorsHandler from "../../../../util/ColorsHandler";


// Attachment
function Attachment({ accountID, file }) {
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
    <PressableScale key={file.id} style={{
      marginVertical: 5,
      padding: 5,
      borderWidth: 2,
      borderColor: DefaultTheme.colors.surfaceOutline,
      backgroundColor: DefaultTheme.colors.backdrop,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }} onPress={() => openAttachment(file)}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FileIcon size={20} color={DefaultTheme.colors.surfaceOutline} style={{ marginRight: 5 }}/>
        <Text style={[DefaultTheme.fonts.bodyMedium, {
          width: Dimensions.get('window').width - 140,
        }]}>{file.title}</Text>
      </View>
      {fileExists ? (
        <ExternalLinkIcon size={20} color={DefaultTheme.colors.onSurface}/>
      ) : isDownloading ? (
        <ActivityIndicator size={20} color={DefaultTheme.colors.onSurface}/>
      ) : (
        <DownloadIcon size={20} color={DefaultTheme.colors.onSurface}/>
      )}
    </PressableScale>
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
}) {
  // Get subject
  const { light, dark } = ColorsHandler.getSubjectColors(abstractHomework.subjectID);

  // Change homework done status
  const [isDone, setIsDone] = useState(abstractHomework.done);
  function toggleDone() {
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
  })

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
          borderColor: DefaultTheme.colors.error,
          position: 'absolute',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          height: 30,
        }}>
          <Text style={[DefaultTheme.fonts.bodyMedium, {
            color: DefaultTheme.colors.error,
          }]}>CONTRÔLE</Text>
        </View>
      )}
      
      <View style={{
        marginTop: abstractHomework.isExam ? 23 : 0,
        flexDirection: 'row',
        alignItems: 'stretch',
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
          width: Dimensions.get('window').width - 93,
        }} onPress={toggleExpand}>
          <Text style={[DefaultTheme.fonts.bodyLarge, {
            color: 'black',
            width: Dimensions.get('window').width - 160,
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

        <PressableScale style={{
          padding: 8,
          borderWidth: 2,
          borderColor: abstractHomework.isExam ? DefaultTheme.colors.error : DefaultTheme.colors.surfaceOutline,
          backgroundColor: abstractHomework.isExam ? DefaultTheme.colors.errorLight : null,
          borderRadius: 10,
        }} onPress={toggleDone}>
          {isDone ? (
            <CheckCircleIcon size={28} color={abstractHomework.isExam ? DefaultTheme.colors.error : light}/>
          ) : (
            <CircleIcon size={28} color={abstractHomework.isExam ? DefaultTheme.colors.error : light}/>
          )}
        </PressableScale>
      </View>

      <Animated.View style={[animatedStyle, {
        overflow: 'hidden',
        backgroundColor: DefaultTheme.colors.surface,
        borderRadius: 10,
        marginTop: 5,
      }]}>
        <View style={{
          paddingVertical: 10,
          paddingHorizontal: 15,
          position: 'absolute',
        }} onLayout={onLayout}>
          {/* What to do */}
          <Text style={DefaultTheme.fonts.bodyMedium}>{specificHomework?.todo}</Text>

          {/* Files */}
          {specificHomework.files?.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <CustomSeparator style={{ backgroundColor: DefaultTheme.colors.surfaceOutline, marginVertical: 10 }}/>
              <Text style={DefaultTheme.fonts.labelLarge}>Pièces jointes</Text>
              {specificHomework.files.map(file => (
                <Attachment key={file.id} accountID={accountID} file={file}/>
              ))}
            </View>
          )}

          {/* Professor name */}
          <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: "Text-Italic", marginTop: 20 }]}>{specificHomework?.givenBy}   |   {formatDate2(abstractHomework.dateGiven)}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default HomeworkCard;
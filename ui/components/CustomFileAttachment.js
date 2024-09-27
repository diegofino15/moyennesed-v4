import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { FileIcon, ExternalLinkIcon, DownloadIcon, TrashIcon } from "lucide-react-native";
import FileViewer from "react-native-file-viewer";
import * as RNFS from "react-native-fs";

import CustomChooser from "./CustomChooser";
import CustomSimpleInformationCard from "./CustomSimpleInformationCard";
import AppData from "../../src/core/AppData";
import { useGlobalAppContext } from "../../src/util/GlobalAppContext";


// File attachment
function CustomFileAttachment({ accountID, file, windowWidth, deleteButton=false, onDelete }) {
  const { theme } = useGlobalAppContext();
  
  const [isDownloading, setIsDownloading] = useState(false);
  async function openAttachment() {
    if (isDownloading) { return; }
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
    <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          if (onDelete) { onDelete(); }
        }}
        longPress
        defaultItem={(
          <PressableScale
            key={file.id}
            onPress={() => openAttachment()}
            onLongPress={fileExists ? () => {} : undefined}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <CustomSimpleInformationCard
              icon={<FileIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
              content={file.title}
              textStyle={{
                width: windowWidth - 130 - (deleteButton ? 45 : 0),
                ...theme.fonts.bodyLarge,
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
                flexGrow: 1,
              }}
            />
          </PressableScale>
        )}
      />
      
      {deleteButton && (
        <PressableScale style={{
          padding: 10,
          backgroundColor: theme.colors.error,
          borderRadius: 10,
          marginLeft: 5,
        }} onPress={() => {
          RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${file.title}`);
          setFileExists(false);
          if (onDelete) { onDelete(); }
        }}>
          <TrashIcon size={25} color={theme.colors.onPrimary}/>
        </PressableScale>
      )}
    </View>
  );
}

export default CustomFileAttachment;
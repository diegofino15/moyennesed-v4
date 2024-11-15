import { useEffect, useState } from 'react';
import { Dimensions, Platform, Text, View } from "react-native";
import RNFS from "react-native-fs";

import CustomModal from "../../components/CustomModal";
import CustomFileAttachment from '../../components/CustomFileAttachment';
import { useGlobalAppContext } from "../../../util/GlobalAppContext";


// Page that shows all the downloaded files from the homework
function FilesPage({ navigation }) {
  const { theme } = useGlobalAppContext();

  // Get a list of the files
  const [files, setFiles] = useState([]);
  async function getDownloadedFiles() {
    const files = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/files`);
    setFiles(files);
  }
  useEffect(() => { getDownloadedFiles(); }, []);
  
  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);

  return (
    <CustomModal
      title={"Fichiers"}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      setWidth={setWindowWidth}
      children={(
        <View>
          {files.length == 0 ? (
            <View style={{
              marginBottom: 50, 
              marginTop: 200,
              alignItems: 'center'
            }}>
              <Text style={theme.fonts.bodyLarge}>Aucun fichier téléchargé</Text>
              <Text style={theme.fonts.labelMedium}>Rien à voir ici !</Text>
            </View>
          ) : (
            <>
              <Text style={[theme.fonts.labelLarge, {
                marginBottom: 10,
              }]}>Liste des fichiers téléchargés :</Text>

              {files.map((file, index) => (
                <CustomFileAttachment
                  key={index}
                  file={{title: file.name}}
                  deleteButton
                  onDelete={() => getDownloadedFiles()}
                  windowWidth={windowWidth}
                />
              ))}
            </>
          )}
        </View>
      )}
    />
  );
}

export default FilesPage;
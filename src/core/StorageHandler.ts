import { PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS, { DownloadResult } from "react-native-fs";


// Used to handle local storage
class StorageHandler {
  // Handle local data //

  // Check if data exists
  static async dataExists(fileName: string): Promise<boolean> {
    const jsonData = await AsyncStorage.getItem(fileName);
    if (jsonData !== null) { return true; }
    
    return await RNFS.exists(`${RNFS.DocumentDirectoryPath}/files/${fileName}`);
  }

  // Save JSON data to file
  static async saveData(fileName: string, data: {}) {
    await AsyncStorage.setItem(fileName, JSON.stringify(data));
  }
  // Get JSON data from file
  static async getData(fileName: string): Promise<{} | null> {
    const data = await AsyncStorage.getItem(fileName);
    return data ? JSON.parse(data) : null;
  }

  // Download and save documents
  static async downloadDocument(url: string, fileName: string, token: string): Promise<{ promise: Promise<void | DownloadResult>, path: string }> {
    const localFile = `${RNFS.DocumentDirectoryPath}/files/${fileName}`;

    // Handle permissions
    if (Platform.OS == "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
    }
    
    // Create folder if needed
    if (!(await RNFS.exists(`${RNFS.DocumentDirectoryPath}/files`))) {
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/files`);
    }
    
    // Check if file already exists
    if (await RNFS.exists(localFile)) {
      console.log(`File ${fileName} already exists, skipping...`);
      return {
        promise: Promise.resolve(),
        path: localFile,
      };
    }
    
    return {
      promise: RNFS.downloadFile({
        fromUrl: url,
        toFile: localFile,
        headers: { "X-Token": token, "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT },
      }).promise,
      path: localFile,
    };
  }
  static async getAllDocuments(): Promise<RNFS.ReadDirItem[]> {
    return RNFS.readDir(`${RNFS.DocumentDirectoryPath}/files`);
  }


  // Clear data //

  // Clear local files
  static async deleteDocument(fileName: string) {
    await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/files/${fileName}`);
  }
  static async deleteAllDocuments() {
    const files: RNFS.ReadDirItem[] = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/files`);
    files.forEach(file => {
      if (file.isFile()) {
        RNFS.unlink(file.path);
      }
    });
  }
  static async deleteFiles(fileNames: string[]) {
    await AsyncStorage.multiRemove(fileNames);
  }
  static async deleteAllFiles() {
    await AsyncStorage.clear();
  }
  static async clear() {
    await this.deleteAllFiles();
    await this.deleteAllDocuments();
  }
}

export default StorageHandler;
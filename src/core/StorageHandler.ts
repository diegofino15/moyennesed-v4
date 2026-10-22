import { PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import RNFS, { DownloadResult } from "react-native-fs";


// Keys holding secrets (ÉcoleDirecte password, 2FA "trusted device" tokens).
// They are kept in the iOS Keychain / Android Keystore instead of AsyncStorage,
// which is an unencrypted SQLite database / plain files included in device backups.
const SECURE_KEYS = new Set(["credentials", "double-auth-tokens"]);
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  // Never migrated to another device, not readable while the phone is locked
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};


// Used to handle local storage
class StorageHandler {
  // Secure storage //

  static isSecureKey(fileName: string): boolean { return SECURE_KEYS.has(fileName); }

  // Read a secret, migrating it from AsyncStorage if an older version stored it there
  static async _getSecure(fileName: string): Promise<{} | null> {
    const secureData = await SecureStore.getItemAsync(fileName, SECURE_OPTIONS);
    if (secureData !== null) { return JSON.parse(secureData); }

    const legacyData = await AsyncStorage.getItem(fileName);
    if (legacyData === null) { return null; }
    await SecureStore.setItemAsync(fileName, legacyData, SECURE_OPTIONS);
    await AsyncStorage.removeItem(fileName);
    return JSON.parse(legacyData);
  }
  static async _deleteSecure(fileName: string) {
    await SecureStore.deleteItemAsync(fileName, SECURE_OPTIONS);
    await AsyncStorage.removeItem(fileName);
  }
  static async _deleteAllSecure() {
    for (const key of SECURE_KEYS) { await this._deleteSecure(key); }
  }

  // On iOS the Keychain survives an uninstall : if regular app data is gone
  // (fresh install) but secrets remain, wipe them instead of silently re-using them.
  static async purgeOrphanSecureData() {
    const accounts = await AsyncStorage.getItem("accounts");
    const legacyCredentials = await AsyncStorage.getItem("credentials");
    if (accounts === null && legacyCredentials === null) {
      await this._deleteAllSecure();
    }
  }


  // Handle local data //

  // Check if data exists
  static async dataExists(fileName: string): Promise<boolean> {
    if (this.isSecureKey(fileName)) { return (await this._getSecure(fileName)) !== null; }

    const jsonData = await AsyncStorage.getItem(fileName);
    if (jsonData !== null) { return true; }

    return await RNFS.exists(`${RNFS.DocumentDirectoryPath}/files/${fileName}`);
  }

  // Save JSON data to file
  static async saveData(fileName: string, data: {}) {
    if (this.isSecureKey(fileName)) {
      await SecureStore.setItemAsync(fileName, JSON.stringify(data), SECURE_OPTIONS);
      await AsyncStorage.removeItem(fileName);
      return;
    }
    await AsyncStorage.setItem(fileName, JSON.stringify(data));
  }
  // Get JSON data from file
  static async getData(fileName: string): Promise<{} | null> {
    if (this.isSecureKey(fileName)) { return await this._getSecure(fileName); }

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
    try {
      const files: RNFS.ReadDirItem[] = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/files`);
      files.forEach(file => {
        if (file.isFile()) {
          RNFS.unlink(file.path);
        }
      });
    } catch (e) {
      console.warn("An error occured while reading local documents : ", e);
    }
  }
  static async deleteFiles(fileNames: string[]) {
    for (const fileName of fileNames.filter(name => this.isSecureKey(name))) {
      await this._deleteSecure(fileName);
    }
    await AsyncStorage.multiRemove(fileNames);
  }
  static async deleteAllFiles() {
    await this._deleteAllSecure();
    await AsyncStorage.clear();
  }
  static async clear() {
    await this.deleteAllFiles();
    await this.deleteAllDocuments();
  }
}

export default StorageHandler;
import AsyncStorage from "@react-native-async-storage/async-storage";

// This class contains the data used inside cache troughout the app
class AppData {
  // Preferences
  static vibrate = true;
  
  
  
  // Transform data into savable cache
  static getCachedData() {
    return {
      "accountID": 1662
    }
  }
  
  // Save cache
  static async saveCache() {
    AsyncStorage.setItem("cache", JSON.stringify(this.getCachedData()));
  }

  // Load cache
  static async loadCache() {
    AsyncStorage.getItem("cache").then(cacheData => {
      if (cacheData) {
        const data = JSON.parse(cacheData);
      }
    });
  }
}

export default AppData;
import axios from "axios";

import AppData from "../core/AppData";


// This class contains all functions related to parsing the latest news
// from the custom MoyennesED's API, like polls, warnings or available updates
class NewsHandler {
  static isLoaded = false;

  // Chosen by the user
  static allowLatestNewsRefresh = false;

  // Init
  static async loadPreferences(openPreferencesPopup) {
    const hasChosenAPIPreferences = await AppData.getPreference("hasChosenAPIPreferences");
    if (hasChosenAPIPreferences) {
      this.allowLatestNewsRefresh = await AppData.getPreference("allowLatestNewsRefresh");
      this.isLoaded = true;
      console.log("Preferences loaded !");
    } else {
      console.log("No preferences found, showing popup...");
      openPreferencesPopup();
    }
  }

  static async setPreferences(allowLatestNewsRefresh) {
    await AppData.setPreference("hasChosenAPIPreferences", true);
    await AppData.setPreference("allowLatestNewsRefresh", allowLatestNewsRefresh);
    this.allowLatestNewsRefresh = allowLatestNewsRefresh;
    this.isLoaded = true;
    console.log("Preferences saved !");
  }

  // Get latest news
  static async getLatestNews() {
    if (!this.isLoaded || !this.allowLatestNewsRefresh) return;
    
    console.log("Fetching latest news...")
    const latestNews = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/latest`).catch(e => {
      console.warn(`An error occured while parsing latest news : ${e}`);
    });
    return latestNews;
  }

  // Get poll content
  static async getPollContent(pollID) {
    if (!this.isLoaded || !this.allowLatestNewsRefresh) return;
    
    console.log(`Fetching poll content... (ID : ${pollID}`)
    const pollContent = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/polls/get?id=${pollID}`).catch(e => {
      console.warn(`An error occured while parsing poll content : ${e}`);
    });
    return pollContent;
  }
}

export default NewsHandler;
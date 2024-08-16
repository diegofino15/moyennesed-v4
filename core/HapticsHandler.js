import * as Haptics from "expo-haptics";

import AppData from "./AppData";


// Controls vibrations used by buttons in the app
class HapticsHandler {
  static enableVibrations = null;

  static async toggle(value) {
    this.enableVibrations = value;
    await AppData.setPreference("enableVibrations", value);
  }
  static async load() {
    this.enableVibrations = await AppData.getPreference("enableVibrations", true);
  }
  
  static vibrate(impactWeight) {
    if (this.enableVibrations == null) {
      this.load().then(_ => this.vibrate(impactWeight));
      return;
    }
    
    if (this.enableVibrations) {
      Haptics.impactAsync(
        impactWeight == "light" ? Haptics.ImpactFeedbackStyle.Light
        : impactWeight == "medium" ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy
      );
    }
  }
}

export default HapticsHandler;
import * as Haptics from "expo-haptics";

import AppData from "./AppData";


// Controls vibrations used by buttons in the app
class HapticsHandler {
  static vibrate(impactWeight) {
    if (AppData.vibrate) {
      Haptics.impactAsync(
        impactWeight == "light" ? Haptics.ImpactFeedbackStyle.Light
        : impactWeight == "medium" ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy
      );
    }
  }
}

export default HapticsHandler;
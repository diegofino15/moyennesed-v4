import * as Haptics from "expo-haptics";


// Controls vibrations used by buttons in the app
class HapticsHandler {
  static enableVibrations = true;

  static enable() { this.enableVibrations = true; }
  static disable() { this.enableVibrations = false; }
  
  static vibrate(impactWeight) {
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
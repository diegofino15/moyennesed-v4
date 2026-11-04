import {
  getAnalytics,
  resetAnalyticsData,
  setAnalyticsCollectionEnabled,
  setConsent,
} from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

import StorageHandler from "./StorageHandler";


// Firebase Analytics is opt-in and independent from ads.
// The choice is stored for the whole app (not per account), because it applies
// to the device/install rather than to a specific ÉcoleDirecte account.
//
// firebase.json keeps analytics_auto_collection_enabled at false and automatic
// screen reporting disabled. Collection is only enabled at runtime here, after
// an explicit acceptance, and no screen views or custom events are logged.
class AnalyticsHandler {
  static CONSENT_KEY = "analytics-consent";
  static GRANTED = "granted";
  static DENIED = "denied";

  // Read the stored choice. null means the user has not chosen yet.
  static async getStoredConsent() {
    const value = await StorageHandler.getData(this.CONSENT_KEY);
    return value === this.GRANTED || value === this.DENIED ? value : null;
  }

  // Apply the stored choice at startup. When the user has not chosen yet, this
  // also disables collection so nothing can be sent before consent.
  static async applyStoredConsent() {
    const choice = await this.getStoredConsent();
    await this._applyChoice(choice);
    return choice;
  }

  // Persist and apply an acceptance.
  static async grantConsent() {
    try {
      await StorageHandler.saveData(this.CONSENT_KEY, this.GRANTED);
    } catch (e) {
      console.warn("Unable to save analytics consent:", e);
    }
    await this._applyChoice(this.GRANTED);
  }

  // Persist and apply a refusal, then remove the local analytics identity.
  // Data already uploaded to Firebase is covered by its retention settings.
  static async denyConsent() {
    try {
      await StorageHandler.saveData(this.CONSENT_KEY, this.DENIED);
    } catch (e) {
      console.warn("Unable to save analytics consent:", e);
    }
    await this._applyChoice(this.DENIED);

    try {
      await resetAnalyticsData(getAnalytics(getApp()));
    } catch (e) {
      console.warn("resetAnalyticsData failed:", e);
    }
  }

  // Enable or disable Firebase Analytics collection and keep Consent Mode in
  // sync. Ads are always non-personalized, so every ad signal stays denied.
  static async _applyChoice(choice) {
    const granted = choice === this.GRANTED;
    try {
      const analytics = getAnalytics(getApp());
      await setConsent(analytics, {
        analytics_storage: granted,
        ad_storage: false,
        ad_user_data: false,
        ad_personalization: false,
      });
      await setAnalyticsCollectionEnabled(analytics, granted);
    } catch (e) {
      console.warn("Unable to apply analytics consent:", e);
    }
  }
}

export default AnalyticsHandler;

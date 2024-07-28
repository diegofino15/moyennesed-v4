import mobileAds, { AdsConsent, MaxAdContentRating } from 'react-native-google-mobile-ads';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';


// Class used to serve Admob ads
class AdsHandler {
  // Are ads personalized or not
  static servePersonalizedAds;
  static canServeAds = false;
  
  // Set configuration for the app
  static async configureAds() {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.T,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,

      testDeviceIdentifiers: __DEV__ ? [
        'EMULATOR',
        // '1adefe524601c1c428f7269406ba7402',        // Diego's iPhone 14
        // '00008110-000E34380CD3801E',            // Diego's iPhone 13
        // 'ee618e10-913d-4b58-9625-e8cdaa212ac5', // Leo's Samsung S9+
      ] : [],
    });
  }

  // Admob init function
  static async initAds() {
    await this.configureAds();
    await mobileAds().initialize();
  }

  // Check ATT consent
  static async checkATTConsent() {
    const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    if (result == RESULTS.DENIED) {
      const newResult = await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      return newResult == RESULTS.GRANTED;
    }
    return result == RESULTS.GRANTED;
  }

  // Complete function
  static async setupAdmob({ checkForConsent=true }){  
    if (checkForConsent) {
      // Check consent with Google's UMP message
      var adsConsentInfo = await AdsConsent.requestInfoUpdate();
      if (adsConsentInfo.isConsentFormAvailable) { adsConsentInfo = await AdsConsent.loadAndShowConsentFormIfRequired(); }
      const userPreferences = await AdsConsent.getUserChoices();
      var allowPersonalizedAds = userPreferences.selectPersonalisedAds;

      // Check consent with Apple's ATT message
      var attConsent = (Platform.OS == "android");
      if (Platform.OS == "ios") {
        attConsent = await this.checkATTConsent();
      }
    }

    // Init Admob
    await this.initAds();

    if (checkForConsent) {
      // Finally save preferences
      this.servePersonalizedAds = allowPersonalizedAds && attConsent;
      this.canServeAds = true;
    }
  }

  // Open debugger
  static async openDebugger() {
    try { // The promise will resolve when the inspector is closed.
      await mobileAds().openAdInspector();
    } catch (error) { // The promise will reject if ad inspector is closed due to an error.
      console.log(error);
    }
  }
}

export default AdsHandler;
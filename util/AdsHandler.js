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
        '00008110-000E34380CD3801E' // Diego's iPhone 13
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
  static async setupAdmob(){  
    // Check consent with Google's UMP message
    var adsConsentInfo = await AdsConsent.requestInfoUpdate();
    if (adsConsentInfo.isConsentFormAvailable) { adsConsentInfo = await AdsConsent.loadAndShowConsentFormIfRequired(); }
    const userPreferences = await AdsConsent.getUserChoices();
    const allowPersonalizedAds = userPreferences.selectPersonalisedAds;

    // Check consent with Apple's ATT message
    var attConsent = (Platform.OS == "android");
    if (Platform.OS == "ios") {
      const gdprApplies = await AdsConsent.getGdprApplies();
      const hasConsentForPurposeOne = gdprApplies && (await AdsConsent.getPurposeConsents()).startsWith("1");
      if (!gdprApplies || hasConsentForPurposeOne) {
        attConsent = await this.checkATTConsent();
      }
    }

    // Init Admob
    await this.initAds();

    // Finally save preferences
    this.servePersonalizedAds = allowPersonalizedAds && attConsent;
    this.canServeAds = true;
  }
}

export default AdsHandler;
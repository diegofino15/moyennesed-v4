import mobileAds, { AdsConsent, MaxAdContentRating } from 'react-native-google-mobile-ads';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { firebase } from '@react-native-firebase/analytics';
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
  static async setupAdmob({ checkForConsent=true, setCanServeAds, setIsAdsHandlerLoaded }){  
    try {
      if (checkForConsent) {
        await this.askForAdChoices();
      }
  
      // Init Admob
      await this.initAds();

      if (checkForConsent) {
        setCanServeAds(true);
      }
    } catch (e) {
      console.warn("Error while setting up Admob");
    }

    setIsAdsHandlerLoaded(true);
  }

  // Reset choices
  static resetAdChoices() { AdsConsent.reset(); }

  // Ask again for choices
  static async askForAdChoices() {
    // Check consent with Google's UMP message
    var adsConsentInfo = await AdsConsent.requestInfoUpdate();
    if (adsConsentInfo.isConsentFormAvailable) { adsConsentInfo = await AdsConsent.loadAndShowConsentFormIfRequired(); }
    const userPreferences = await AdsConsent.getUserChoices();
    var allowPersonalizedAds = userPreferences.selectPersonalisedAds;
    await firebase.analytics().setConsent({
      analytics_storage: userPreferences.storeAndAccessInformationOnDevice,
      ad_storage: userPreferences.storeAndAccessInformationOnDevice,
      ad_user_data: userPreferences.createAPersonalisedAdsProfile,
      ad_personalization: userPreferences.selectPersonalisedAds,
    });

    // Check consent with Apple's ATT message
    var attConsent = (Platform.OS == "android");
    if (Platform.OS == "ios") {
      attConsent = await this.checkATTConsent();
      await firebase.analytics().setAnalyticsCollectionEnabled(attConsent);
    }

    this.servePersonalizedAds = allowPersonalizedAds && attConsent;
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
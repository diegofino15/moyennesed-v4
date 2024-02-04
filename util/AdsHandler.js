import mobileAds, { AdsConsent, MaxAdContentRating, AppOpenAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';


// Set configuration for the app
async function configureAds() {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.T,
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,

    testDeviceIdentifiers: __DEV__ ? [
      'EMULATOR',
      '00008110-000E34380CD3801E'
    ] : [],
  });
}

// Admob init function
async function initAds() {
  await configureAds();
  await mobileAds().initialize();
}

// Check ATT consent
async function checkATTConsent() {
  const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  if (result == RESULTS.DENIED) {
    const newResult = await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    return newResult == RESULTS.GRANTED;
  }
  return result == RESULTS.GRANTED;
}

// Get ad unit id
function getAppOpenAdUnitID() {
  return __DEV__ ? TestIds.APP_OPEN : Platform.select({
    ios: process.env.EXPO_PUBLIC_IOS_APPOPEN_AD_UNIT_ID,
    android: process.env.EXPO_PUBLIC_ANDROID_APPOPEN_AD_UNIT_ID,
  });
}

// Complete function
async function setupAdmobAndShowAppOpenAd(hideSplashScreen){  
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
      attConsent = await checkATTConsent();
    }
  }

  // Init Admob
  await initAds();

  // Should show AppOpen Ad ? (30% chance)
  const shouldShowAppOpenAd = Math.random() < 0.3;
  if (shouldShowAppOpenAd) {
    const appOpenAd = AppOpenAd.createForAdRequest(
      getAppOpenAdUnitID(), {
      publisherProvidedId: process.env.EXPO_PUBLIC_ADMOB_PUBLISHER_ID,
      requestNonPersonalizedAdsOnly: !allowPersonalizedAds || !attConsent,
      keywords: ["élève", "lycée", "collège", "école"],
    });
    appOpenAd.addAdEventsListener((event) => {
      if (event.type == AdEventType.LOADED) { appOpenAd.show(); }
      else if (event.type == AdEventType.CLOSED || event.type == AdEventType.ERROR) {
        hideSplashScreen();
      }
    });
    appOpenAd.load();
  } else { hideSplashScreen(); }
}

export default setupAdmobAndShowAppOpenAd;
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import RNAdConsent from '@ulangi/react-native-ad-consent';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';


// Set configuration for the app
async function configureAds() {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.T,
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,

    testDeviceIdentifiers: [
      __DEV__ ? 'EMULATOR' : '',
    ],
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
  if (result === RESULTS.DENIED) {
    await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  }
}

// Should request personnalized ads consent from user
async function shouldGetConsentFromUser(publisherId) {
    const consentStatus = await RNAdConsent.requestConsentInfoUpdate({ publisherId });
    const isInEeaOrUnknown = await RNAdConsent.isRequestLocationInEeaOrUnknown();
    return consentStatus === "unknown" && isInEeaOrUnknown === true;
}

// Complete function
async function showConsentFormAndInitAdMob(publisherId){
  // Check ATT consent
  await checkATTConsent();
  
  // Check personnalized ads consent
  if (await shouldGetConsentFromUser(publisherId)) {
      const consentStatus = await RNAdConsent.showGoogleConsentForm({
          privacyPolicyUrl: "https://moyennesed.my.to/privacy-policy.html",
          shouldOfferAdFree: false,
      });
  }

  // Init Admob
  await initAds();
}

export default showConsentFormAndInitAdMob;
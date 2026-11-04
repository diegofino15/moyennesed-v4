import mobileAds, {
  AdsConsent,
  AdsConsentDebugGeography,
  AdsConsentPrivacyOptionsRequirementStatus,
  AgeRestrictedTreatment,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';


// Class used to serve Admob ads
class AdsHandler {
  static canServeAds = false;

  // Test devices used by Ad Inspector / test ads (dev builds only)
  static getTestDeviceIdentifiers() {
    if (!__DEV__) { return []; }

    const envDeviceIds = (process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    return ['EMULATOR', ...envDeviceIds];
  }

  // Options passed to the UMP SDK. In development, force an EEA geography so
  // the consent form can be tested even if the device is detected as non-EEA.
  // Debug geography is ignored for non-test devices and never used in release.
  static getConsentOptions() {
    if (!__DEV__) { return {}; }

    const options = {
      debugGeography: AdsConsentDebugGeography.EEA,
    };

    const envDeviceIds = (process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (envDeviceIds.length > 0) {
      options.testDeviceIdentifiers = envDeviceIds;
    }

    return options;
  }

  // Set configuration for the app
  static async configureAds() {
    await mobileAds().setRequestConfiguration({
      // The app is aimed at a young audience, so only allow ads suitable for
      // teens and below. Personalization is disabled separately.
      maxAdContentRating: MaxAdContentRating.T,
      ageRestrictedTreatment: AgeRestrictedTreatment.TEEN,
      testDeviceIdentifiers: this.getTestDeviceIdentifiers(),
    });
  }

  // Admob init function
  static async initAds() {
    await this.configureAds();
    await mobileAds().initialize();
  }

  // Complete function
  static async setupAdmob({ checkForConsent=true, setCanServeAds, setIsAdsHandlerLoaded }){
    try {
      if (!checkForConsent) {
        // The consent form has not been shown yet (not logged-in): the Mobile Ads
        // SDK is not started at all, so nothing is sent to Google before consent.
        this.canServeAds = false;
        console.log("Ads not initialised (consent not asked yet)");
      } else {
        // Ask for consent with Google's UMP message
        let consentInfo;
        try {
          consentInfo = await this.askForAdChoices();
        } catch (e) {
          // Offline or UMP error: fall back to the consent state saved by a previous session
          console.warn("Consent request failed, using saved consent state:", e);
          consentInfo = await AdsConsent.getConsentInfo();
        }
        console.log("Ads consent info:", consentInfo);

        if (consentInfo?.canRequestAds) {
          // Ads are mandatory when consent allows them, but never personalized.
          await this.initAds();
          this.canServeAds = true;
          if (typeof setCanServeAds === "function") { setCanServeAds(true); }
          console.log("Ads allowed !");
        } else {
          // Consent does not allow requesting ads: the SDK is never started
          this.canServeAds = false;
          if (typeof setCanServeAds === "function") { setCanServeAds(false); }
          console.log("Ads not allowed !");
        }
      }
      console.log("Admob setup completed");
    } catch (e) {
      console.warn("Error while setting up Admob");
      console.warn(e);
    }
    if (typeof setIsAdsHandlerLoaded === "function") {
      setIsAdsHandlerLoaded(true);
    }
  }

  // Is a privacy options form available to change ad choices ?
  static async canShowAdChoices() {
    try {
      const consentInfo = await AdsConsent.getConsentInfo();
      return consentInfo.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
    } catch (e) {
      console.warn("getConsentInfo failed:", e);
      return false;
    }
  }

  // Open the privacy options form
  static async showAdChoices() {
    return await AdsConsent.showPrivacyOptionsForm();
  }

  // Ask again for choices
  static async askForAdChoices() {
    const options = this.getConsentOptions();
    let adsConsentInfo = await AdsConsent.requestInfoUpdate(options);

    console.log("UMP consent state:", {
      status: adsConsentInfo.status,
      isConsentFormAvailable: adsConsentInfo.isConsentFormAvailable,
      privacyOptionsRequirementStatus: adsConsentInfo.privacyOptionsRequirementStatus,
      canRequestAds: adsConsentInfo.canRequestAds,
      gdprApplies: await AdsConsent.getGdprApplies(),
      options: options,
    });

    if (adsConsentInfo.isConsentFormAvailable) {
      adsConsentInfo = await AdsConsent.loadAndShowConsentFormIfRequired();
    }

    return adsConsentInfo;
  }

  // Open debugger
  static async openDebugger() {
    try { // The promise will resolve when the inspector is closed.
      await mobileAds().openAdInspector();
      return true;
    } catch (error) { // The promise will reject if ad inspector is closed due to an error.
      console.warn("Ad Inspector failed:", error);
      return false;
    }
  }
}

export default AdsHandler;

import { getApp } from "@react-native-firebase/app";
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from "@react-native-firebase/app-check";


// Initialize Firebase App Check
async function initFirebaseAppCheck() {
  try {
    // Configure the React Native Firebase provider
    const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();

    rnfbProvider.configure({
      android: {
        provider: __DEV__ ? "debug" : "playIntegrity",
        debugToken: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_DEBUG_TOKEN,
      },
      apple: {
        provider: __DEV__
          ? "debug"
          : "appAttestWithDeviceCheckFallback",
        debugToken: process.env.EXPO_PUBLIC_FIREBASE_IOS_DEBUG_TOKEN,
      },
    });

    // Initialize App Check for the default Firebase app
    const appCheck = initializeAppCheck(getApp(), {
      provider: rnfbProvider,
      isTokenAutoRefreshEnabled: true,
    });

    // Verify that a token can be obtained
    const { token } = await appCheck.getToken(true);

    if (token.length > 0) {
      console.log("App Check verification passed");
    } else {
      console.warn("App Check returned an empty token");
    }

    return appCheck;
  } catch (error) {
    console.error("App Check initialization or verification failed:", error);
  }
}

export { initFirebaseAppCheck };

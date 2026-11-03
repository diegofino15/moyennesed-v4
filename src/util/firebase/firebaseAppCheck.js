import { getApp } from "@react-native-firebase/app";
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from "@react-native-firebase/app-check";

let appCheckPromise = null;

export function initFirebaseAppCheck() {
  // Run only once, even if called from several places
  if (!appCheckPromise) {
    appCheckPromise = (async () => {
      try {
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          android: {
            provider: __DEV__ ? "debug" : "playIntegrity",
            debugToken: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_DEBUG_TOKEN,
          },
          apple: {
            provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
            debugToken: process.env.EXPO_PUBLIC_FIREBASE_IOS_DEBUG_TOKEN,
          },
        });

        return initializeAppCheck(getApp(), {
          provider,
          isTokenAutoRefreshEnabled: true,
        });
      } catch (error) {
        console.error("App Check initialization failed:", error);
        return null;
      }
    })();
  }
  return appCheckPromise;
}
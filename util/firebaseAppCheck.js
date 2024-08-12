import { firebase } from "@react-native-firebase/app-check";


// Init firebase app-check
async function initFirebaseAppCheck() {
  const appCheck = firebase.appCheck();

  // Set custom provider
  const rnfbProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
  rnfbProvider.configure({
    android: {
      provider: __DEV__ ? 'debug' : 'playIntegrity',
      debugToken: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_DEBUG_TOKEN,
    },
    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
      debugToken: process.env.EXPO_PUBLIC_FIREBASE_IOS_DEBUG_TOKEN,
    },
  });

  // Initialize AppCheck
  await appCheck.initializeAppCheck({
    provider: rnfbProvider,
    isTokenAutoRefreshEnabled: true
  });

  // Test
  try {
    const { token } = await appCheck.getToken(true);
  
    if (token.length > 0) {
      console.log('AppCheck verification passed');
    }
  } catch (error) {
    console.log('AppCheck verification failed');
    console.log(error);
  }
}

export { initFirebaseAppCheck };
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";

import AppRoot from "./ui/AppRoot";
// import { usePushNotifications } from "./util/usePushNotifications";
// import { setupNotifications } from "./util/firebaseCloudMessaging";
import { useEffect } from "react";


// Keep SplashScreen
SplashScreen.preventAutoHideAsync();

// Main app
function App() {
  // Register for notifications
  // useEffect(() => {
  //   setupNotifications();
  // }, []);

  // const { expoPushToken, notification } = usePushNotifications();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppRoot />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;

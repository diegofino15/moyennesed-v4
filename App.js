import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import AppRoot from "./src/ui/AppRoot";


// Keep SplashScreen
SplashScreen.preventAutoHideAsync();

// Disable strict logging for Reanimated
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Main app
function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppRoot />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;

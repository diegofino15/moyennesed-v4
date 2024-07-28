import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";

import AppRoot from "./ui/AppRoot";


// Keep SplashScreen
SplashScreen.preventAutoHideAsync();

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

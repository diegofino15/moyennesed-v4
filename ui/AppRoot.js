import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { PaperProvider, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthStack from "./AuthStack/AuthStack";
import AppStack from "./AppStack/AppStack";
import { AppContextProvider } from "../util/AppContext";
import { useFonts, initTheme } from "../util/Styles";


// App Root
function AppRoot({ closeSplashScreen }) {
  // Close SplashScreen once app is loaded
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { if (isLoaded) { closeSplashScreen(); } }, [isLoaded]);

  // Is user logged-in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Init theme object (doesn't work in prepare function ?)
  var theme = useTheme();

  // Prepare function
  useEffect(() => { prepare(); }, []);
  async function prepare() {
    // Load UI
    await useFonts();
    initTheme(theme);

    // Check if logged-in
    const credentials = await AsyncStorage.getItem("credentials");
    if (credentials) { setIsLoggedIn(true); }

    // Finish loading app
    setIsLoaded(true);
  }

  if (!isLoaded) { return null; }
  return (
    <PaperProvider theme={theme}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={"light-content"}
      />
      <AppContextProvider state={{ isLoggedIn, setIsLoggedIn }}>
        {isLoggedIn
          ? <AppStack/>
          : <AuthStack/>}
      </AppContextProvider>
    </PaperProvider>
  );
}

export default AppRoot;
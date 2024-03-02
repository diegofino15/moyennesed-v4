import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { PaperProvider, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

import AuthStack from "./AuthStack/AuthStack";
import AppStack from "./AppStack/AppStack";
import { AppContextProvider } from "../util/AppContext";
import { useFonts, initTheme } from "../util/Styles";
import AdsHandler from "../util/AdsHandler";
import ColorsHandler from "../util/ColorsHandler";
import AppData from "../core/AppData";


// App Root
function AppRoot() {
  // Close SplashScreen once app is loaded
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { if (isLoaded) { SplashScreen.hideAsync(); } }, [isLoaded]);

  // Is user logged-in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cameFromAuthStack, setCameFromAuthStack] = useState(false);

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
    if (credentials) {
      setIsLoggedIn(true);

      // For users migrating from v3
      const accounts = await AsyncStorage.getItem("accounts");
      if (!accounts) {
        await AppData.refreshLogin();
        setCameFromAuthStack(true);
      }

      await ColorsHandler.load();

      await AdsHandler.setupAdmob({ checkForConsent: true });
      setIsLoaded(true);
    } else {
      await AdsHandler.setupAdmob({ checkForConsent: false });
      setIsLoaded(true);
    }
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
          ? <AppStack cameFromAuthStack={cameFromAuthStack}/>
          : <AuthStack setCameFromAuthStack={setCameFromAuthStack}/>}
      </AppContextProvider>
    </PaperProvider>
  );
}

export default AppRoot;
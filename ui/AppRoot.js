import { useEffect, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

import AuthStack from "./AuthStack/AuthStack";
import AppStack from "./AppStack/AppStack";
import DoubleAuthPopup from "./components/DoubleAuthPopup";
import { AppContextProvider, useAppContext } from "../util/AppContext";
import { Themes, initFontsAndThemes } from "../util/Styles";
import AdsHandler from "../core/AdsHandler";
import ColorsHandler from "../core/ColorsHandler";
import CoefficientHandler from "../core/CoefficientHandler";
import AppData from "../core/AppData";
import { setupNotifications } from "../util/firebaseCloudMessaging";


// App Root
function AppRoot() {
  // Close SplashScreen once app is loaded
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { if (isLoaded) { SplashScreen.hideAsync(); } }, [isLoaded]);

  // Setup notifications
  useEffect(() => {
    setupNotifications();
  }, []);


  // Is user logged-in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cameFromAuthStack, setCameFromAuthStack] = useState(false);

  // Theme
  const [theme, setTheme] = useState(null);
  const [isAutoTheme, setIsAutoTheme] = useState(true);

  // Prepare function
  useEffect(() => { prepare(); }, []);
  async function prepare() {
    // Load UI
    await initFontsAndThemes();
    const themeData = JSON.parse(await AsyncStorage.getItem("theme"));
    if (themeData) {
      setIsAutoTheme(themeData.isAutoTheme);
      setTheme(themeData.savedTheme == "dark" ? Themes.DarkTheme : Themes.LightTheme);
    } else {
      setTheme(Themes.DarkTheme)
    }

    // Check if logged-in
    const credentials = await AsyncStorage.getItem("credentials");
    if (credentials) {
      setIsLoggedIn(true);

      await ColorsHandler.load();
      await CoefficientHandler.load();

      AdsHandler.setupAdmob({ checkForConsent: true });
      setIsLoaded(true);
    } else {
      AdsHandler.setupAdmob({ checkForConsent: false });
      setIsLoaded(true);
    }
  }

  if (!isLoaded) { return null; }
  return (
    <AppContextProvider
      loggedIn={isLoggedIn}
      autoTheme={isAutoTheme}
      savedTheme={theme}
    >
      <GlobalStack
        cameFromAuthStack={cameFromAuthStack}
        setCameFromAuthStack={setCameFromAuthStack}
      />
    </AppContextProvider>
  );
}


// Global stack
const Stack = createNativeStackNavigator();
function GlobalStack({ cameFromAuthStack, setCameFromAuthStack }) {
  const { theme, changeTheme, isAutoTheme, isLoggedIn, setIsLoggedIn } = useAppContext();

  // Auto-change theme
  const colorScheme = useColorScheme();
  useEffect(() => {
    if (isAutoTheme) {
      if (colorScheme == "dark") { changeTheme(Themes.DarkTheme); }
      else { changeTheme(Themes.LightTheme); }
    }
  }, [colorScheme, isAutoTheme]);

  // Double auth popup
  const navigation = useNavigation();
  useEffect(() => {
    AppData.openDoubleAuthPopup = () => navigation.navigate("DoubleAuthPopup");
    if (AppData.wantToOpenDoubleAuthPopup) {
      AppData.openDoubleAuthPopup();
      AppData.wantToOpenDoubleAuthPopup = false;
    }
  }, []);
  
  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />
      <Stack.Navigator>
        <Stack.Screen
          name="GlobalStack"
          options={{ headerShown: false }}
          initialParams={{ needToRefresh: false }}
        >
          {(props) => isLoggedIn ? (
            <AppStack cameFromAuthStack={cameFromAuthStack} {...props}/>
          ) : (
            <AuthStack setCameFromAuthStack={setCameFromAuthStack} {...props}/>
          )}
        </Stack.Screen>

        {/* Double auth popup */}
        <Stack.Screen
          name="DoubleAuthPopup"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'fade_from_bottom',
            gestureEnabled: false,
          }}
        >
          {(props) => <DoubleAuthPopup
            {...props}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
}

export default AppRoot;
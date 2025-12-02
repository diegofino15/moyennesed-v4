import { useEffect } from "react";
import useState from "react-usestateref";
import { StatusBar, useColorScheme } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";

import AuthStack from "./auth/AuthStack";
import AppStack from "./app/AppStack";
import { Themes, initFontsAndThemes } from "../util/Styles";
import { GlobalAppContextProvider, useGlobalAppContext } from "../util/GlobalAppContext";
import { initFirebaseAppCheck } from "../util/firebase/firebaseAppCheck";
import { setupNotifications } from "../util/firebase/firebaseCloudMessaging";
import AdsHandler from "../core/AdsHandler";
import ColorsHandler from "../core/ColorsHandler";
import CoefficientHandler from "../core/CoefficientHandler";
import AccountHandler from "../core/AccountHandler";
import StorageHandler from "../core/StorageHandler";


// App Root
function AppRoot() {
  // Close SplashScreen once app is loaded
  const [isLoaded, setIsLoaded, isLoadedRef] = useState(false);
  useEffect(() => { if (isLoadedRef.current) { SplashScreen.hideAsync(); } }, [isLoadedRef.current]);

  // Is user logged-in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cameFromAuthStack, setCameFromAuthStack] = useState(false);

  // Theme
  const [theme, setTheme] = useState(null);
  const [isAutoTheme, setIsAutoTheme] = useState(true);

  // Context
  const [canServeAds, setCanServeAds] = useState(false);
  const [isAdsHandlerLoaded, setIsAdsHandlerLoaded] = useState(false);

  // Prepare function
  useEffect(() => { prepare(); }, []);
  async function prepare() {
    // Load firebase app-check
    initFirebaseAppCheck().then(() => {
      console.log("Firebase AppCheck is setup !");
    });

    // Register for notifications
    setupNotifications().then(() => {
      console.log("Notifications registered");
    })
    
    // Load UI
    await initFontsAndThemes();
    const themeData = await StorageHandler.getData("theme");
    if (themeData) {
      setIsAutoTheme(themeData.isAutoTheme);
      setTheme(themeData.savedTheme == "dark" ? Themes.DarkTheme : Themes.LightTheme);
    } else {
      setTheme(Themes.DarkTheme)
    }

    // Check if logged-in
    const credentialsExist = await StorageHandler.dataExists("credentials");
    if (credentialsExist) {
      setIsLoggedIn(true);

      await ColorsHandler.load();
      await CoefficientHandler.load();
      
      AdsHandler.setupAdmob({ checkForConsent: true, setCanServeAds: setCanServeAds, setIsAdsHandlerLoaded: setIsAdsHandlerLoaded });
    } else {
      AdsHandler.setupAdmob({ checkForConsent: false, setCanServeAds: setCanServeAds, setIsAdsHandlerLoaded: setIsAdsHandlerLoaded });
    }
    
    setIsLoaded(true);
  }

  if (!isLoaded) { return null; }
  return (
    <GlobalAppContextProvider
      loggedIn={isLoggedIn}
      autoTheme={isAutoTheme}
      savedTheme={theme}
      _canServeAds={canServeAds}
      _isAdsHandlerLoaded={isAdsHandlerLoaded}
    >
      <GlobalStack
        cameFromAuthStack={cameFromAuthStack}
        setCameFromAuthStack={setCameFromAuthStack}
      />
    </GlobalAppContextProvider>
  );
}


// Global stack
const Stack = createNativeStackNavigator();
function GlobalStack({ cameFromAuthStack, setCameFromAuthStack }) {
  const { theme, changeTheme, isAutoTheme, isLoggedIn } = useGlobalAppContext();

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
    AccountHandler.openDoubleAuthPopup = () => navigation.navigate("DoubleAuthPopup");
    if (AccountHandler.wantToOpenDoubleAuthPopup) {
      AccountHandler.openDoubleAuthPopup();
      AccountHandler.wantToOpenDoubleAuthPopup = false;
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
      </Stack.Navigator>
    </>
  );
}

export default AppRoot;
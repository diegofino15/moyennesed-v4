import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { PaperProvider, useTheme } from "react-native-paper";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";


import AuthStack from "./AuthStack/AuthStack";
import AppStack from "./AppStack/AppStack";
import DoubleAuthPopup from "./components/DoubleAuthPopup";
import { AppContextProvider } from "../util/AppContext";
import { useFonts, initTheme } from "../util/Styles";
import AdsHandler from "../core/AdsHandler";
import ColorsHandler from "../core/ColorsHandler";
import CoefficientHandler from "../core/CoefficientHandler";
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
    <PaperProvider theme={theme}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={"light-content"}
      />
      <AppContextProvider state={{ isLoggedIn, setIsLoggedIn }}>
        <GlobalStack
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          cameFromAuthStack={cameFromAuthStack}
          setCameFromAuthStack={setCameFromAuthStack}
        />
      </AppContextProvider>
    </PaperProvider>
  );
}


// Global stack
const Stack = createNativeStackNavigator();
function GlobalStack({ isLoggedIn, setIsLoggedIn, cameFromAuthStack, setCameFromAuthStack }) {
  const navigation = useNavigation();
  useEffect(() => {
    AppData.openDoubleAuthPopup = () => navigation.navigate("DoubleAuthPopup");
    if (AppData.wantToOpenDoubleAuthPopup) {
      AppData.openDoubleAuthPopup();
      AppData.wantToOpenDoubleAuthPopup = false;
    }
  }, []);
  
  return (
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
  );
}

export default AppRoot;
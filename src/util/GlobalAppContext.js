import { createContext, useState, useContext, useEffect } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';


// Context needed to switch from AppStack to AuthStack
export const GlobalAppContext = createContext({
  isLoggedIn: Boolean, setIsLoggedIn: Function,
  theme: MD3DarkTheme, changeTheme: Function,
  isAutoTheme: Boolean, setIsAutoTheme: Function,

  canServeAds: Boolean,
  isAdsHandlerLoaded: Boolean,
});
export const useGlobalAppContext = () => useContext(GlobalAppContext);

export function GlobalAppContextProvider({ loggedIn, autoTheme, savedTheme, _isAdsHandlerLoaded, _canServeAds, children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const [theme, changeTheme] = useState(savedTheme);
  const [isAutoTheme, setIsAutoTheme] = useState(autoTheme);

  const [canServeAds, setCanServeAds] = useState(_canServeAds);
  useEffect(() => setCanServeAds(_canServeAds), [_canServeAds]);
  const [isAdsHandlerLoaded, setIsAdsHandlerLoaded] = useState(_isAdsHandlerLoaded);
  useEffect(() => setIsAdsHandlerLoaded(_isAdsHandlerLoaded), [_isAdsHandlerLoaded]);

  return (
    <GlobalAppContext.Provider value={{
      isLoggedIn: isLoggedIn,
      setIsLoggedIn,
      theme: theme,
      changeTheme,
      isAutoTheme: isAutoTheme,
      setIsAutoTheme,

      canServeAds: canServeAds,
      isAdsHandlerLoaded: isAdsHandlerLoaded,
    }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </GlobalAppContext.Provider>
  );
}
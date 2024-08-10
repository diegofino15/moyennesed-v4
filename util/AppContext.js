import { createContext, useState, useContext, useEffect } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';


// Context needed to switch from AppStack to AuthStack
export const AppContext = createContext({
  isLoggedIn: Boolean,
  theme: MD3DarkTheme,
});
export const useAppContext = () => useContext(AppContext);

export function AppContextProvider({ loggedIn, autoTheme, savedTheme, _canServeAds, children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const [theme, changeTheme] = useState(savedTheme);
  const [isAutoTheme, setIsAutoTheme] = useState(autoTheme);

  const [canServeAds, setCanServeAds] = useState(_canServeAds);
  useEffect(() => setCanServeAds(_canServeAds), [_canServeAds]);

  return (
    <AppContext.Provider value={{
      isLoggedIn: isLoggedIn,
      setIsLoggedIn,
      theme: theme,
      changeTheme,
      isAutoTheme: isAutoTheme,
      setIsAutoTheme,
      canServeAds: canServeAds,
    }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </AppContext.Provider>
  );
}
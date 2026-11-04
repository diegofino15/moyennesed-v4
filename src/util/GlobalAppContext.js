import { createContext, useState, useContext } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';

import AnalyticsHandler from '../core/AnalyticsHandler';


// Context needed to switch from AppStack to AuthStack
export const GlobalAppContext = createContext({
  isLoggedIn: Boolean, setIsLoggedIn: Function,
  theme: MD3DarkTheme, changeTheme: Function,
  isAutoTheme: Boolean, setIsAutoTheme: Function,

  analyticsConsent: null, // null = not chosen, "granted", "denied"
  changeAnalyticsConsent: Function,
});
export const useGlobalAppContext = () => useContext(GlobalAppContext);

export function GlobalAppContextProvider({ loggedIn, autoTheme, savedTheme, _analyticsConsent, children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const [theme, changeTheme] = useState(savedTheme);
  const [isAutoTheme, setIsAutoTheme] = useState(autoTheme);

  // Analytics consent (null = not chosen yet)
  const [analyticsConsent, setAnalyticsConsent] = useState(_analyticsConsent ?? null);
  useEffect(() => setAnalyticsConsent(_analyticsConsent ?? null), [_analyticsConsent]);
  async function changeAnalyticsConsent(choice) {
    if (choice === "granted") { await AnalyticsHandler.grantConsent(); }
    else { await AnalyticsHandler.denyConsent(); }
    setAnalyticsConsent(choice);
  }

  return (
    <GlobalAppContext.Provider value={{
      isLoggedIn: isLoggedIn,
      setIsLoggedIn,
      theme: theme,
      changeTheme,
      isAutoTheme: isAutoTheme,
      setIsAutoTheme,

      analyticsConsent: analyticsConsent,
      changeAnalyticsConsent,
    }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </GlobalAppContext.Provider>
  );
}
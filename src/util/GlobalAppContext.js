import { createContext, useState, useContext } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';


// Context needed to switch from AppStack to AuthStack
export const GlobalAppContext = createContext({
  isLoggedIn: Boolean, setIsLoggedIn: Function,
  theme: MD3DarkTheme, changeTheme: Function,
  isAutoTheme: Boolean, setIsAutoTheme: Function,
});
export const useGlobalAppContext = () => useContext(GlobalAppContext);

export function GlobalAppContextProvider({ loggedIn, autoTheme, savedTheme, children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const [theme, changeTheme] = useState(savedTheme);
  const [isAutoTheme, setIsAutoTheme] = useState(autoTheme);

  return (
    <GlobalAppContext.Provider value={{
      isLoggedIn: isLoggedIn,
      setIsLoggedIn,
      theme: theme,
      changeTheme,
      isAutoTheme: isAutoTheme,
      setIsAutoTheme,
    }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </GlobalAppContext.Provider>
  );
}
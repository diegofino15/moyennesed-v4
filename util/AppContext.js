import { createContext, useState, useContext } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';


// Context needed to switch from AppStack to AuthStack
export const AppContext = createContext({
  isLoggedIn: Boolean,
  theme: MD3DarkTheme,
});
export const useAppContext = () => useContext(AppContext);

export function AppContextProvider({ loggedIn, autoTheme, savedTheme, children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const [theme, changeTheme] = useState(savedTheme);
  const [isAutoTheme, setIsAutoTheme] = useState(autoTheme);

  return (
    <AppContext.Provider value={{
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
    </AppContext.Provider>
  );
}
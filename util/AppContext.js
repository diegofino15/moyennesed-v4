import { createContext, useContext } from 'react';


// Context needed to switch from AppStack to AuthStack
const AppContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const useAppContext = () => useContext(AppContext);

export function AppContextProvider({ children, state }) {
  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
}
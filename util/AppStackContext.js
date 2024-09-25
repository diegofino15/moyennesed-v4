import { createContext, useState, useContext } from 'react';


// Context needed to update all the app's screens when needed
export const AppStackContext = createContext({
  globalDisplayUpdater: Number,
  updateGlobalDisplay: Function
});
export const useAppStackContext = () => useContext(AppStackContext);

export function AppStackContextProvider({ children }) {
  const [globalDisplayUpdater, _setGlobalDisplayUpdater] = useState(0);
  function updateGlobalDisplay() { _setGlobalDisplayUpdater(globalDisplayUpdater + 1); }

  return (
    <AppStackContext.Provider value={{
      globalDisplayUpdater,
      updateGlobalDisplay
    }}>
      {children}
    </AppStackContext.Provider>
  );
}
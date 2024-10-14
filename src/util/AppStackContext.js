import { createContext, useState, useContext, useEffect } from 'react';

import AccountHandler from '../core/AccountHandler';


// Context needed to update all the app's screens when needed
export const AppStackContext = createContext({
  isConnected: Boolean,
  isConnecting: Boolean,
  refreshLogin: Function,
  
  globalDisplayUpdater: Number,
  updateGlobalDisplay: Function
});
export const useAppStackContext = () => useContext(AppStackContext);

export function AppStackContextProvider({ children, needToRefresh, cameFromAuthStack }) {
  // Current login status
  const [isConnected, setIsConnected] = useState(cameFromAuthStack);
  const [isConnecting, setIsConnecting] = useState(false);
  useEffect(() => { if (!isConnected || needToRefresh) { refreshLogin(); } }, [needToRefresh]);
  async function refreshLogin() {
    console.log("Refreshing login...");
    
    setIsConnecting(true);
    setIsConnected(false);
    const successful = await AccountHandler.refreshLogin();
    setIsConnected(successful);
    setIsConnecting(false);
    return successful;
  }
  
  // To update the whole app when needed
  const [globalDisplayUpdater, _setGlobalDisplayUpdater] = useState(0);
  function updateGlobalDisplay() { _setGlobalDisplayUpdater(globalDisplayUpdater + 1); }

  return (
    <AppStackContext.Provider value={{
      isConnected,
      isConnecting,
      refreshLogin,

      globalDisplayUpdater,
      updateGlobalDisplay
    }}>
      {children}
    </AppStackContext.Provider>
  );
}
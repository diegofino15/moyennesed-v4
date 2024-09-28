import { createContext, useState, useContext, useEffect } from 'react';


// Context needed to update all the app's screens when needed
export const CurrentAccountContext = createContext({
  accountID: Number,
  setShowMarksAccount: Function,

  mainAccount: Map,
  updateMainAccount: Function,

  gotMarks: Boolean,
  isGettingMarks: Boolean,
  errorGettingMarks: Boolean,

  gotHomework: Boolean,
  isGettingHomework: Boolean,
  errorGettingHomework: Boolean,
});
export const useCurrentAccountContext = () => useContext(CurrentAccountContext);

export function CurrentAccountContextProvider({
  children,
  _accountID, setShowMarksAccount,
  mainAccount, updateMainAccount,
  _gotMarks, _isGettingMarks, _errorGettingMarks,
  _gotHomework, _isGettingHomework, _errorGettingHomework, getHomework,
  manualRefreshing, setManualRefreshing,
}) {
  // Which account is displayed
  const [accountID, setAccountID] = useState(_accountID);
  useEffect(() => { setAccountID(_accountID); }, [_accountID]);

  // Marks status
  const [gotMarks, _setGotMarks] = useState(_gotMarks);
  useEffect(() => { _setGotMarks(_gotMarks); }, [_gotMarks]);
  const [isGettingMarks, _setIsGettingMarks] = useState(_isGettingMarks);
  useEffect(() => { _setIsGettingMarks(_isGettingMarks); }, [_isGettingMarks]);
  const [errorGettingMarks, _setErrorGettingMarks] = useState(_errorGettingMarks);
  useEffect(() => { _setErrorGettingMarks(_errorGettingMarks); }, [_errorGettingMarks]);

  // Homework status
  const [gotHomework, _setGotHomework] = useState(_gotHomework);
  useEffect(() => { _setGotHomework(_gotHomework); }, [_gotHomework])
  const [isGettingHomework, _setIsGettingHomework] = useState(_isGettingHomework);
  useEffect(() => { _setIsGettingHomework(_isGettingHomework); }, [_isGettingHomework])
  const [errorGettingHomework, _setErrorGettingHomework] = useState(_errorGettingHomework);
  useEffect(() => { _setErrorGettingHomework(_errorGettingHomework); }, [_errorGettingHomework])

  return (
    <CurrentAccountContext.Provider value={{
      accountID, setShowMarksAccount, 
      mainAccount, updateMainAccount,
      gotMarks, isGettingMarks, errorGettingMarks,
      gotHomework, isGettingHomework, errorGettingHomework, getHomework,
      manualRefreshing, setManualRefreshing,
    }}>
      {children}
    </CurrentAccountContext.Provider>
  );
}
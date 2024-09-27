import { useEffect, useState } from 'react'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainStack from './main/MainStack';
import SettingsStack from './settings/SettingsStack';
import AppData from '../../core/AppData';
import { AppStackContextProvider } from '../../util/AppStackContext';


// Create stack for navigation
const Stack = createNativeStackNavigator();


// Stack shown when logged-in
function AppStack({ route, cameFromAuthStack }) {
  const { needToRefresh } = route.params;
  
  // Login status
  const [isConnected, setIsConnected] = useState(cameFromAuthStack);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-login
  useEffect(() => { if (!isConnected || needToRefresh) { refreshLogin(); } }, [needToRefresh]);
  async function refreshLogin() {
    console.log("Refreshing login...");
    
    setIsConnecting(true);
    setIsConnected(false);
    const successful = await AppData.refreshLogin();
    setIsConnected(successful);
    setIsConnecting(false);
    return successful;
  }

  return (
    <AppStackContextProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="MainStack"
          options={{ headerShown: false }}
        >
          {(props) => <MainStack
            {...props}
            refreshLogin={refreshLogin}
            isConnected={isConnected}
            isConnecting={isConnecting}
          />}
        </Stack.Screen>

        <Stack.Screen
          name="SettingsStack"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
          initialParams={{
            openCoefficientsPage: false,
          }}
        >
          {(props) => <SettingsStack
            {...props}
            refreshLogin={refreshLogin}
            isConnected={isConnected}
            isConnecting={isConnecting}
          />}
        </Stack.Screen>
      </Stack.Navigator>
    </AppStackContextProvider>
  );
}

export default AppStack;
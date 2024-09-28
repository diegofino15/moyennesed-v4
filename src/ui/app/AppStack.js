import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainStack from './main/MainStack';
import SettingsStack from './settings/SettingsStack';
import { AppStackContextProvider } from '../../util/AppStackContext';


// Create stack for navigation
const Stack = createNativeStackNavigator();


// Stack shown when logged-in
function AppStack({ route, cameFromAuthStack }) {
  const { needToRefresh } = route.params;
  
  return (
    <AppStackContextProvider
      needToRefresh={needToRefresh}
      cameFromAuthStack={cameFromAuthStack}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="MainStack"
          component={MainStack}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SettingsStack"
          component={SettingsStack}
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
          initialParams={{
            openCoefficientsPage: false,
          }}
        />
      </Stack.Navigator>
    </AppStackContextProvider>
  );
}

export default AppStack;
import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartPage from "./StartPage";
import LoginPage from "./LoginPage";
import ChooseAccountPage from './ChooseAccountPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Stack shown when not logged-in
function AuthStack({ setCameFromAuthStack }) {
  useEffect(() => { setCameFromAuthStack(true); }, []);
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StartPage"
        component={StartPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginPage"
        component={LoginPage}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />
      <Stack.Screen
        name="ChooseAccountPage"
        component={ChooseAccountPage}
        options={{
          presentation: 'containedModal',
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
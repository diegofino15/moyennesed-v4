import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartPage from "./StartPage";
import LoginPage from "./LoginPage";
import ChooseAccountPage from './ChooseAccountPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Stack shown when not logged-in
function AuthStack() {
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
        }}
      />
      <Stack.Screen
        name="ChooseAccountPage"
        component={ChooseAccountPage}
        options={{
          presentation: 'containedModal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
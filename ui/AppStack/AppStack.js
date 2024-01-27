import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainPage from './MainPage';
import ProfilePage from './ProfilePage';
import RankPage from './RankPage';


// Create stack for navigation
const Stack = createNativeStackNavigator();

// Stack shown when not logged-in
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainPage"
        component={MainPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RankPage"
        component={RankPage}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default AppStack;
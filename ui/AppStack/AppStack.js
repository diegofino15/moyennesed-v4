import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


function AppStack() {
  return (
    <View style={{
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
    }}>
      <Text style={DefaultTheme.fonts.titleMedium}>Logged in !</Text>
    </View>
  );
}

export default AppStack;
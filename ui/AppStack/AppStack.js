import { View, Text } from "react-native";


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
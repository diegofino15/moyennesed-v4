import { View } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Custom text area
function CustomTextArea({ children, style }) {
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 20,
      ...style,
    }}>
      {children}
    </View>
  );
}

export default CustomTextArea;
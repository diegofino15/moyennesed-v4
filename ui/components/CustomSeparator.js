import { View } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Custom separator
function CustomSeparator({ style }) {
  return (
    <View
      style={[{
        width: '100%',
        height: 3,
        backgroundColor: DefaultTheme.colors.surface,
        borderRadius: 3,
      }, style]}
    />
  );
}

export default CustomSeparator;
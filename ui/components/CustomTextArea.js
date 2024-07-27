import { View } from "react-native";

import { useAppContext } from "../../util/AppContext";


// Custom text area
function CustomTextArea({ children, style }) {
  const { theme } = useAppContext();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
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
import { View } from "react-native";

import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Custom text area
function CustomTextArea({ children, style }) {
  const { theme } = useGlobalAppContext();
  
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
import { View } from "react-native";

import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Custom separator
function CustomSeparator({ style }) {
  const { theme } = useGlobalAppContext();
  
  return (
    <View
      style={[{
        width: '100%',
        height: 3,
        backgroundColor: theme.colors.surface,
        borderRadius: 3,
      }, style]}
    />
  );
}

export default CustomSeparator;
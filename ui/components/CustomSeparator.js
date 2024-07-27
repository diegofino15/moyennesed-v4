import { View } from "react-native";

import { useAppContext } from "../../util/AppContext";


// Custom separator
function CustomSeparator({ style }) {
  const { theme } = useAppContext();
  
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
import { View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import { useAppContext } from "../../util/AppContext";


// Custom button
function CustomButton({ title, onPress, rightIcon, style }) {
  const { theme } = useAppContext();
  
  return (
    <PressableScale style={{
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: rightIcon ?'space-between' : 'center',
      ...style,
    }} onPress={onPress}>
      {rightIcon ? <View style={{ width: 30 }}/> : null}
      {title}
      {rightIcon ? rightIcon : null}
    </PressableScale>
  );
}

export default CustomButton;
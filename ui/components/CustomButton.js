import { View } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Custom button
function CustomButton({ title, onPress, rightIcon, style }) {
  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.primary,
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
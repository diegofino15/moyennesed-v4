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
      justifyContent: 'space-between',
      ...style,
    }} onPress={onPress}>
      <View style={{ width: 30 }}/>
      {title}
      {rightIcon ? rightIcon : <View style={{ width: 30 }}/>}
    </PressableScale>
  );
}

export default CustomButton;
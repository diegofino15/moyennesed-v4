import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Custom button
function CustomButton({ title, onPress, style }) {
  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.primary,
      borderRadius: 20,
      padding: 15,
      alignItems: 'center',
      ...style,
    }} onPress={onPress}>
      {title}
    </PressableScale>
  );
}

export default CustomButton;
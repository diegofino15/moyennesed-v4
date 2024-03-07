import { Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Custom tag (used on mark cards)
function CustomTag({ icon, title, color, onPress, onBottom=false }) {
  return (
    <PressableScale onPress={onPress} style={{
      position: 'absolute',
      right: 10,
      top: !onBottom ? -10 : undefined,
      bottom: onBottom ? -10 : undefined,
      paddingHorizontal: 10,
      paddingVertical: 3,
      backgroundColor: color,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      {icon}
      <Text style={[DefaultTheme.fonts.labelMedium, { color: 'white' }]}>{title}</Text>
    </PressableScale>
  );
}

export default CustomTag;
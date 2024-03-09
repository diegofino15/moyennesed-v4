import { Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Custom tag (used on mark cards)
function CustomTag({ icon, title, color, onPress, onBottom=false, offset=10, shadow=false }) {
  return (
    <PressableScale onPress={onPress} style={{
      position: 'absolute',
      right: 10,
      top: !onBottom ? -offset : undefined,
      bottom: onBottom ? -offset : undefined,
      paddingHorizontal: 10,
      paddingVertical: 3,
      backgroundColor: color,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: shadow ? 0.5 : 0,
    }}>
      {icon}
      <Text style={[DefaultTheme.fonts.labelMedium, {
        color: 'white',
        marginLeft: icon ? 5 : 0,
      }]}>{title}</Text>
    </PressableScale>
  );
}

export default CustomTag;
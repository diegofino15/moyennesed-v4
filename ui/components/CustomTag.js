import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Custom tag (used on mark cards)
function CustomTag({ icon, title, color, onPress, secondaryTag, onBottom=false, offset=10, shadow=false }) {
  return (
    <View style={{
      position: 'absolute',
      right: 10,
      top: !onBottom ? -offset : undefined,
      bottom: onBottom ? -offset : undefined,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      {secondaryTag && (
        <PressableScale style={{
          paddingHorizontal: 10,
          paddingVertical: 3,
          marginRight: 5,
          backgroundColor: color,
          borderRadius: 5,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: shadow ? 0.5 : 0,
        }}>
          {secondaryTag}
        </PressableScale>
      )}

      <PressableScale onPress={onPress} style={{
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
    </View>
  );
}

export default CustomTag;
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import { useAppContext } from "../../util/AppContext";


// Custom tag (used on mark cards)
function CustomTag({ icon, title, color, onPress, secondaryTag, secondaryTagOnPress, secondaryTagStyle, textStyle, onBottom=false, onLeft=false, offset=10, shadow=false, style }) {
  const { theme } = useAppContext();
  
  return (
    <View style={{
      position: 'absolute',
      right: onLeft ? undefined : 10,
      left: onLeft ? 10 : undefined,
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
          ...secondaryTagStyle,
        }} onPress={secondaryTagOnPress}>
          {secondaryTag}
        </PressableScale>
      )}

      <PressableScale onPress={onPress} style={{
        paddingHorizontal: 5,
        paddingVertical: 2,
        backgroundColor: color,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: shadow ? 0.5 : 0,
        ...style,
      }}>
        {icon}
        <Text style={[theme.fonts.labelMedium, {
          color: 'white',
          marginLeft: icon ? 5 : 0,
          height: 22,
          ...textStyle,
        }]}>{title}</Text>
      </PressableScale>
    </View>
  );
}

export default CustomTag;
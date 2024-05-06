import { View, Text, Platform } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";


// Custom simple section button
function CustomSimpleSectionButton({ title, icon, onPress, style, textStyle }) {
  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: DefaultTheme.colors.surfaceOutline,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style,
    }} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text style={[DefaultTheme.fonts.bodyLarge, { marginLeft: 10, top: Platform.select({ android: 2 }), ...textStyle }]}>{title}</Text>
      </View>
      <ArrowRightIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
    </PressableScale>
  );
}

export default CustomSimpleSectionButton;
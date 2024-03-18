import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon } from "lucide-react-native";


// Custom information card
function CustomInformationCard({
  title,
  icon,
  description,
  onPress,
  error=false,
  style,
}) {
  return (
    <PressableScale onPress={onPress} activeScale={onPress ? 0.95 : 1} style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: error ? DefaultTheme.colors.error : DefaultTheme.colors.surfaceOutline,
      padding: 10,
      width: '100%',
      flexDirection: 'column',
      ...style,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon}
          <Text style={[DefaultTheme.fonts.bodyMedium, { marginLeft: 10, height: 22 }]}>{title}</Text>
        </View>
        {onPress && <ArrowRightIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
      </View>
      <Text style={[DefaultTheme.fonts.labelMedium, { marginTop: 5 }]}>{description}</Text>
    </PressableScale>
  );
}

export default CustomInformationCard;
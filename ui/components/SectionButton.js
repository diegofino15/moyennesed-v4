import { ChevronRightIcon } from "lucide-react-native";
import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Section button
function SectionButton({
  icon,
  title,
  description,
  onPress,
  style,
}) {
  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      ...style,
    }} onPress={onPress}>
      {icon}
      <View style={{
        flexDirection: 'column',
        marginLeft: 10,
      }}>
        <Text style={[DefaultTheme.fonts.titleSmall, { width: Dimensions.get('window').width - 160 }]} numberOfLines={1}>{title}</Text>
        <Text style={DefaultTheme.fonts.labelMedium}>{description}</Text>
      </View>
      <ChevronRightIcon size={30} color={DefaultTheme.colors.onSurfaceDisabled} style={{
        position: 'absolute',
        right: 10,
      }}/>
    </PressableScale>
  );
}

export default SectionButton;
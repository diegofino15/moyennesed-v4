import { ArrowRightIcon } from "lucide-react-native";
import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Custom section button
function CustomSectionButton({
  icon,
  title,
  description,
  onPress,
  endIcon,
  wrapperStyle,
  style,
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      ...wrapperStyle,
    }}>
      {icon}
      <PressableScale style={{
        backgroundColor: DefaultTheme.colors.surface,
        borderWidth: 2,
        borderColor: DefaultTheme.colors.surfaceOutline,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: Dimensions.get('window').width - (icon ? 120 : 40),
        height: 70,
        marginLeft: icon ? 10 : 0,
        ...style,
      }} onPress={onPress}>
        <View style={{
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          width: Dimensions.get('window').width - (icon ? 190 : 110),
        }}>
          <Text style={DefaultTheme.fonts.titleSmall} numberOfLines={1}>{title}</Text>
          <Text style={DefaultTheme.fonts.labelMedium} numberOfLines={1}>{description}</Text>
        </View>
        {endIcon ? endIcon : <ArrowRightIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled} style={{
          position: 'absolute',
          right: 20,
        }}/>}
      </PressableScale>
    </View>
  );
}

export default CustomSectionButton;
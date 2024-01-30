import { ChevronRightIcon } from "lucide-react-native";
import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";


// Section button
function SectionButton({
  icon,
  showBigIcon=false,
  title,
  description,
  onPress,
  warning=false,
  style,
  textAreaStyle,
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      ...style,
    }}>
      {showBigIcon && icon}
      <PressableScale style={{
        backgroundColor: DefaultTheme.colors.surface,
        borderWidth: 2,
        borderColor: warning ? DefaultTheme.colors.error : DefaultTheme.colors.surfaceOutline,
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: showBigIcon ? 10 : 0,
        width: Dimensions.get('window').width - ((showBigIcon && icon) ? 120 : 40),
        height: 70,
        ...textAreaStyle,
      }} onPress={onPress}>
        {showBigIcon ? null : icon}
        <View style={{
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          height: '100%',
          marginLeft: (showBigIcon && icon) ? 0 : icon ? 10 : 0,
          paddingRight: 20,
        }}>
          <Text style={DefaultTheme.fonts.titleSmall} numberOfLines={1}>{title}</Text>
          <Text style={DefaultTheme.fonts.labelMedium} numberOfLines={1}>{description}</Text>
        </View>
        <ChevronRightIcon size={30} color={DefaultTheme.colors.onSurfaceDisabled} style={{
          position: 'absolute',
          right: 10,
        }}/>
      </PressableScale>
    </View>
  );
}

export default SectionButton;
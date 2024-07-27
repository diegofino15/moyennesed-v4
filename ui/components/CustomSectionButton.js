import { ArrowRightIcon } from "lucide-react-native";
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import { useAppContext } from "../../util/AppContext";


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
  const { theme } = useAppContext();
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      ...wrapperStyle,
    }}>
      {icon}
      <PressableScale style={{
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.surfaceOutline,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        marginLeft: icon ? 10 : 0,
        ...style,
      }} onPress={onPress}>
        <View style={{
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          width: '100%',
          marginRight: icon ? -70 : 0,
        }}>
          <Text style={[theme.fonts.titleSmall, { height: 30 }]} numberOfLines={1}>{title}</Text>
          <Text style={[theme.fonts.labelMedium, { height: 22 }]} numberOfLines={1}>{description}</Text>
        </View>
        {endIcon ? endIcon : <ArrowRightIcon size={25} color={theme.colors.onSurfaceDisabled} style={{
          position: 'absolute',
          right: 20,
        }}/>}
      </PressableScale>
    </View>
  );
}

export default CustomSectionButton;
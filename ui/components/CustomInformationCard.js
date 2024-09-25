import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowRightIcon } from "lucide-react-native";

import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Custom information card
function CustomInformationCard({
  title,
  icon,
  description,
  onPress,
  error=false,
  style,
}) {
  const { theme } = useGlobalAppContext();
  
  return (
    <PressableScale onPress={onPress} activeScale={onPress ? 0.95 : 1} style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: error ? theme.colors.error : theme.colors.surfaceOutline,
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
          <Text style={[theme.fonts.bodyMedium, {
            marginLeft: 10,
          }]}>{title}</Text>
        </View>
        {onPress && <ArrowRightIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
      </View>
      <Text style={[theme.fonts.labelMedium, { marginTop: 5 }]}>{description}</Text>
    </PressableScale>
  );
}

export default CustomInformationCard;
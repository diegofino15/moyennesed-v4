import { Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { LinkIcon, ArrowBigRightDashIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";

import { openLink } from "../../util/Utils";


// Custom link
function CustomLink({ title, link, onPress, icon, style }) {
  return (
    <PressableScale style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style,
    }} onPress={() => onPress ? onPress() : openLink(link)}>
      {icon ? icon : <LinkIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
      <Text style={[DefaultTheme.fonts.bodyLarge, { marginLeft: 10 }]}>{title}</Text>
      <ArrowBigRightDashIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
    </PressableScale>
  );
}

export default CustomLink;
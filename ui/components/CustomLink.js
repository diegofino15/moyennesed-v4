import { Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { LinkIcon, ArrowBigRightDashIcon } from "lucide-react-native";

import { openLink } from "../../util/Utils";
import { useAppContext } from "../../util/AppContext";


// Custom link
function CustomLink({ title, icon, link, linkIcon, onPress, style }) {
  const { theme } = useAppContext();
  
  return (
    <PressableScale style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style,
    }} onPress={() => onPress ? onPress() : openLink(link)}>
      {icon ? icon : <LinkIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
      <Text style={[theme.fonts.bodyLarge, { marginLeft: 10 }]}>{title}</Text>
      {linkIcon ? linkIcon : <ArrowBigRightDashIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
    </PressableScale>
  );
}

export default CustomLink;
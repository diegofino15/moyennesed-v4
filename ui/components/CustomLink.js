import { Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { LinkIcon, ArrowRightIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";

import { openLink } from "../utils";


// Custom link
function CustomLink() {
  return (
    <PressableScale style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
    }} onPress={() => openLink(link)}>
      <LinkIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
      <Text style={[DefaultTheme.fonts.bodyMedium, { marginLeft: 10 }]}>{linkTitle}</Text>
      <ArrowRightIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
    </PressableScale>
  );
}

export default CustomLink;
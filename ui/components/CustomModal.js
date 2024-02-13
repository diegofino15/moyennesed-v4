import { View, ScrollView, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { ChevronLeftIcon } from "lucide-react-native";

import { OSvalue } from "../../util/Utils";


// Custom modal
function CustomModal({
  title,
  goBackFunction,
  children,
  style,
  showScrollView=true,
}) {
  return (
    <View style={{
      backgroundColor: title ? DefaultTheme.colors.surface : DefaultTheme.colors.backdrop,
    }}>
      <View style={{
        marginTop: OSvalue({ iosValue: 0, androidValue: 20 }),
      }}>
        {/* Header */}
        {title && <View style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderBottomWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          padding: 10,
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{ height: 45 }}/>
          <Text style={[DefaultTheme.fonts.titleSmall, { height: 30 }]}>{title}</Text>
        </View>}

        {/* Main view */}
        {showScrollView ? (
          <ScrollView style={{
            backgroundColor: DefaultTheme.colors.backdrop,
            width: '100%',
            height: '100%',
            padding: 20,
            ...style,
          }} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : {...children}}

        {/* Back button */}
        {goBackFunction && <PressableScale style={{
          position: 'absolute',
          left: 12,
          top: 12,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          backgroundColor: DefaultTheme.colors.surface,
          padding: 5,
          borderRadius: 10,
        }} onPress={goBackFunction}>
          <ChevronLeftIcon size={30} color={DefaultTheme.colors.onSurface}/>
        </PressableScale>}
      </View>
    </View>
  );
}

export default CustomModal;
import { View, ScrollView, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { ChevronLeftIcon } from "lucide-react-native";


// Custom modal
function CustomModal({
  title,
  goBackFunction,
  children,
  style,
}) {
  return (
    <View>
      {/* Header */}
      {title && <View style={{
        backgroundColor: DefaultTheme.colors.surface,
        borderBottomWidth: 2,
        borderColor: DefaultTheme.colors.surfaceOutline,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{ height: 45 }}/>
        <Text style={DefaultTheme.fonts.titleSmall}>{title}</Text>
      </View>}

      {/* Main view */}
      <ScrollView style={{
        backgroundColor: DefaultTheme.colors.backdrop,
        width: '100%',
        height: '100%',
        padding: 20,
        ...style,
      }}>
        {children}
      </ScrollView>

      {/* Back button */}
      <PressableScale style={{
        position: 'absolute',
        left: 10,
        top: 10,
        borderWidth: 2,
        borderColor: DefaultTheme.colors.surfaceOutline,
        backgroundColor: DefaultTheme.colors.surface,
        padding: 5,
        borderRadius: 10,
      }} onPress={goBackFunction}>
        <ChevronLeftIcon size={30} color={DefaultTheme.colors.onPrimary}/>
      </PressableScale>
    </View>
  );
}

export default CustomModal;
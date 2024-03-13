import { View, ScrollView, Text, Platform, Dimensions } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { ChevronLeftIcon } from "lucide-react-native";
import Constants from "expo-constants";


// Custom modal
function CustomModal({
  title,
  titleObject,
  goBackFunction,
  children,
  childrenOutsideScrollView,
  style,
  titleStyle,
  headerStyle,
  goBackButtonStyle,
  rightIcon,
  rightIconOnPress,
  rightIconStyle,
  onlyShowBackButtonOnAndroid=false,
  isBackButtonInScrollView=false,
  showScrollView=true,
  extraHeight=0,
}) {
  return (
    <View style={{
      backgroundColor: title ? DefaultTheme.colors.surface : DefaultTheme.colors.backdrop,
      ...headerStyle,
    }}>
      <View style={{
        marginTop: Platform.select({ ios: 0, android: 20 }),
      }}>
        {/* Header */}
        {(title || titleObject) && <View style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderBottomWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          padding: 10,
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          // height: 70,
          ...headerStyle,
        }}>
          <View style={{ height: 45 }}/>
          {titleObject ? titleObject : <Text style={[DefaultTheme.fonts.titleSmall, { height: 30, ...titleStyle }]}>{title}</Text>}
        </View>}

        {/* Main view */}
        {showScrollView ? (
          <ScrollView style={{
            backgroundColor: DefaultTheme.colors.backdrop,
            width: '100%',
            height: Dimensions.get('window').height - Constants.statusBarHeight - (title || titleObject ? 70 : 0),
            padding: 20,
            ...style,
          }} showsVerticalScrollIndicator={false}>
            {children}
            <View style={{ height: 50 }}/> 
          </ScrollView>
        ) : {...children}}
        {childrenOutsideScrollView}

        {/* Back button */}
        {goBackFunction && !isBackButtonInScrollView && (Platform.OS == "android" || !onlyShowBackButtonOnAndroid) && <PressableScale style={{
          position: 'absolute',
          left: 12,
          top: 12,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          backgroundColor: DefaultTheme.colors.surface,
          padding: 5,
          borderRadius: 10,
          ...goBackButtonStyle,
        }} onPress={goBackFunction}>
          <ChevronLeftIcon size={30} color={DefaultTheme.colors.onSurface}/>
        </PressableScale>}

        {/* Right icon */}
        {rightIcon && <PressableScale style={{
          position: 'absolute',
          right: 12,
          top: 12,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          backgroundColor: DefaultTheme.colors.surface,
          padding: 5,
          borderRadius: 10,
          ...rightIconStyle,
        }} onPress={rightIconOnPress}>
          {rightIcon}
        </PressableScale>}
      </View>
    </View>
  );
}

export default CustomModal;
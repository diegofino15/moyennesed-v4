import { View, ScrollView, Text, Platform, Dimensions } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { ChevronLeftIcon } from "lucide-react-native";
import Constants from "expo-constants";
import { BlurView } from "expo-blur";


// Custom modal
function CustomModal({
  title,
  titleObject,
  goBackFunction,
  children,
  childrenOutsideScrollView,
  style,
  horizontalPadding=20,
  titleStyle,
  headerStyle,
  goBackButtonStyle,
  rightIcon,
  rightIconOnPress,
  rightIconStyle,
  onlyShowBackButtonOnAndroid=false,
  isBackButtonInScrollView=false,
  showScrollView=true,
}) {
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.backdrop,
      height: '100%',
      overflow: 'hidden',
    }}>
      <View style={{
        marginTop: Platform.select({ ios: 0, android: Constants.statusBarHeight }),
        backgroundColor: DefaultTheme.colors.backdrop,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        ...headerStyle,
      }}>
        {/* Header */}
        {(title || titleObject) && <BlurView style={{
          borderBottomWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          padding: 10,
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          overflow: 'hidden',
          ...(Platform.select({ ios: {}, android: headerStyle }))
        }} tint="light" intensity={Platform.select({ ios: 50, android: 0 })}>
          <View style={{ height: 45 }}/>
          {titleObject ? titleObject : <Text style={[DefaultTheme.fonts.titleSmall, { height: 30, ...titleStyle }]}>{title}</Text>}
        </BlurView>}

        {/* Main view */}
        {showScrollView ? (
          <ScrollView style={{
            backgroundColor: DefaultTheme.colors.backdrop,
            width: '100%',
            height: Dimensions.get('window').height - Constants.statusBarHeight - (title || titleObject ? 70 : 0),
            paddingVertical: 20,
            overflow: Platform.select({ ios: 'visible', android: 'hidden' }),
            zIndex: 0,
            ...style,
          }} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: horizontalPadding, backgroundColor: DefaultTheme.colors.backdrop }}>
              {children}
            </View>
            <View style={{ height: 100 }}/> 
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
          zIndex: 1,
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
          zIndex: 1,
          ...rightIconStyle,
        }} onPress={rightIconOnPress}>
          {rightIcon}
        </PressableScale>}
      </View>
    </View>
  );
}

export default CustomModal;
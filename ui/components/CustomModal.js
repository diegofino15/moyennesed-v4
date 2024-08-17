import { useState } from "react";
import { View, ScrollView, Text, Platform, Dimensions } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { ChevronLeftIcon } from "lucide-react-native";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";

import { useAppContext } from "../../util/AppContext";


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
  setWidth=()=>{},
  setHeight=()=>{},
}) {
  const { theme } = useAppContext();
  
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const onLayout = (event) => {
    const layoutWidth = event.nativeEvent.layout.width;
    const changingWidthCheck = !Platform.isPad || layoutWidth != Dimensions.get('window').width;
    if (layoutWidth > 0 && layoutWidth != windowWidth && changingWidthCheck) {
      setWindowWidth(layoutWidth);
      setWidth(layoutWidth);
    }

    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && layoutHeight != windowHeight && layoutHeight != Dimensions.get('window').height) {
      setWindowHeight(layoutHeight);
      setHeight(layoutHeight);
    }
  }

  return (
    <View style={{
      backgroundColor: theme.colors.backdrop,
      height: '100%',
      overflow: 'hidden',
    }} onLayout={onLayout}>
      <View style={{
        marginTop: Platform.select({ ios: 0, android: Constants.statusBarHeight }),
        backgroundColor: theme.colors.backdrop,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}>
        {/* Header space */}
        {(title || titleObject) && <View style={{
          borderBottomWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          height: 67,
          ...headerStyle,
        }}/>}

        {/* Main view */}
        {showScrollView ? (
          <ScrollView style={{
            backgroundColor: theme.colors.backdrop,
            width: '100%',
            height: windowHeight - (title || titleObject ? 70 : 0),
            paddingVertical: 20,
            overflow: Platform.select({ ios: 'visible', android: 'hidden' }),
            zIndex: 0,
            ...style,
          }} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: horizontalPadding, backgroundColor: theme.colors.backdrop }}>
              {children}
            </View>
            <View style={{ height: Platform.isPad ? 0 : 50 }}/> 
          </ScrollView>
        ) : {...children}}
        {childrenOutsideScrollView}

        {/* Blurred header (here because it doesn't update on older iPhones if put higher) */}
        {(title || titleObject) && (
          <View style={{
            position: 'absolute',
            width: '100%',
          }}>
          <View style={{
            position: 'absolute',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            width: '100%',
            height: 67,
            opacity: 0.2,
            ...headerStyle,
          }}/>
          <BlurView style={{
            padding: 10,
            paddingTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            overflow: 'hidden',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            ...(Platform.select({ ios: {}, android: headerStyle }))
          }} tint="light" intensity={Platform.select({ ios: 50, android: 0 })}>
            <View style={{ height: 45 }}/>
            {titleObject ? titleObject : <Text style={[theme.fonts.titleSmall, { height: 30, ...titleStyle }]}>{title}</Text>}
          </BlurView>
          </View>
        )}

        {/* Back button */}
        {goBackFunction && !isBackButtonInScrollView && (Platform.OS == "android" || !onlyShowBackButtonOnAndroid) && <PressableScale style={{
          position: 'absolute',
          left: 12,
          top: 12,
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          backgroundColor: theme.colors.surface,
          padding: 5,
          borderRadius: 10,
          zIndex: 1,
          ...goBackButtonStyle,
        }} onPress={goBackFunction}>
          <ChevronLeftIcon size={30} color={theme.colors.onSurface}/>
        </PressableScale>}

        {/* Right icon */}
        {rightIcon && <PressableScale style={{
          position: 'absolute',
          right: 12,
          top: 12,
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          backgroundColor: theme.colors.surface,
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
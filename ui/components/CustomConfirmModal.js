import { useEffect, useRef } from "react";
import { Modal, StyleSheet, Pressable, Animated, SafeAreaView, Dimensions, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { XIcon } from "lucide-react-native";

import CustomSection from "./CustomSection";


// Animated card
function AnimatedCard({ visible, delay, child, style, reverse=false }) {
  let animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      animation.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        delay: delay,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View style={{
      opacity: animation,
      transform: [{
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [reverse ? -50 : 50, 0]
        })
      }, {
        scaleX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1]
        })
      }, {
        scaleY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1]
        })
      }],
      ...style,
    }}>
      {child}
    </Animated.View>
  );
}


// Custom confirm modal
function CustomConfirmModal({
  visible,
  exitModal,
  children,
  specialTip,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <StatusBar hidden animated/>

      <BlurView intensity={Platform.select({ ios: 50, android: 100 })} tint="dark" style={[
        StyleSheet.absoluteFill,
        { justifyContent: 'flex-end' },
      ]}>
        <Pressable onPress={exitModal} style={StyleSheet.absoluteFill}/>

        <SafeAreaView style={{
          marginHorizontal: 20,
          marginBottom: useSafeAreaInsets().bottom + 20,
        }}>
          {specialTip && (
            <AnimatedCard
              key={-2}
              visible={visible}
              delay={0}
              child={(
                <View>
                  <CustomSection title={"Astuce"} textAreaStyle={{
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: DefaultTheme.colors.surfaceOutline,
                    backgroundColor: DefaultTheme.colors.surface,
                    top: -1,
                    height: 'auto',
                  }} marginTop={0}/>
                  {specialTip}
                </View>
              )}
              style={{
                position: 'absolute',
                bottom: Dimensions.get('window').height - 250,
                width: '100%',
              }}
              reverse
            />
          )}
          <AnimatedCard
            key={-1}
            visible={visible}
            delay={0}
            child={(
              <PressableScale key={1} style={{
                borderWidth: 2,
                borderColor: DefaultTheme.colors.surfaceOutline,
                backgroundColor: DefaultTheme.colors.surface,
                borderRadius: 10,
                padding: 5,
                width: 35,
                height: 35,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 5,
                left: Dimensions.get('window').width - 75,
              }} onPress={exitModal}>
                <XIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
              </PressableScale>
            )}
          />
          {children.map((child, index) => (
            <AnimatedCard
              key={index}
              visible={visible}
              delay={(index + 1) * 50}
              child={child}
            />
          ))}
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

export default CustomConfirmModal;
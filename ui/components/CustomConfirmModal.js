import { useEffect, useRef } from "react";
import { Modal, StyleSheet, Pressable, Animated, SafeAreaView, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { XIcon } from "lucide-react-native";

import { OSvalue } from "../../util/Utils";


// Animated card
function AnimatedCard({ visible, delay, children }) {
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
          outputRange: [50, 0]
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
    }}>
      {children}
    </Animated.View>
  );
}


// Confirm modal
function CustomConfirmModal({
  visible,
  exitModal,
  children,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <StatusBar hidden animated/>

      <BlurView intensity={OSvalue({ iosValue: 50, androidValue: 100 })} tint="dark" style={[
        StyleSheet.absoluteFill,
        { justifyContent: 'flex-end' },
      ]}>
        <Pressable onPress={exitModal} style={StyleSheet.absoluteFill}/>

        <SafeAreaView style={{
          marginHorizontal: 20,
          marginBottom: useSafeAreaInsets().bottom + 20,
        }}>
          <AnimatedCard
            key={-1}
            visible={visible}
            delay={0}
            children={(
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
              children={child}
            />
          ))}
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

export default CustomConfirmModal;
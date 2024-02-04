import { useEffect, useRef } from "react";
import { Modal, StyleSheet, Pressable, Animated, SafeAreaView } from "react-native";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";


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

      <BlurView intensity={50} tint="dark" style={[
        StyleSheet.absoluteFill,
        { justifyContent: 'flex-end' },
      ]}>
        <Pressable onPress={exitModal} style={StyleSheet.absoluteFill}/>

        <SafeAreaView style={{
          marginHorizontal: 20,
          marginBottom: useSafeAreaInsets().bottom + 20,
        }}>
          {children.map((child, index) => (
            <AnimatedCard
              key={index}
              visible={visible}
              delay={index * 50}
              children={child}
            />
          ))}
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

export default CustomConfirmModal;
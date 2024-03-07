import { useState, useEffect } from "react";
import { Animated } from "react-native";


// Custom Animated indicator
function CustomAnimatedIndicator({ child, value, startX=0, endX=0, startY=0, endY=0, style }) {
  const [anim, _] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <Animated.View style={{
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [startX, endX],
          }),
        },
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [startY, endY],
          }),
        },
        {
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
      ],
      ...style,
    }}>
      {child}
    </Animated.View>
  );
}

export default CustomAnimatedIndicator;
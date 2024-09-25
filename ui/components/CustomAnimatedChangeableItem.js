import { useEffect, useState } from "react";
import { Animated } from "react-native";
import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Custom changing item
function CustomAnimatedChangeableItem({ item, animationTime, updaters=[] }) {
  const { theme } = useGlobalAppContext();
  
  const [shownItem, setShownItem] = useState(item);
  useEffect(() => { changeShownItem(); }, [...updaters, theme.dark]);

  // Animation
  const [animation, _] = useState(new Animated.Value(1));
  function changeShownItem() {
    if (item === shownItem) { return; }
    
    Animated.timing(animation, {
      toValue: 0,
      duration: animationTime,
      useNativeDriver: true,
    }).start(() => {
      setShownItem(item);
      Animated.timing(animation, {
        toValue: 1,
        duration: animationTime,
        useNativeDriver: true,
      }).start();
    });
  }

  return (
    <Animated.View style={{
      opacity: animation,
      transform: [
        { scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
      ],
    }}>{shownItem}</Animated.View>
  );
}

export default CustomAnimatedChangeableItem;
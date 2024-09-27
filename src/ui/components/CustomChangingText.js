import { useEffect } from "react";
import useState from "react-usestateref";
import { Animated } from "react-native";


// Custom changing text
function CustomChangingText({
  text,
  changeTextContent,
  refreshRate,
  animationTime,
  style,
  nof=1,
}) {
  // Text opacity
  const [textOpacity, _, textOpacityRef] = useState(new Animated.Value(1));

  // Change by refresh rate
  useEffect(() => { setTimeout(alternate, refreshRate); }, []);
  async function alternate() {
    await changeTextContent();
    setTimeout(alternate, refreshRate);
  }

  // Animate
  const [textValue, setTextValue] = useState(text);
  useEffect(() => {
    if (text === textValue) { return; }
    Animated.timing(textOpacityRef.current, {
      toValue: 0,
      duration: animationTime,
      useNativeDriver: true,
    }).start(() => {
      setTextValue(text);
      Animated.timing(textOpacityRef.current, {
        toValue: 1,
        duration: animationTime,
        useNativeDriver: true,
      }).start();
    });
  }, [text]);

  return (
    <Animated.Text style={{ opacity: textOpacity, ...style }} numberOfLines={nof}>{textValue}</Animated.Text>
  );
}

export default CustomChangingText;
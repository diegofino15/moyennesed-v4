import { View, Text, TextInput } from "react-native";

import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Custom big text input
function CustomBigTextInput({ title, placeholder, value, setValue, windowWidth, controller, maxLength, height, style, textStyle }) {
  const { theme } = useGlobalAppContext();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.surfaceOutline,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      ...style,
    }}>
      <Text style={theme.fonts.labelLarge}>{title}</Text>
      <TextInput
        style={{
          ...theme.fonts.bodyLarge,
          color: theme.colors.onSurface,
          width: windowWidth - 80,
          height: height,
          ...textStyle,
        }}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        placeholderTextColor={theme.colors.onSurfaceDisabled}
        ref={controller}
        maxLength={maxLength}
        multiline
      />
    </View>
  );
}

export default CustomBigTextInput;
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Settings section
function CustomSection({ title, rightIcon, marginTop=20, textAreaStyle={}, textStyle={}, lineStyle={}, viewStyle={} }) {
  return (
    <View style={{
      marginTop: marginTop,
      marginBottom: 10,
      height: 20,
      ...viewStyle,
    }}>
      <View style={{
        top: 10,
        width: '100%',
        height: 2,
        borderRadius: 1,
        backgroundColor: DefaultTheme.colors.surfaceOutline,
        ...lineStyle,
      }}/>
      <View style={{
        position: 'absolute',
        alignSelf: "center",
        backgroundColor: DefaultTheme.colors.backdrop,
        height: 20,
        paddingHorizontal: 10,
        ...textAreaStyle,
      }}>
        <Text style={[DefaultTheme.fonts.labelMedium, textStyle]}>{title}</Text>
      </View>
      {rightIcon && (
        <View style={{
          position: 'absolute',
          right: 0,
          backgroundColor: DefaultTheme.colors.backdrop,
          paddingLeft: 10,
        }}>
          {rightIcon}
        </View>
      )}
    </View>
  );
}

export default CustomSection;
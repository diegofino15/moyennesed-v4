import { View, Text } from "react-native";

import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Settings section
function CustomSection({ title, titleObj, rightIcon, marginTop=20, textAreaStyle={}, textStyle={}, lineStyle={}, viewStyle={} }) {
  const { theme } = useGlobalAppContext();
  
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
        backgroundColor: theme.colors.surfaceOutline,
        ...lineStyle,
      }}/>
      <View style={{
        position: 'absolute',
        alignSelf: "center",
        backgroundColor: theme.colors.backdrop,
        height: 20,
        paddingHorizontal: 10,
        ...textAreaStyle,
      }}>
        {titleObj ? titleObj : <Text style={[theme.fonts.labelMedium, textStyle]}>{title}</Text>}
      </View>
      {rightIcon && (
        <View style={{
          position: 'absolute',
          right: 0,
          backgroundColor: theme.colors.backdrop,
          paddingLeft: 10,
        }}>
          {rightIcon}
        </View>
      )}
    </View>
  );
}

export default CustomSection;
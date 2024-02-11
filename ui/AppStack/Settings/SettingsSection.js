import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Settings section
function SettingsSection({ title, marginTop=20 }) {
  return (
    <View style={{
      marginTop: marginTop,
      marginBottom: 10,
      height: 20,
    }}>
      <View style={{
        top: 10,
        width: '100%',
        height: 2,
        borderRadius: 1,
        backgroundColor: DefaultTheme.colors.surfaceOutline,
      }}/>
      <View style={{
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: DefaultTheme.colors.backdrop,
        height: 20,
        paddingHorizontal: 10,
      }}>
        <Text style={DefaultTheme.fonts.labelMedium}>{title}</Text>
      </View>
    </View>
  );
}

export default SettingsSection;
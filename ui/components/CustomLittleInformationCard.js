import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Custom little information card
function CustomLittleInformationCard({ icon, content, style }) {
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      ...style,
    }}>
      {icon}
      <Text style={DefaultTheme.fonts.bodyLarge}>{content}</Text>
    </View>
  );
}

export default CustomLittleInformationCard;
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Custom little information card
function CustomSimpleInformationCard({ icon, content, style }) {
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      ...style,
    }}>
      {icon}
      <Text style={[DefaultTheme.fonts.bodyLarge, { height: 25, marginLeft: 10 }]}>{content}</Text>
    </View>
  );
}

export default CustomSimpleInformationCard;
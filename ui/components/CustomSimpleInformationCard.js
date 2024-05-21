import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Custom little information card
function CustomSimpleInformationCard({ icon, rightIcon, content, style, textStyle, nof, subtitle=null }) {
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 10,
      padding: 10,
      overflow: 'hidden',
      ...style,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {icon}
          <Text style={[DefaultTheme.fonts.bodyLarge, { marginLeft: 10, ...textStyle }]} numberOfLines={nof}>{content}</Text>
        </View>
        {rightIcon}
      </View>
      {subtitle ? (
        <Text style={[DefaultTheme.fonts.labelMedium, { marginTop: 5, textAlign: 'justify' }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export default CustomSimpleInformationCard;
import { View, Text } from "react-native";

import { useAppContext } from "../../util/AppContext";


// Custom little information card
function CustomSimpleInformationCard({ icon, rightIcon, content, style, textStyle, nof, subtitle=null, additionalObject }) {
  const { theme } = useAppContext();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
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
          <Text style={[theme.fonts.bodyLarge, {
            marginLeft: 10,
            ...textStyle,
          }]} numberOfLines={nof}>{content}</Text>
        </View>
        {rightIcon}
      </View>
      {subtitle ? (
        <Text style={[theme.fonts.labelMedium, { marginTop: 5, textAlign: 'justify' }]}>{subtitle}</Text>
      ) : null}
      {additionalObject}
    </View>
  );
}

export default CustomSimpleInformationCard;
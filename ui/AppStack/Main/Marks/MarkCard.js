import { Text, View } from "react-native";
import { XIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";


// Imbedded info card
function ImbeddedInfoCard({ title, value, endIcon }) {
  return (
    <View style={{
      marginVertical: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: DefaultTheme.colors.backdrop,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Text style={DefaultTheme.fonts.labelMedium}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {endIcon}
        <Text style={[DefaultTheme.fonts.headlineSmall, { fontSize: 15, marginLeft: 5 }]}>{value}</Text>
      </View>
    </View>
  );
}

// Mark card
function MarkCard({ mark, openMarkDetails, outline }) {
  if (!mark) { return; }
  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: outline ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      marginVertical: 5,
    }} onPress={openMarkDetails}>
      <View style={{
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: DefaultTheme.colors.surfaceOutline,
      }}>
        <Text style={DefaultTheme.fonts.labelLarge}>{mark.title}</Text>
        <Text style={DefaultTheme.fonts.headlineMedium}>{mark.valueStr}</Text>
      </View>
      <>
        <View style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}>
          {/* Class values */}
          {mark.classValue && (
            <ImbeddedInfoCard
              title={"Classe"}
              value={mark.classValue}
            />
          )}

          {/* Coefficient */}
          <ImbeddedInfoCard
            title={"Coeff."}
            value={`${mark.coefficient}`.replace(".", ",")}
            endIcon={<XIcon size={15} color={DefaultTheme.colors.onSurface}/>}
          />
        </View>
      </>
    </PressableScale>
  );
}

export default MarkCard;
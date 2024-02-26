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
function MarkCard({ mark, navigation }) {
  // DOESNT WORK
  const currentDeployment = useSharedValue(150);
  const handlePress = () => {
    currentDeployment.value = withSpring(currentDeployment.value - 149);
  };
  
  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      marginVertical: 5,
    }} onPress={handlePress}>
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
        <Animated.View style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          height: currentDeployment,
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
        </Animated.View>
      </>
    </PressableScale>
  );
}

export default MarkCard;
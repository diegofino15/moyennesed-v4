import { View, Text, ActivityIndicator, Dimensions } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { MoreHorizontalIcon, XIcon, RefreshCcwIcon, UserCheckIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { useEffect, useState } from "react";
import HapticsHandler from "../../../util/HapticsHandler";


// Login status
function LoginStatus({ isConnected, isConnecting, refreshLogin, style }) {
  const [color, setColor] = useState(DefaultTheme.colors.primary);
  const [lightColor, setLightColor] = useState(DefaultTheme.colors.primaryLight);
  useEffect(() => {
    setColor(isConnected ? DefaultTheme.colors.success : isConnecting ? DefaultTheme.colors.primary : DefaultTheme.colors.error);
    setLightColor(isConnected ? DefaultTheme.colors.successLight : isConnecting ? DefaultTheme.colors.primaryLight : DefaultTheme.colors.errorLight);
  }, [isConnected, isConnecting]);
  
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...style,
    }}>
      <View style={{
        backgroundColor: lightColor,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 10,
        marginRight: 5,
        width: Dimensions.get('window').width - 82.5,
        height: 37.5,
      }}>
        <View style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {isConnecting ? (
            <MoreHorizontalIcon size={20} color={color}/>
          ) : isConnected ? (
            <UserCheckIcon size={20} color={color}/>
          ) : (
            <XIcon size={20} color={color}/>
          )}
          <Text style={[DefaultTheme.fonts.bodyLarge, {
            marginLeft: 10,
            color: color,

          }]}>{isConnected ? "Connecté" : isConnecting ? "Connexion en cours..." : "Non connecté"}</Text>
        </View>
      </View>

      <PressableScale onPress={() => {
        HapticsHandler.vibrate("light");
        refreshLogin().then(() => HapticsHandler.vibrate("light"));
      }} style={{
        backgroundColor: color,
        borderRadius: 10,
        height: 37.5,
        width: 37.5,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {isConnecting ? (
          <ActivityIndicator size={25} color={DefaultTheme.colors.onPrimary}/>
        ) : (
          <RefreshCcwIcon size={25} color={DefaultTheme.colors.onPrimary}/>
        )}
      </PressableScale>
    </View>
  );
}

export default LoginStatus;
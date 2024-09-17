import { View, Text, ActivityIndicator } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { MoreHorizontalIcon, XIcon, RefreshCcwIcon, UserCheckIcon } from "lucide-react-native";
import { useEffect, useState } from "react";

import HapticsHandler from "../../core/HapticsHandler";
import { useAppContext } from "../../util/AppContext";


// Login status
function CustomLoginStatus({ isConnected, isConnecting, refreshLogin, style, windowWidth }) {
  const { theme } = useAppContext();
  
  const [color, setColor] = useState(theme.colors.primary);
  const [lightColor, setLightColor] = useState(theme.colors.primaryLight);
  useEffect(() => {
    setColor(isConnected ? theme.colors.success : isConnecting ? theme.colors.primary : theme.colors.error);
    setLightColor(isConnected ? theme.colors.successLight : isConnecting ? theme.colors.primaryLight : theme.colors.errorLight);
  }, [isConnected, isConnecting, theme.dark]);
  
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
        width: windowWidth - 82.5,
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
          <Text style={[theme.fonts.bodyLarge, {
            marginLeft: 10,
            color: color,
          }]}>{isConnected ? 'Connecté' : isConnecting ? "Connexion en cours..." : 'Non connecté'}</Text>
        </View>
      </View>

      <PressableScale onPress={() => {
        if (isConnecting) { return; }
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
          <ActivityIndicator size={25} color={theme.colors.onPrimary}/>
        ) : (
          <RefreshCcwIcon size={25} color={theme.colors.onPrimary}/>
        )}
      </PressableScale>
    </View>
  );
}

export default CustomLoginStatus;
import { useEffect, useState } from 'react';
import { Image, Platform, Text, View, Linking } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { XIcon } from "lucide-react-native";

import AccountHandler from '../../core/AccountHandler';
import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Banner used to promote "MoyennesED Sans Pubs"
function CustomAdBannerForOtherApp() {
  const { theme } = useGlobalAppContext(); 
  
  // Should show the popup ?
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    AccountHandler.getPreference("show-no-ads-popup", Platform.OS == "ios").then(setShowPopup)
  }, []);

  // Open link
  function openLink() {
    Linking.openURL("https://apps.apple.com/us/app/moyennesed-sans-pubs/id6739073850");
  }

  async function closePopup() {
    await AccountHandler.setPreference("show-no-ads-popup", false);
    setShowPopup(false);
  }

  return showPopup && (
    <PressableScale style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.surfaceOutline,
      padding: 10,
      marginBottom: 10,
      marginHorizontal: 20,
    }} onPress={openLink}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={require("../../../assets/images/icon-no-ads.png")} style={{
            width: 70,
            height: 70,
            borderRadius: 20,
          }} />
          <Text style={[theme.fonts.titleSmall, { marginLeft: 10, maxWidth: 150 }]}>MoyennesED Sans Pubs</Text>
        </View>
      </View>
    
      <Text style={[theme.fonts.labelLarge, { color: theme.colors.onSurfaceDisabled }]}>{"\
  - Valable à vie\n\
  - Aucune publicité\n\
  - Moyenne en un clin d'oeil\
      "}</Text>

      {/* X Icon */}
      <PressableScale style={{
        position: 'absolute',
        top: 5,
        right: 5,
        borderColor: theme.colors.surfaceOutline,
        borderWidth: 2,
        borderRadius: 10,
      }} onPress={closePopup}>
        <XIcon size={30} color={theme.colors.onSurfaceDisabled}/>
      </PressableScale>

      <Text style={[theme.fonts.headlineMedium, {
        position: "absolute",
        bottom: 10,
        right: 10,
      }]}>2,99€</Text>
    </PressableScale>
  );
}

export default CustomAdBannerForOtherApp;
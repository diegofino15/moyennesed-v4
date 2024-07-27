import { memo } from "react";
import { Text, View, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

import CustomModal from "../components/CustomModal";
import CustomButton from "../components/CustomButton";
import NewsHandler from "../../core/NewsHandler";
import HapticsHandler from "../../core/HapticsHandler";
import { useAppContext } from "../../util/AppContext";


// Preferences popup
function PreferencesPopup({ navigation }) {
  const { theme } = useAppContext();
  
  async function handleClick(allow) {
    HapticsHandler.vibrate("light");
    await NewsHandler.setPreferences(allow);
    navigation.pop();
  }
  
  return (
    <CustomModal
      goBackFunction={() => navigation.pop()}
      style={{ paddingVertical: 0 }}
      horizontalPadding={0}
      children={(
        <View>
          {/* Animation and title */}
          <View style={{
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <LottieView
              autoPlay
              source={require('../../assets/lottie/preferences.json')}
              style={{
                width: '90%',
                height: Dimensions.get('window').width * 0.9,
                top: -40,
              }}
            />
            <Text style={[theme.fonts.titleMedium, { width: '90%', textAlign: 'center', top: -120 }]}>Accès aux dernières infos !</Text>
          </View>
          
          {/* Text */}
          <View style={{
            padding: 20,
            top: -110,
          }}>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 20, letterSpacing: 0.5 }]}>Pour vous tenir au courant des dernières mises à jour et événements, MoyennesED a besoin de se connecter à notre service API. Cette connexion automatique permet de récupérer les informations les plus récentes, comme les événements à venir, les nouvelles fonctionnalités, et les alertes importantes.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 20, letterSpacing: 0.5 }]}>Aucune donnée personnelle n'est envoyée ni collectée.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', letterSpacing: 0.5 }]}>En cliquant sur "Autoriser", vous consentez à ce que MoyennesED se connecte automatiquement à notre API à chaque lancement de l'app.</Text>
          
            <CustomButton
              title={<Text style={theme.fonts.bodyLarge}>Autoriser</Text>}
              onPress={() => handleClick(true)}
              style={{ marginTop: 30 }}
            />
            <CustomButton
              title={<Text style={[theme.fonts.bodyLarge, { color: theme.colors.error }]}>Refuser</Text>}
              onPress={() => handleClick(false)}
              style={{
                marginTop: 10,
                borderWidth: 2,
                borderColor: theme.colors.errorLight,
                backgroundColor: null,
              }}
            />
          </View>
        </View>
      )}
    />
  );
}

export default memo(PreferencesPopup);
import { Text, View, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import LottieView from "lottie-react-native";

import CustomModal from "../components/CustomModal";
import CustomButton from "../components/CustomButton";
import NewsHandler from "../../util/NewsHandler";
import HapticsHandler from "../../util/HapticsHandler";


// Preferences popup
function PreferencesPopup({ navigation }) {
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
            <Text style={[DefaultTheme.fonts.titleMedium, { width: '90%', textAlign: 'center', top: -120 }]}>Accès aux dernières infos !</Text>
          </View>
          
          {/* Text */}
          <View style={{
            padding: 20,
            top: -110,
          }}>
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 20, letterSpacing: 0.5 }]}>Pour vous tenir au courant des dernières mises à jour et événements, MoyennesED a besoin de se connecter à notre service API. Cette connexion automatique permet de récupérer les informations les plus récentes, comme les événements à venir, les nouvelles fonctionnalités, et les alertes importantes.</Text>
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 20, letterSpacing: 0.5 }]}>Aucune donnée personnelle n'est envoyée ni collectée.</Text>
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', letterSpacing: 0.5 }]}>En cliquant sur "Autoriser", vous consentez à ce que notre application se connecte automatiquement à notre API lors de chaque lancement.</Text>
          
            <CustomButton
              title={<Text style={DefaultTheme.fonts.bodyLarge}>Autoriser</Text>}
              onPress={() => handleClick(true)}
              style={{ marginTop: 30 }}
            />
            <CustomButton
              title={<Text style={[DefaultTheme.fonts.bodyLarge, { color: DefaultTheme.colors.primary }]}>Refuser</Text>}
              onPress={() => handleClick(false)}
              style={{
                marginTop: 10,
                borderColor: DefaultTheme.colors.primaryLight,
                borderWidth: 2,
                backgroundColor: null,
              }}
            />
          </View>
        </View>
      )}
    />
  );
}

export default PreferencesPopup;
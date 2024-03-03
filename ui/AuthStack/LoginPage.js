import { useState, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { AlertTriangleIcon, CircleUserRoundIcon, HelpCircleIcon, KeySquareIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";

import CustomModal from "../components/CustomModal";
import CustomTextInput from "../components/CustomTextInput";
import CustomButton from "../components/CustomButton";
import CustomInformationCard from "../components/CustomInformationCard";
import { useAppContext } from "../../util/AppContext";
import { openLink } from "../../util/Utils";
import AppData from "../../core/AppData";
import HapticsHandler from "../../core/HapticsHandler";


// Login page
function LoginPage({ navigation }) {
  // Show AppStack once logged-in
  const appContext = useAppContext();

  // Username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordTextController = useRef(null);

  // Page state
  const [isConnecting, setIsConnecting] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [errorConnecting, setErrorConnecting] = useState(false);

  // Login function
  async function login() {
    HapticsHandler.vibrate("light");
    setIsConnecting(true);
    setWrongPassword(false);
    setErrorConnecting(false);

    // Call login function
    const status = await AppData.login(username, password);

    setIsConnecting(false);
    if (status == 1) { // Successful
      navigation.pop();
      appContext.setIsLoggedIn(true);
    } else if (status == 2) { // Choose account
      navigation.navigate("ChooseAccountPage");
    } else if (status == 0) { // Wrong password
      passwordTextController.current.clear();
      setWrongPassword(true);
    } else { // Error when connecting
      setErrorConnecting(true);
    }
  }
  
  return (
    <CustomModal
      title="Se connecter"
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      children={(
        <View>
          <Text style={[DefaultTheme.fonts.labelMedium, { marginBottom: 30 }]}>Vous pouvez vous connecter en tant qu'élève ou en tant que parent.</Text>
          
          {/* Inputs */}
          <CustomTextInput
            label='Identifiant'
            onChangeText={setUsername}
            icon={<CircleUserRoundIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            style={{ marginBottom: 10 }}
          />
          <CustomTextInput
            label={wrongPassword ? "Mot de passe incorrect" : "Mot de passe"}
            labelColor={wrongPassword ? DefaultTheme.colors.error : null}
            onChangeText={setPassword}
            secureTextEntry={true}
            icon={<KeySquareIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            controller={passwordTextController}
            style={{ marginBottom: 20 }}
          />

          {/* Login button */}
          <CustomButton
            title={isConnecting ? (
              <ActivityIndicator size={25} color={DefaultTheme.colors.onPrimary}/>
            ) : (
              <Text style={[DefaultTheme.fonts.bodyLarge, { height: 25 }]}>Se connecter</Text>
            )}
            onPress={login}
          />

          {/* Connection failed */}
          {errorConnecting && <CustomInformationCard
            title='Une erreur est survenue'
            icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
            description='La connexion aux serveurs a échoué, vérifiez votre connexion internet.'
            error={true}
            style={{ marginTop: 30 }}
          />}

          {/* Reset password */}
          <CustomInformationCard
            title='Mot de passe oublié ?'
            icon={<HelpCircleIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            description='Pas de panique, cliquez ici pour réinitialiser votre mot de passe.'
            onPress={() => openLink('https://api.ecoledirecte.com/mot-de-passe-oublie.awp')}
            style={{ marginTop: 30 }}
          />

          {/* Information */}
          <Text style={[DefaultTheme.fonts.labelMedium, { marginTop: 30, width: '80%', textAlign: 'center', alignSelf: 'center' }]}>
            Aucune information n'est enregistrée, vos identifiants restent entre vous et ÉcoleDirecte.
          </Text>
        </View>
      )}
    />
  );
}

export default LoginPage;
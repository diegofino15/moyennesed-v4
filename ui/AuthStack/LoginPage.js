import { useState, useRef } from "react";
import { View, Text, ActivityIndicator, Dimensions, Platform } from "react-native";
import { AlertTriangleIcon, CircleUserRoundIcon, HelpCircleIcon, KeySquareIcon } from "lucide-react-native";

import CustomModal from "../../src/ui/components/CustomModal";
import CustomTextInput from "../../src/ui/components/CustomTextInput";
import CustomButton from "../../src/ui/components/CustomButton";
import CustomInformationCard from "../../src/ui/components/CustomInformationCard";
import { useGlobalAppContext } from "../../src/util/GlobalAppContext";
import { openLink } from "../../src/util/Utils";
import AppData from "../../src/core/AppData";
import HapticsHandler from "../../src/core/HapticsHandler";
import CustomDynamicLoginChooser from "./CustomDynamicLoginChooser";


// Login page
function LoginPage({ navigation }) {
  // Show AppStack once logged-in
  const { theme, setIsLoggedIn } = useGlobalAppContext();

  // Username and password
  const [username, setUsername] = useState('');
  const usernameTextController = useRef(null);
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
      setIsLoggedIn(true);
    } else if (status == 2) { // Choose account
      navigation.navigate("ChooseAccountPage");
    } else if (status == 0) { // Wrong password
      passwordTextController.current.clear();
      setWrongPassword(true);
    } else { // Error when connecting
      setErrorConnecting(true);
    }
  }

  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);
  
  return (
    <CustomModal
      title="Se connecter"
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      setWidth={setWindowWidth}
      children={(
        <View>
          <Text style={[theme.fonts.labelMedium, { marginBottom: 30 }]}>Vous pouvez vous connecter en tant qu'élève ou en tant que parent.</Text>
          
          {/* Inputs */}
          <CustomTextInput
            label='Identifiant'
            initialValue={username}
            onChangeText={setUsername}
            icon={<CircleUserRoundIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            style={{ marginBottom: 10 }}
            windowWidth={windowWidth}

            // Only for dev
            controller={usernameTextController}
            customRightIcon={__DEV__ && (
              <View style={{ position: 'absolute', right: 15 }}>
                <CustomDynamicLoginChooser setSelected={(value) => {
                  setUsername(`demoaccount-${value}`);
                }}/>
              </View>
            )}
          />
          <CustomTextInput
            label={wrongPassword ? "Mot de passe incorrect" : "Mot de passe"}
            labelColor={wrongPassword ? theme.colors.error : null}
            onChangeText={setPassword}
            secureTextEntry={true}
            icon={<KeySquareIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
            controller={passwordTextController}
            style={{ marginBottom: 20 }}
            windowWidth={windowWidth}
          />

          {/* Login button */}
          <CustomButton
            title={isConnecting ? (
              <ActivityIndicator size={25} color={theme.colors.onPrimary}/>
            ) : (
              <Text style={[theme.fonts.bodyLarge, { height: 25, color: theme.colors.onPrimary }]}>Se connecter</Text>
            )}
            onPress={login}
          />

          {/* Connection failed */}
          {errorConnecting && <CustomInformationCard
            title='Une erreur est survenue'
            icon={<AlertTriangleIcon size={20} color={theme.colors.error}/>}
            description='La connexion aux serveurs a échoué, vérifiez votre connexion internet.'
            error={true}
            style={{ marginTop: 30 }}
          />}

          {/* Reset password */}
          <CustomInformationCard
            title='Mot de passe oublié ?'
            icon={<HelpCircleIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
            description='Pas de panique, cliquez ici pour réinitialiser votre mot de passe.'
            onPress={() => openLink('https://api.ecoledirecte.com/mot-de-passe-oublie.awp')}
            style={{ marginTop: 30 }}
          />

          {/* Information */}
          <Text style={[theme.fonts.labelMedium, { marginTop: 30, width: '80%', textAlign: 'center', alignSelf: 'center' }]}>
            Aucune information n'est enregistrée, vos identifiants restent entre vous et ÉcoleDirecte.
          </Text>
        </View>
      )}
    />
  );
}

export default LoginPage;
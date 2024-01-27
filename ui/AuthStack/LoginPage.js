import { useState, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { AlertTriangleIcon, ChevronLeftIcon, CircleUserRoundIcon, HelpCircleIcon, KeySquareIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";

import CustomTextInput from "../components/CustomTextInput";
import CustomInformationCard from "../components/CustomInformationCard";
import { useAppContext } from "../../util/AppContext";
import HapticsHandler from "../../core/HapticsHandler";
import AppData from "../../core/AppData";


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
    <View>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#395D6F',
        padding: 10,
      }}>
        <PressableScale style={{
          backgroundColor: DefaultTheme.colors.surface,
          opacity: 0.6,
          padding: 5,
          borderRadius: 10,
          marginRight: 10,
        }} onPress={() => navigation.pop()}>
          <ChevronLeftIcon size={30} color={DefaultTheme.colors.onPrimary}/>
        </PressableScale>

        <Text style={[DefaultTheme.fonts.titleSmall, { fontSize: 17 }]}>Se connecter avec ÉcoleDirecte</Text>
        
        <View style={{ width: 40 }}/>
      </View>
      
      {/* Login form */}
      <View style={{
        backgroundColor: DefaultTheme.colors.backdrop,
        padding: 20,
        height: '100%',
      }}>
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
        <PressableScale style={{
          padding: 15,
          borderRadius: 15,
          backgroundColor: DefaultTheme.colors.primary,
          alignItems: 'center',
          height: 55,
        }} onPress={login}>
          {isConnecting
            ? <ActivityIndicator size={20} color={DefaultTheme.colors.onPrimary}/>
            : <Text style={[DefaultTheme.fonts.bodyLarge, { marginLeft: 10, color: DefaultTheme.colors.onPrimary }]}>Se connecter</Text>}
        </PressableScale>

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
          link='https://api.ecoledirecte.com/mot-de-passe-oublie.awp'
          style={{ marginTop: 30 }}
        />

        {/* Information */}
        <Text style={[DefaultTheme.fonts.labelMedium, { marginTop: 30, width: '80%', textAlign: 'center', alignSelf: 'center' }]}>
          Aucune information n'est enregistrée, vos identifiants restent entre vous et ÉcoleDirecte.
        </Text>
      </View>
    </View>
  );
}

export default LoginPage;
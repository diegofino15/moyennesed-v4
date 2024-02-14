import { memo, useEffect } from "react";
import { View, Text } from "react-native";
import { HandHelpingIcon, ScaleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import LoginStatus from "./LoginStatus";
import SettingsSection from "./SettingsSection";
import CustomModal from "../../components/CustomModal";
import CustomSectionButton from "../../components/CustomSectionButton";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import CustomLink from "../../components/CustomLink";
import AppData from "../../../core/AppData";


// Profile page
function SettingsPage({ refreshLogin, isConnected, isConnecting, navigation }) {
  // Currently selected account
  const [currentAccount, setCurrentAccount] = useState({});
  useEffect(() => { AppData.getMainAccount().then(account => { setCurrentAccount(account); }); }, []);

  return (
    <CustomModal
      title="Paramètres"
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          {/* Login status */}
          <SettingsSection title={"Compte"} marginTop={0}/>
          <LoginStatus isConnected={isConnected} isConnecting={isConnecting} refreshLogin={refreshLogin} style={{ marginBottom: 10 }}/>
          
          {/* Profile */}
          <CustomSectionButton
            showBigIcon={currentAccount.accountType == "E"}
            icon={currentAccount.accountType == "E" && <CustomProfilePhoto accountID={currentAccount.id} size={70}/>}
            title={`${currentAccount.firstName} ${currentAccount.lastName}`}
            description="Paramètres du profil"
            onPress={() => navigation.navigate("ProfilePage", { isModal: false, currentAccount: currentAccount })}
            style={{ marginBottom: 10 }}
          />

          {/* Coefficients */}
          <SettingsSection title={"Coefficients"}/>

          {/* About */}
          <SettingsSection title={"Informations"}/>
          <View style={{
            backgroundColor: DefaultTheme.colors.surface,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}>
            <Text style={[DefaultTheme.fonts.labelLarge, {
              textAlign: 'justify',
              marginBottom: 10,
            }]}>MoyennesED est une application non-officielle, elle ne peut être tenue responsable de problèmes potentiels liés à son utilisation.</Text>
            <CustomLink title="Site officiel ÉcoleDirecte" link={"https://www.ecoledirecte.com/"} style={{ marginBottom: 10 }}/>
            <CustomLink title="Conditions d'utilisation" link={"https://moyennesed.my.to/privacy-policy.html"} icon={(
              <ScaleIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
            )}/>
          </View>

          {/* Write a comment ? */}
          <SettingsSection title={"Soutenir"}/>
          <View style={{
            backgroundColor: DefaultTheme.colors.surface,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}>
            <Text style={[DefaultTheme.fonts.labelLarge, {
              textAlign: 'justify',
              marginBottom: 10,
            }]}>Aimez-vous l'application ? Vous pouvez la soutenir en écrivant un commentaire !</Text>
            <CustomLink title="Écrire un commentaire" link={"https://moyennesed.my.to/privacy-policy.html"} icon={(
              <HandHelpingIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
            )}/>
          </View>
        </View>
      )}
    />
  );
}

export default memo(SettingsPage);
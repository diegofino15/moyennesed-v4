import { memo, useEffect } from "react";
import { View, Text } from "react-native";
import { HandHelpingIcon, ScaleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import SettingsSection from "./SettingsSection";
import LoginStatus from "./LoginStatus";
import CustomSectionButton from "../../components/CustomSectionButton";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import CustomTextArea from "../../components/CustomTextArea";
import CustomLink from "../../components/CustomLink";
import { OSvalue } from "../../../util/Utils";
import AppData from "../../../core/AppData";


// Settings page
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
            icon={currentAccount.accountType == "E" && <CustomProfilePhoto accountID={currentAccount.id} size={70}/>}
            title={`${currentAccount.firstName} ${currentAccount.lastName}`}
            description="Paramètres du profil"
            onPress={() => navigation.navigate("ProfilePage", { isModal: false, currentAccount: currentAccount })}
            wrapperStyle={{ marginBottom: 10 }}
          />

          {/* Coefficients */}
          <SettingsSection title={"Coefficients"}/>
          {/* TODO */}


          {/* About */}
          <SettingsSection title={"Informations"}/>
          <CustomTextArea
            children={(
              <View>
                <Text style={[DefaultTheme.fonts.labelLarge, {
                  textAlign: 'justify',
                  marginBottom: 10,
                }]}>MoyennesED est une application non-officielle, elle ne peut être tenue responsable de problèmes potentiels liés à son utilisation.</Text>
                <CustomLink title="Site officiel ÉcoleDirecte" link={"https://www.ecoledirecte.com/"} style={{ marginBottom: 10 }}/>
                <CustomLink title="Conditions d'utilisation" link={"https://moyennesed.my.to/privacy-policy.html"} icon={(
                  <ScaleIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}/>
              </View>
            )}
          />

          {/* Write a comment ? */}
          <SettingsSection title={"Soutenir"}/>
          <CustomTextArea
            children={(
              <View>
                <Text style={[DefaultTheme.fonts.labelLarge, {
                  textAlign: 'justify',
                  marginBottom: 10,
                }]}>Aimez-vous l'application ? Vous pouvez la soutenir en écrivant un commentaire !</Text>
                <CustomLink title="Écrire un commentaire" link={OSvalue({
                  iosValue: 'https://apps.apple.com/app/apple-store/id6446418445?action=write-review',
                  androidValue: 'https://play.google.com/store/apps/details?id=me.diegof.moyennesed&showAllReviews=true',
                })} icon={(
                  <HandHelpingIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}/>
              </View>
            )}
          />
        </View>
      )}
    />
  );
}

export default memo(SettingsPage);
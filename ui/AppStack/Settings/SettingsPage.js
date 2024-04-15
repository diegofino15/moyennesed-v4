import { memo, useEffect } from "react";
import { View, Text, Platform, Dimensions } from "react-native";
import { CheckCircleIcon, FileXIcon, HandHelpingIcon, KeyIcon, ScaleIcon, Settings2Icon, XIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import CustomSection from "../../components/CustomSection";
import LoginStatus from "./LoginStatus";
import CustomSectionButton from "../../components/CustomSectionButton";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import CustomTextArea from "../../components/CustomTextArea";
import CustomLink from "../../components/CustomLink";
import AppData from "../../../core/AppData";
import NewsHandler from "../../../core/NewsHandler";


// Settings page
function SettingsPage({ refreshLogin, isConnected, isConnecting, updateGlobalDisplay, navigation }) {
  // Currently selected account
  const [currentAccount, setCurrentAccount] = useState({});
  useEffect(() => { AppData.getMainAccount().then(account => { setCurrentAccount(account); }); }, []);

  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);

  return (
    <CustomModal
      title="Paramètres"
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      setWidth={setWindowWidth}
      children={(
        <View>
          {/* Login status */}
          <CustomSection title={"Compte"} marginTop={0}/>
          <LoginStatus isConnected={isConnected} isConnecting={isConnecting} refreshLogin={refreshLogin} style={{ marginBottom: 10 }} windowWidth={windowWidth}/>
          
          {/* Profile */}
          <CustomSectionButton
            icon={currentAccount?.accountType == "E" && <CustomProfilePhoto accountID={currentAccount.id} size={70}/>}
            title={`${currentAccount?.firstName} ${currentAccount?.lastName}`}
            description="Paramètres du profil"
            onPress={() => navigation.navigate("ProfilePage", { currentAccount: currentAccount })}
            wrapperStyle={{ marginBottom: 10 }}
          />

          {/* Coefficients */}
          <CustomSection title={"Coefficients"}/>
          {/* TODO */}

          {/* Preferences */}
          <CustomSection title={"Préférences"}/>
          <CustomSectionButton
            title={"Accès aux dernières infos"}
            description={NewsHandler.allowLatestNewsRefresh ? (
              <>
                <CheckCircleIcon size={15} color={DefaultTheme.colors.success}/>
                <Text style={[DefaultTheme.fonts.labelMedium, { color: DefaultTheme.colors.success }]}> Autorisé</Text>
              </>
            ) : (
              <>
                <XIcon size={15} color={DefaultTheme.colors.error}/>
                <Text style={[DefaultTheme.fonts.labelMedium, { color: DefaultTheme.colors.error }]}> Non autorisé</Text>
              </>
            )}
            onPress={() => navigation.navigate('PreferencesPopup', { presentation: 'modal' })}
          />

          {/* About */}
          <CustomSection title={"Informations"}/>
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
          <CustomSection title={"Soutenir"}/>
          <CustomTextArea
            children={(
              <View>
                <Text style={[DefaultTheme.fonts.labelLarge, {
                  textAlign: 'justify',
                  marginBottom: 10,
                }]}>Aimez-vous l'application ? Vous pouvez la soutenir en écrivant un commentaire !</Text>
                <CustomLink title="Écrire un commentaire" link={Platform.select({
                  ios: 'https://apps.apple.com/app/apple-store/id6446418445?action=write-review',
                  android: 'https://play.google.com/store/apps/details?id=me.diegof.moyennesed&showAllReviews=true',
                })} icon={(
                  <HandHelpingIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}/>
              </View>
            )}
          />

          {/* Dev options */}
          {__DEV__ && (
            <>
              <CustomSection title={"Dev options"}/>
              <CustomLink
                title={"Clear cache"}
                onPress={AppData.eraseCacheData}
                icon={<FileXIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                style={{ marginBottom: 10 }}
              />
              <CustomLink
                title={"Reset preferences"}
                onPress={() => AppData.resetPreferences(currentAccount?.id, updateGlobalDisplay)}
                icon={<Settings2Icon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                style={{ marginBottom: 10 }}
              />
              <CustomLink
                title={"Clear double auth tokens"}
                onPress={() => { AsyncStorage.removeItem("double-auth-tokens"); }}
                icon={<KeyIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              />
            </>
          )}

          <View style={{ height: 100 }}/> 
        </View>
      )}
    />
  );
}

export default memo(SettingsPage);
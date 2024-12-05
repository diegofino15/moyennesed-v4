import { memo, useEffect } from "react";
import { View, Text, Platform, Dimensions } from "react-native";
import { BadgeHelpIcon, BugIcon, CrownIcon, GithubIcon, HandHelpingIcon, MailIcon, ScaleIcon, Settings2Icon, WeightIcon } from "lucide-react-native";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import CustomSection from "../../components/CustomSection";
import CustomLoginStatus from "../../components/CustomLoginStatus";
import CustomSectionButton from "../../components/CustomSectionButton";
import CustomSimpleSectionButton from "../../components/CustomSimpleSectionButton";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import CustomTextArea from "../../components/CustomTextArea";
import CustomLink from "../../components/CustomLink";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// Settings page
function SettingsPage({ navigation }) {
  const { theme } = useGlobalAppContext();
  const { mainAccount } = useCurrentAccountContext();
  
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
          <CustomLoginStatus style={{ marginBottom: 10 }} windowWidth={windowWidth}/>
          
          {/* Profile */}
          <CustomSectionButton
            icon={mainAccount?.accountType == "E" && <CustomProfilePhoto accountID={mainAccount?.id} size={70}/>}
            title={`${mainAccount?.firstName} ${mainAccount?.lastName}`}
            description='Paramètres du profil'
            onPress={() => navigation.navigate("ProfilePage")}
            wrapperStyle={{ marginBottom: 10 }}
          />

          <CustomSection title={"Préférences"}/>

          {/* Coefficients */}
          <CustomSimpleSectionButton
            title={"Paramètres des coefficients"}
            icon={<WeightIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
            onPress={() => navigation.navigate('CoefficientsPage', { presentation: 'modal' })}
            style={{ marginBottom: 10 }}
          />

          {/* Advanced settings */}
          <CustomSimpleSectionButton
            title={"Paramètres avancés"}
            icon={<Settings2Icon size={20} color={theme.colors.onSurfaceDisabled}/>}
            onPress={() => navigation.navigate('AdvancedSettingsPage', { presentation: 'modal' })}
            style={{ marginBottom: 10 }}
          />

          {/* About */}
          <CustomSection title={"Informations"}/>
          <CustomTextArea
            style={{ marginBottom: 10 }}
            children={(
              <View style={{ alignItems: "center" }}>
                <CrownIcon size={25} color={"#D2AF26"}/>
                <Text style={[theme.fonts.bodyLarge, {
                  marginTop: 5,
                }]}>Version payante</Text>
                <Text style={theme.fonts.labelLarge}>Vous n'avez pas de publicités</Text>
              </View>
            )}
          />

          <CustomTextArea
            children={(
              <View>
                <Text style={[theme.fonts.labelLarge, {
                  textAlign: 'justify',
                  marginBottom: 10,
                }]}>MoyennesED est une application non-officielle, elle ne peut être tenue responsable de problèmes potentiels liés à son utilisation.</Text>
                <CustomLink title="Site officiel ÉcoleDirecte" link={"https://www.ecoledirecte.com/"} style={{ marginBottom: 10 }}/>
                <CustomLink title="Conditions d'utilisation" link={"https://moyennesed.dfino.dev/privacy-policy-no-ads.html"} icon={(
                  <ScaleIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                )}/>

                <Text style={[theme.fonts.labelLarge, {
                  textAlign: 'justify',
                  marginTop: 20,
                  marginBottom: 10,
                }]}>Intéressé.e ? Vous pouvez voir le code complet de l'app sur GitHub.</Text>
                <CustomLink title="Projet GitHub" link={"https://github.com/diegofino15/moyennesed-v4.git"} icon={(
                  <GithubIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                )}/>
              </View>
            )}
          />

          {/* Bug report */}
          <CustomSection title={"Un problème ?"}/>
          <CustomSimpleSectionButton
            title={"Signaler un bug"}
            textStyle={{ color: theme.colors.error }}
            icon={<BugIcon size={20} color={theme.colors.error}/>}
            onPress={() => navigation.navigate('BugReportPage', { presentation: 'modal' })}
          />
          <CustomTextArea
            children={(
              <CustomLink
                icon={<MailIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
                title={"Envoyer un mail"}
                link={"mailto:moyennesed@gmail.com"}
              />
            )}
            style={{ marginTop: 10 }}
          />

          {/* Write a comment ? */}
          <CustomSection title={"Soutenir"}/>
          <CustomTextArea
            children={(
              <View>
                <Text style={[theme.fonts.labelLarge, {
                  textAlign: 'justify',
                  marginBottom: 10,
                }]}>Aimez-vous l'application ? Vous pouvez la soutenir en écrivant un commentaire !</Text>
                <CustomLink title="Écrire un commentaire" link={Platform.select({
                  ios: 'https://apps.apple.com/app/apple-store/id6446418445?action=write-review',
                  android: 'https://play.google.com/store/apps/details?id=me.diegof.moyennesed&showAllReviews=true',
                })} icon={(
                  <HandHelpingIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                )}/>
              </View>
            )}
          />
          <View style={{ height: 100 }}/> 
        </View>
      )}
    />
  );
}

export default memo(SettingsPage);
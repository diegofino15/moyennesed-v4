import { useEffect } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { ArrowDownUpIcon, UserRoundIcon, CornerDownRightIcon, SchoolIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import DisconnectModal from "./DisconnectModal";
import SwitchAccountModal from "./SwitchAccountModal";
import SettingsSection from "../SettingsSection";
import CustomModal from "../../../components/CustomModal";
import ProfilePhoto from "../../../components/ProfilePhoto";
import CustomInformationCard from "../../../components/CustomInformationCard";
import { useAppContext } from "../../../../util/AppContext";
import AppData from "../../../../core/AppData";
import HapticsHandler from "../../../../core/HapticsHandler";
import Separator from "../../../components/Separator";
import { OSvalue } from "../../../../util/Utils";


// Profile settings page
function ProfilePage({ route, navigation }) {
  // Currently selected account
  const { currentAccount } = route.params;

  // Switch account
  const [canSwitchAccounts, setCanSwitchAccounts] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  useEffect(() => { AsyncStorage.getItem("accounts").then(jsonAccounts => {
    if (Object.keys(JSON.parse(jsonAccounts)).length > 1) { setCanSwitchAccounts(true); }
  }); }, []);
  async function switchAccount(newAccountID) {
    if (newAccountID != currentAccount.id) {
      await AsyncStorage.setItem("selectedAccount", `${newAccountID}`);
      navigation.navigate("MainPage", { newAccountID: newAccountID });
      console.log(`Switched to account ${newAccountID} !`);
      HapticsHandler.vibrate("light");
    }
    setIsSwitchingAccount(false);
  }

  // Disconnect
  const appContext = useAppContext();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  async function disconnect() {
    await AppData.eraseData();
    setIsDisconnecting(false);
    navigation.navigate("MainPage", { newAccountID: 0 });
    appContext.setIsLoggedIn(false);
    HapticsHandler.vibrate("light");
  }

  return (
    <CustomModal
      title="Profil"
      goBackFunction={() => navigation.pop()}
      style={{ padding: 0 }}
      showScrollView={false}
      children={(
        <View style={{
          backgroundColor: DefaultTheme.colors.backdrop,
          height: '100%',
        }}>
          {/* Blurred background */}
          <View style={{
            position: 'absolute',
            overflow: 'hidden',
          }}>
            <ProfilePhoto accountID={currentAccount.id} size={Dimensions.get('window').width} style={{ height: 380, top: -50 }}/>
            <BlurView intensity={OSvalue({ iosValue: currentAccount.photoURL ? 50 : 30, androidValue: 100 })} tint="dark" style={{ width: '100%', height: 330, position: 'absolute', }}/>
          </View>
          
          {/* Actual page */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient colors={[
              'transparent',
              'black',
            ]} style={{ width: '100%', height: 330 }}>
              {/* Account ID */}
              <PressableScale style={{
                position: 'absolute',
                top: 20,
                right: 20,
                overflow: 'hidden',
                borderRadius: 5,
              }}>
                <BlurView tint="light" style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}>
                  <Text style={[DefaultTheme.fonts.bodyMedium, { height: 22 }]}>ID - {currentAccount.id}</Text>
                </BlurView>
              </PressableScale>

              {/* Name */}
              <View style={{ position: 'absolute', bottom: 20, width: '80%', alignSelf: 'center' }}>
                <Text style={[DefaultTheme.fonts.titleMedium, { alignSelf: 'center', textAlign: 'center' }]}>{currentAccount.firstName} {currentAccount.lastName}</Text>
                <Text style={[DefaultTheme.fonts.labelLarge, { alignSelf: 'center', textAlign: 'center' }]}>{currentAccount.accountType == "E" ? currentAccount.grade : "Compte parent"}</Text>
              </View>
            </LinearGradient>

            <Separator style={{ backgroundColor: DefaultTheme.colors.surfaceOutline }}/>
            
            <View style={{ backgroundColor: DefaultTheme.colors.backdrop, padding: 20 }}>
              {/* Informations */}
              <View style={{
                backgroundColor: DefaultTheme.colors.surface,
                borderWidth: 2,
                borderColor: DefaultTheme.colors.surfaceOutline,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}>
                {currentAccount.accountType == "E" ? (
                  <SchoolIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled} style={{ marginRight: 10 }}/>
                ) : (
                  <UserRoundIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled} style={{ marginRight: 10 }}/>
                )}
                <Text style={DefaultTheme.fonts.bodyLarge}>{currentAccount.accountType == "E" ? currentAccount.school : "Compte parent"}</Text>
              </View>

              {/* Show children accounts for parent accounts */}
              {currentAccount.accountType == "P" && Object.keys(currentAccount.children).map(childID => {
                const child = currentAccount.children[childID];
                return (
                  <View key={childID} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                    <CornerDownRightIcon size={30} color={DefaultTheme.colors.onSurfaceDisabled}/>
                    <ProfilePhoto accountID={childID} size={55} style={{ marginLeft: 10 }}/>
                    <View style={{
                      borderWidth: 2,
                      borderColor: DefaultTheme.colors.surfaceOutline,
                      backgroundColor: DefaultTheme.colors.surface,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginLeft: 10,
                      width: Dimensions.get('window').width - 145,
                      height: 55,
                    }}>
                      <Text style={[DefaultTheme.fonts.bodyMedium, { height: 20 }]} numberOfLines={1}>{child.firstName} {child.lastName}</Text>
                      <Text style={DefaultTheme.fonts.labelMedium}>{child.grade}</Text>
                    </View>
                  </View>
                );
              })}
              
              
              
              {/* Change account / Disconnect */}
              <SettingsSection title={"Danger zone"}/>

              {canSwitchAccounts && (
                <CustomInformationCard
                  title={"Changer de compte"}
                  description={"Plusieurs comptes ont été détectés, cliquez ici pour changer."}
                  icon={<ArrowDownUpIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                  onPress={() => setIsSwitchingAccount(true)}
                  style={{ marginTop: 20 }}
                />
              )}

              <PressableScale style={{
                padding: 10,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: DefaultTheme.colors.error,
                backgroundColor: DefaultTheme.colors.backdrop,
                marginTop: 20,
                alignItems: "center",
                justifyContent: "center",
              }} onPress={() => setIsDisconnecting(true)}>
                <Text style={[DefaultTheme.fonts.bodyLarge, { color: DefaultTheme.colors.error }]}>Se déconnecter</Text>
              </PressableScale>

            </View>

            <View style={{ height: 250 }}/>
          </ScrollView>
          
          {/* MODALS */}
          <SwitchAccountModal
            isSwitchingAccount={isSwitchingAccount}
            setIsSwitchingAccount={setIsSwitchingAccount}
            switchAccount={switchAccount}
            selectedAccount={currentAccount.id}
          />
          <DisconnectModal
            isDisconnecting={isDisconnecting}
            setIsDisconnecting={setIsDisconnecting}
            disconnect={disconnect}
          />
        </View>
      )}
    />
  );
}

export default ProfilePage;
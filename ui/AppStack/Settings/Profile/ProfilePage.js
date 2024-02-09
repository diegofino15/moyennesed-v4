import { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { ArrowDownUpIcon } from "lucide-react-native";
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
      children={(
        <View>
          <View style={{
            overflow: 'hidden',
          }}>
            <ProfilePhoto accountID={currentAccount.id} size={Dimensions.get('window').width} style={{
              height: 380,
              top: -50,
            }}/>
            <BlurView intensity={currentAccount.accountType == "E" ? 50 : 30} tint="dark" style={{
              width: '100%',
              height: 330,
              position: 'absolute',
            }}>
              <LinearGradient colors={[
                'transparent',
                'black',
              ]} style={{
                height: 330,
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 20,
                paddingHorizontal: 50,
              }}>
                <Text style={[DefaultTheme.fonts.titleMedium, { textAlign: 'center' }]}>{currentAccount.firstName} {currentAccount.lastName}</Text>
                <Text style={DefaultTheme.fonts.labelLarge}>{currentAccount.grade ?? "Compte parent"}</Text>
              </LinearGradient>

              <Separator style={{ backgroundColor: DefaultTheme.colors.surfaceOutline }}/>
            </BlurView>
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
          </View>

          <View style={{
            paddingHorizontal: 20,
          }}>
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
          
          {/* MODALS */}

          {/* Switch accounts modal */}
          <SwitchAccountModal
            isSwitchingAccount={isSwitchingAccount}
            setIsSwitchingAccount={setIsSwitchingAccount}
            switchAccount={switchAccount}
            selectedAccount={currentAccount.id}
          />

          {/* Disconnect modal */}
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
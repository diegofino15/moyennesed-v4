import { useEffect } from "react";
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { AlertTriangleIcon, ArrowDownUpIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import DisconnectModal from "./DisconnectModal";
import SwitchAccountModal from "./SwitchAccountModal";
import CustomModal from "../../../components/CustomModal";
import ProfilePhoto from "../../../components/ProfilePhoto";
import CustomInformationCard from "../../../components/CustomInformationCard";
import { useAppContext } from "../../../../util/AppContext";
import AppData from "../../../../core/AppData";


// Profile settings page
function ProfilePage({ route, navigation }) {
  // Currently selected account
  const { currentAccount } = route.params;

  // Can switch account
  const [canSwitchAccounts, setCanSwitchAccounts] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("accounts").then(jsonAccounts => {
      if (Object.keys(JSON.parse(jsonAccounts)).length > 1) { setCanSwitchAccounts(true); }
    });
  }, []);
  async function switchAccount(newAccountID) {
    if (newAccountID != currentAccount.id) {
      await AsyncStorage.setItem("selectedAccount", `${newAccountID}`);
      navigation.navigate("MainPage", { newAccountID: newAccountID });
      console.log(`Switched to account ${newAccountID} !`);
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
  }

  return (
    <CustomModal
      title="Profil"
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          <View style={{
            backgroundColor: DefaultTheme.colors.surface,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
            width: '100%',
            height: 200,
            borderRadius: 20,
            padding: 20,
          }}>
            <View style={{
              flexDirection: 'row',
            }}>
              <ProfilePhoto accountID={currentAccount.id} size={70}/>
              <View style={{
                flexDirection: 'column',
                marginLeft: 10,
              }}>
                <Text style={[
                  DefaultTheme.fonts.titleMedium,
                  { textAlign: "center" }, 
                ]}>{currentAccount.firstName} {currentAccount.lastName}</Text>
                <Text style={DefaultTheme.fonts.labelMedium}>Établissement : </Text>
              </View>
            </View>
          </View>

          {canSwitchAccounts && (
            <CustomInformationCard
              title={"Changer de compte"}
              description={"Plusieurs comptes ont été détectés, cliquez ici pour changer."}
              icon={<ArrowDownUpIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              onPress={() => setIsSwitchingAccount(true)}
              style={{ marginTop: 20 }}
            />
          )}
          
          <CustomInformationCard
            title="Se déconnecter"
            description="Effacer les données de ce compte sur l'application"
            icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
            onPress={() => setIsDisconnecting(!isDisconnecting)}
            style={{ marginTop: 20 }}
            error
          />


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
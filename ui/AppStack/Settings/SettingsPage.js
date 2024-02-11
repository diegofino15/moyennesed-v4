import { memo, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CheckIcon, XIcon, RefreshCcwIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import CustomSectionButton from "../../components/CustomSectionButton";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import AppData from "../../../core/AppData";
import HapticsHandler from "../../../core/HapticsHandler";


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
          <PressableScale style={{
            marginBottom: 20,
          }}>
            <View style={{
              backgroundColor: isConnected ? DefaultTheme.colors.success : isConnecting ? DefaultTheme.colors.primary : DefaultTheme.colors.error,
              borderRadius: 10,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <View style={{
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
                {isConnecting
                ? null
                : isConnected
                  ? <CheckIcon size={20} color={DefaultTheme.colors.onPrimary}/>
                  : <XIcon size={20} color={DefaultTheme.colors.onPrimary}/>}
                <Text style={[
                  DefaultTheme.fonts.labelLarge,
                  { color: DefaultTheme.colors.onPrimary, marginLeft: 10 }
                ]}>{isConnected ? "Connecté" : isConnecting ? "Connexion en cours..." : "Non connecté"}</Text>
              </View>
              <PressableScale
                onPress={() => {
                  if (!isConnecting) {
                    HapticsHandler.vibrate("light");
                    refreshLogin().then(() => {
                      HapticsHandler.vibrate("light");
                    });
                  }
                }}
                style={{
                  borderColor: DefaultTheme.colors.background,
                  borderLeftWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 50
                }}
              >
                {isConnecting
                ? <ActivityIndicator size={25} color={DefaultTheme.colors.onPrimary}/>
                : <RefreshCcwIcon size={25} color={DefaultTheme.colors.onPrimary}/>}
              </PressableScale>
            </View>
          </PressableScale>
          
          {/* Profile */}
          <CustomSectionButton
            showBigIcon={currentAccount.accountType == "E"}
            icon={currentAccount.accountType == "E" && <CustomProfilePhoto accountID={currentAccount.id} size={70}/>}
            title={`${currentAccount.firstName} ${currentAccount.lastName}`}
            description="Paramètres du profil"
            onPress={() => navigation.navigate("ProfilePage", { isModal: false, currentAccount: currentAccount })}
            style={{ marginBottom: 10 }}
          />
        </View>
      )}
    />
  );
}

export default memo(SettingsPage);
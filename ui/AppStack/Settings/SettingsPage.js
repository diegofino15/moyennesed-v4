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
import LoginStatus from "./LoginStatus";
import SettingsSection from "./SettingsSection";


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
        </View>
      )}
    />
  );
}

export default memo(SettingsPage);
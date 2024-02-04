import { useEffect } from "react";
import { View, Text } from "react-native";
import useState from "react-usestateref";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme } from "react-native-paper";

import CustomModal from "../../components/CustomModal";
import ProfilePhoto from "../../components/ProfilePhoto";
import AppData from "../../../core/AppData";
import CustomInformationCard from "../../components/CustomInformationCard";
import ConfirmModal from "../../components/ConfirmModal";


// Profile settings page
function ProfileSettingsPage({ navigation }) {
  // Currently selected account
  const [selectedAccount, setSelectedAccount] = useState(null);
  useEffect(() => {
    AppData.getSelectedAccount().then(accountID => setSelectedAccount(accountID));
  }, []);

  // Get available accounts from local storage
  const [accounts, setAccounts, accountsRef] = useState({});
  const [newSelectedAccount, setNewSelectedAccount] = useState(0);
  const [canSwitchAccounts, setCanSwitchAccounts] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("accounts").then(jsonAccounts => {
      setAccounts(JSON.parse(jsonAccounts));
      if (Object.keys(accountsRef.current).length > 1) { setCanSwitchAccounts(true); }
    });
  }, []);

  const [isConfirming, setIsConfirming] = useState(false);

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
              <ProfilePhoto accountID={selectedAccount} size={70}/>
              <View style={{
                flexDirection: 'column',
                marginLeft: 10,
              }}>
                <Text style={[
                  DefaultTheme.fonts.titleMedium,
                  { textAlign: "center" }, 
                ]}>Diego FINOCCHIARO</Text>
                <Text style={DefaultTheme.fonts.labelMedium}>Établissement : </Text>
              </View>
            </View>
          </View>
          
          <CustomInformationCard
            title="Trigger"
            onPress={() => setIsConfirming(!isConfirming)}
          />

          <ConfirmModal
            visible={isConfirming}
            setVisible={setIsConfirming}
          />
        </View>
      )}
    />
  );
}

export default ProfileSettingsPage;
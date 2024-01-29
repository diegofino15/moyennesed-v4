import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../components/CustomModal";
import { DefaultTheme } from "react-native-paper";


// Profile settings page
function ProfileSettingsPage({ navigation }) {
  // Can switch accounts
  const [canSwitchAccounts, setCanSwitchAccounts] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("accounts").then((accounts) => {
      const cacheAccounts = JSON.parse(accounts);
      if (Object.keys(cacheAccounts).length > 1) {
        setCanSwitchAccounts(true);
      } else {
        setCanSwitchAccounts(false);
      }
    });
  });
  
  return (
    <CustomModal
      title="Profil"
      goBackFunction={() => navigation.goBack()}
      children={(
        <View>
          <Text style={DefaultTheme.fonts.labelLarge}>Helo</Text>
        </View>
      )}
    />
  );
}

export default ProfileSettingsPage;
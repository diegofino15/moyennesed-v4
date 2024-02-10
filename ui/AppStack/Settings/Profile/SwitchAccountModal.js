import { useEffect, useState } from 'react';
import { View, Text } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CheckCircleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomConfirmModal from "../../../components/CustomConfirmModal";


// Switch accounts modal
function SwitchAccountModal({ isSwitchingAccount, setIsSwitchingAccount, switchAccount, selectedAccount }) {
  // Get available accounts
  const [availableAccounts, setAvailableAccounts] = useState({});
  useEffect(() => { AsyncStorage.getItem("accounts").then(accounts => { setAvailableAccounts(JSON.parse(accounts)); }); }, []);
  
  return (
    <CustomConfirmModal
      visible={isSwitchingAccount}
      exitModal={() => setIsSwitchingAccount(false)}
      children={[
        (<View key={1} style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          padding: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={DefaultTheme.fonts.titleSmall}>Changer de compte</Text>
          <Text style={DefaultTheme.fonts.labelMedium}>Cliquez sur un compte pour le sélectionner.</Text>
          <Text style={DefaultTheme.fonts.labelMedium}>Vos données et préférences seront sauvegardées.</Text>
        </View>),
        
        Object.values(availableAccounts).map(account => (
          <PressableScale key={account.id} style={{
            backgroundColor: DefaultTheme.colors.surface,
            borderWidth: 2,
            borderColor: account.id == selectedAccount ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
          }} onPress={() => switchAccount(account.id)}>
            <Text style={DefaultTheme.fonts.bodyMedium}>{account.firstName} {account.lastName}</Text>
            <Text style={DefaultTheme.fonts.labelMedium}>{account.accountType == "E" ? "Compte élève" : "Compte parent"}</Text>
            <View style={{
              position: 'absolute',
              right: 10,
              top: 10,
            }}>
              {account.id == selectedAccount && <CheckCircleIcon size={20} color={DefaultTheme.colors.primary}/>}
            </View>
          </PressableScale>
        )),
      ]}
    />
  );
}

export default SwitchAccountModal;
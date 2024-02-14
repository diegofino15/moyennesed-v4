import { useEffect, useState } from 'react';
import { View, Text } from "react-native";
import { CheckCircleIcon, CircleIcon, MousePointerSquareIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomConfirmModal from "../../../components/CustomConfirmModal";
import CustomInformationCard from "../../../components/CustomInformationCard";
import CustomProfilePhoto from "../../../components/CustomProfilePhoto";
import CustomSectionButton from "../../../components/CustomSectionButton";


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
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={DefaultTheme.fonts.titleSmall}>Changer de compte</Text>
          <Text style={DefaultTheme.fonts.labelMedium}>Vos données et préférences seront sauvegardées. Cliquez sur un compte pour le sélectionner.</Text>
        </View>),

        Object.values(availableAccounts).map(account => <CustomSectionButton
          key={account.id}
          icon={account.accountType == "E" && <CustomProfilePhoto accountID={account.id} size={70}/>}
          title={`${account.firstName} ${account.lastName}`}
          description={account.accountType == "E" ? "Compte élève" : "Compte parent"}
          onPress={() => switchAccount(account.id)}
          endIcon={(
            <View style={{
              position: 'absolute',
              right: 10,
              top: 10,
            }}>
              {account.id === selectedAccount ? (
                <CheckCircleIcon size={20} color={DefaultTheme.colors.primary}/>
              ) : (
                <CircleIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
              )}
            </View>
          )}
          wrapperStyle={{ marginTop: 10 }}
          style={{
            borderColor: account.id === selectedAccount ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
          }}
        />),
      ]}
      specialTip={(
        <CustomInformationCard
          title={"Le saviez-vous ?"}
          description={"Vous pouvez changer de compte en laissant pressé le bouton profil sur la page d'accueil."}
          icon={<MousePointerSquareIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
        />
      )}
    />
  );
}

export default SwitchAccountModal;
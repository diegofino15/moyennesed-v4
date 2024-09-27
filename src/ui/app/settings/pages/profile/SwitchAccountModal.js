import { useEffect, useState } from 'react';
import { View, Text } from "react-native";
import { CheckCircleIcon, ChevronRightIcon, SquareMousePointerIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomConfirmModal from "../../../../components/CustomConfirmModal";
import CustomInformationCard from "../../../../components/CustomInformationCard";
import CustomProfilePhoto from "../../../../components/CustomProfilePhoto";
import CustomSectionButton from "../../../../components/CustomSectionButton";
import CustomSeparator from '../../../../components/CustomSeparator';
import { useGlobalAppContext } from '../../../../../util/GlobalAppContext';


// Switch accounts modal
function SwitchAccountModal({ isSwitchingAccount, setIsSwitchingAccount, switchAccount, selectedAccount }) {
  const { theme } = useGlobalAppContext();
  
  // Get available accounts
  const [availableAccounts, setAvailableAccounts] = useState({});
  useEffect(() => { AsyncStorage.getItem("accounts").then(accounts => { setAvailableAccounts(JSON.parse(accounts)); }); }, []);
  
  return (
    <CustomConfirmModal
      visible={isSwitchingAccount}
      exitModal={() => setIsSwitchingAccount(false)}
      children={[
        (<View key={1} style={{
          backgroundColor: theme.colors.surface,
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={theme.fonts.titleSmall}>Changer de compte</Text>
          <Text style={theme.fonts.labelMedium}>Vos données et préférences seront sauvegardées. Cliquez sur un compte pour le sélectionner.</Text>
        </View>),
        (<CustomSeparator
          key={2}
          style={{ backgroundColor: theme.colors.surfaceOutline, marginBottom: 10 }}
        />),

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
                <CheckCircleIcon size={20} color={theme.colors.primary}/>
              ) : (
                <ChevronRightIcon size={20} color={theme.colors.onSurfaceDisabled}/>
              )}
            </View>
          )}
          wrapperStyle={{ marginTop: 10 }}
          style={{
            borderColor: account.id === selectedAccount ? theme.colors.primary : theme.colors.surfaceOutline,
          }}
        />),
      ]}
      specialTip={(
        <CustomInformationCard
          title={"Le saviez-vous ?"}
          description={"Vous pouvez changer de compte en laissant pressé le bouton profil sur la page d'accueil."}
          icon={<SquareMousePointerIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
        />
      )}
    />
  );
}

export default SwitchAccountModal;
import { useEffect, useState } from 'react';
import { View, Text, Dimensions } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CheckCircleIcon, CircleIcon, LightbulbIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomConfirmModal from "../../../components/CustomConfirmModal";
import CustomInformationCard from "../../../components/CustomInformationCard";
import CustomProfilePhoto from "../../../components/CustomProfilePhoto";


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
          <Text style={DefaultTheme.fonts.labelMedium}>Vos données et préférences seront sauvegardées. Cliquez sur un compte pour le sélectionner.</Text>
        </View>),

        Object.keys(availableAccounts).map(accountID => {
          const item = availableAccounts[accountID];
          return (
            <View key={accountID} style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              {item.accountType == "E" && <CustomProfilePhoto accountID={item.id} size={70} style={{ marginRight: 10 }}/>}
              
              <PressableScale style={{
                paddingHorizontal: 15,
                paddingVertical: 10,
                backgroundColor: DefaultTheme.colors.surface,
                borderWidth: 2,
                borderColor: accountID === selectedAccount ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
                borderRadius: 10,
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                height: 70,
                width: item.accountType == "P" ? '100%' : (Dimensions.get('window').width - 120),
              }} onPress={() => switchAccount(accountID)}>
                <Text style={[DefaultTheme.fonts.bodyLarge, { height: 25 }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[DefaultTheme.fonts.labelMedium, { height: 20 }]}>{item.accountType == "E" ? "Compte élève" : "Compte parent"}</Text>
                <View style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                }}>
                  {accountID === selectedAccount ? (
                    <CheckCircleIcon size={20} color={DefaultTheme.colors.primary}/>
                  ) : (
                    <CircleIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                  )}
                </View>
              </PressableScale>
            </View>
          );
        })
        
        // Object.values(availableAccounts).map(account => (
        //   <PressableScale key={account.id} style={{
        //     backgroundColor: DefaultTheme.colors.surface,
        //     borderWidth: 2,
        //     borderColor: account.id == selectedAccount ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
        //     padding: 10,
        //     borderRadius: 10,
        //     marginTop: 10,
        //   }} onPress={() => switchAccount(account.id)}>
        //     <Text style={DefaultTheme.fonts.bodyMedium}>{account.firstName} {account.lastName}</Text>
        //     <Text style={DefaultTheme.fonts.labelMedium}>{account.accountType == "E" ? "Compte élève" : "Compte parent"}</Text>
        //     <View style={{
        //       position: 'absolute',
        //       right: 10,
        //       top: 10,
        //     }}>
        //       {account.id == selectedAccount && <CheckCircleIcon size={20} color={DefaultTheme.colors.primary}/>}
        //     </View>
        //   </PressableScale>
        // )),
      ]}
      specialTip={(
        <CustomInformationCard
          title={"Le saviez-vous ?"}
          description={"Vous pouvez changer de compte en laissant pressé le bouton profil sur la page d'accueil."}
          icon={<LightbulbIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
        />
      )}
    />
  );
}

export default SwitchAccountModal;
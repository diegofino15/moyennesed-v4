import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { CheckCircleIcon, CircleIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../components/CustomModal";
import CustomSectionButton from "../components/CustomSectionButton";
import CustomProfilePhoto from "../components/CustomProfilePhoto";
import CustomButton from "../components/CustomButton";
import { useAppContext } from "../../util/AppContext";
import AppData from "../../core/AppData";
import HapticsHandler from "../../core/HapticsHandler";


// Choose account page
function ChooseAccountPage({ navigation }) {
  // Show AppStack once logged-in
  const appContext = useAppContext();
  
  // Get connected accounts from local storage
  const [accounts, setAccounts] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(0);
  useEffect(() => {
    AsyncStorage.getItem("accounts").then(jsonAccounts => {
      setAccounts(JSON.parse(jsonAccounts));
    });
  }, []);

  // Confirm
  async function confirmSelection() {
    HapticsHandler.vibrate('light');
    await AppData.saveSelectedAccount(Object.keys(accounts)[selectedAccount]);
    navigation.popToTop();
    appContext.setIsLoggedIn(true);
  }

  return (
    <CustomModal
      title="Sélectionnez un compte"
      children={(
        <View>
          {/* Choose account */}
          <Text style={[DefaultTheme.fonts.labelMedium, { marginBottom: 10 }]}>Plusieurs comptes ont été détectés, choisissez lequel connecter.</Text>
          <Text style={[DefaultTheme.fonts.labelMedium, { marginBottom: 10 }]}>Vous pourrez changer de compte à tout moment dans les paramètres.</Text>
          
          {/* List connected accounts */}
          {Object.values(accounts).map((account, index) => <CustomSectionButton
            key={account.id}
            icon={account.accountType == "E" && <CustomProfilePhoto accountID={account.id} size={70}/>}
            title={`${account.firstName} ${account.lastName}`}
            description={account.accountType == "E" ? "Compte élève" : "Compte parent"}
            onPress={() => setSelectedAccount(index)}
            endIcon={(
              <View style={{
                position: 'absolute',
                right: 10,
                top: 10,
              }}>
                {index === selectedAccount ? (
                  <CheckCircleIcon size={20} color={DefaultTheme.colors.primary}/>
                ) : (
                  <CircleIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}
              </View>
            )}
            wrapperStyle={{ marginTop: 10 }}
            style={{
              borderColor: index === selectedAccount ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
            }}
          />)}

          {/* Confirm selection */}
          <CustomButton
            title={<Text style={DefaultTheme.fonts.bodyLarge}>Confirmer</Text>}
            onPress={confirmSelection}
            style={{ marginTop: 20 }}
          />
        </View>
      )}
    />
  );
}

export default ChooseAccountPage;
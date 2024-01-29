import { useEffect, useState } from "react";
import { View, Text, FlatList, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { CheckCircleIcon, CircleIcon, UserRoundIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ProfilePhoto from "../components/ProfilePhoto";
import AppData from "../../core/AppData";
import HapticsHandler from "../../core/HapticsHandler";
import { useAppContext } from "../../util/AppContext";


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
    <View>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#395D6F',
        padding: 10,
      }}>
        <PressableScale style={{
          backgroundColor: DefaultTheme.colors.surface,
          opacity: 0.6,
          padding: 5,
          borderRadius: 10,
          marginRight: 10,
        }}>
          <UserRoundIcon size={30} color={DefaultTheme.colors.onPrimary}/>
        </PressableScale>

        <Text style={[DefaultTheme.fonts.titleSmall, { fontSize: 17 }]}>Sélectionnez un compte</Text>
        
        <View style={{ width: 40 }}/>
      </View>
      
      {/* Choose account */}
      <View style={{
        backgroundColor: DefaultTheme.colors.backdrop,
        padding: 20,
        height: '100%',
      }}>
        <Text style={[DefaultTheme.fonts.labelMedium, { marginBottom: 10 }]}>Plusieurs comptes ont été détectés, choisissez lequel connecter.</Text>
        <Text style={[DefaultTheme.fonts.labelMedium, { marginBottom: 10 }]}>Vous pourrez changer de compte à tout moment dans les paramètres.</Text>
        
        {/* List connected accounts */}
        <FlatList data={Object.values(accounts)} renderItem={({ item, index }) => (
          <View style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            {item.accountType == "E" && (
              <ProfilePhoto accountID={item.id} size={70} style={{
                marginRight: 10,
              }}/> 
            )}
            <PressableScale style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: DefaultTheme.colors.surface,
              borderWidth: 2,
              borderColor: index === selectedAccount ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
              borderRadius: 10,
              flexDirection: 'column',
              height: 70,
              width: item.accountType == "P" ? '100%' : (Dimensions.get('window').width - 120),
            }} onPress={() => setSelectedAccount(index)}>
              <Text style={DefaultTheme.fonts.bodyLarge}>{item.firstName} {item.lastName}</Text>
              <Text style={DefaultTheme.fonts.labelMedium}>{item.accountType == "E" ? "Compte élève" : "Compte parent"}</Text>
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
            </PressableScale>
          </View>
        )} style={{
          maxHeight: 280
        }}/>

        {/* Confirm selection */}
        <PressableScale style={{
          padding: 15,
          borderRadius: 15,
          backgroundColor: DefaultTheme.colors.primary,
          alignItems: 'center',
          height: 55,
          marginTop: 20,
        }} onPress={confirmSelection}>
          <Text style={[DefaultTheme.fonts.bodyLarge, { marginLeft: 10, color: DefaultTheme.colors.onPrimary }]}>Confirmer</Text>
        </PressableScale>
      </View>
    </View>
  );
}

export default ChooseAccountPage;
import { useEffect } from "react";
import { View, Text, SafeAreaView, Dimensions, ScrollView, RefreshControl, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import EmbeddedMarksPage from "./EmbeddedMarksPage";
import WelcomeMessage from "./WelcomeMessage";
import CustomChooser from "../../components/CustomChooser";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import HapticsHandler from "../../../core/HapticsHandler";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// Main page
function MainPage({ route, navigation }) {
  const { theme } = useGlobalAppContext();
  const { mainAccount, updateMainAccount } = useCurrentAccountContext();

  // Connected main account (parent / student)
  const { newAccountID } = route.params; 
  useEffect(() => { updateMainAccount(); }, [newAccountID])

  // Switch account
  const [availableAccounts, setAvailableAccounts] = useState([]);
  useEffect(() => { AsyncStorage.getItem("accounts").then(jsonAccounts => {
    if (!jsonAccounts) { return; }
    if (Object.keys(JSON.parse(jsonAccounts)).length > 1) {
      let accounts = JSON.parse(jsonAccounts);
      delete accounts[mainAccount.id];
      setAvailableAccounts(Object.values(accounts));
    }
  }); }, [mainAccount.id]);
  async function switchAccount(newAccountID) {
    await AsyncStorage.setItem("selectedAccount", `${newAccountID}`);
    navigation.navigate("MainPage", { newAccountID: newAccountID });
    console.log(`Switched to account ${newAccountID} !`);
    HapticsHandler.vibrate("light");
  }

  // Manual refresh
  const [manualRefreshing, setManualRefreshing] = useState(false);
  
  return (
    <ScrollView
      bounces={true}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{
        height: '100%',
        backgroundColor: theme.colors.background,
        paddingTop: Platform.select({ ios: 0, android: 20 }),
      }}
      refreshControl={
        <RefreshControl refreshing={manualRefreshing} onRefresh={() => {
          setManualRefreshing(true);
          HapticsHandler.vibrate("light");
        }} tintColor={theme.colors.onBackground}/>
      }
    >
      <SafeAreaView>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          marginHorizontal: 20,
        }}>
          <View style={{ flexDirection: 'column', width: Dimensions.get('window').width - 120 }}>
            <Text style={[theme.fonts.titleLarge, { fontSize: 22, height: 30 }]} numberOfLines={1}>Bonjour {mainAccount.firstName} !</Text>
            {mainAccount.id ? <WelcomeMessage/> : null}
          </View>

          <CustomChooser
            title={"Basculer de compte"}
            items={availableAccounts.map(account => { return {
              id: account.id,
              title: `${account.firstName} ${account.lastName}`,
            }})}
            defaultItem={(
              <CustomProfilePhoto
                accountID={mainAccount.id}
                size={70}
                onPress={() => navigation.navigate("SettingsStack")}
                hasOtherPressAction={availableAccounts.length >= 1}
              />
            )}
            selected={mainAccount.id}
            setSelected={switchAccount}
            longPress
          />
        </View>

        {/* Marks overview */}
        <EmbeddedMarksPage navigation={navigation}/>
      </SafeAreaView>
    </ScrollView>
  );
}

export default MainPage;
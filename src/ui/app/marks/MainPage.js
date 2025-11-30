import { useEffect } from "react";
import { View, Text, Dimensions, ScrollView, RefreshControl, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useState from "react-usestateref";

import EmbeddedMarksPage from "./EmbeddedMarksPage";
import WelcomeMessage from "./WelcomeMessage";
import CustomChooser from "../../components/CustomChooser";
import CustomProfilePhoto from "../../components/CustomProfilePhoto";
import HapticsHandler from "../../../core/HapticsHandler";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";
import AccountHandler from "../../../core/AccountHandler";
import StorageHandler from "../../../core/StorageHandler";


// Main page
function MainPage({ route, navigation }) {
  const { theme } = useGlobalAppContext();
  const { mainAccount, updateMainAccount, manualRefreshing, setManualRefreshing } = useCurrentAccountContext();

  // Connected main account (parent / student)
  const { newAccountID } = route.params; 
  useEffect(() => { updateMainAccount(); }, [newAccountID])

  // Switch account
  const [isSwitchingAccounts, setIsSwitchingAccounts] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  useEffect(() => { StorageHandler.getData("accounts").then(accounts => {
    if (!accounts) { return; }
    if (Object.keys(accounts).length > 1) {
      delete accounts[mainAccount.id];
      setAvailableAccounts(Object.values(accounts));
    }
  }); }, [mainAccount.id]);
  async function switchAccount(newAccountID) {
    setIsSwitchingAccounts(true);
    await StorageHandler.saveData("selectedAccount", `${newAccountID}`);
    await AccountHandler.refreshToken(mainAccount.id, newAccountID);
    navigation.navigate("MainPage", { newAccountID: newAccountID });
    console.log(`Switched to account ${newAccountID} !`);
    HapticsHandler.vibrate("light");
    setIsSwitchingAccounts(false);
  }

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
      <SafeAreaView edges={{top: "off"}}>
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
            defaultItem={!isSwitchingAccounts ? (
              <CustomProfilePhoto
                accountID={mainAccount.id}
                size={70}
                onPress={() => navigation.navigate("SettingsStack")}
                hasOtherPressAction={availableAccounts.length >= 1}
              />
            ) : (
              <ActivityIndicator size={70}/>
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
import { memo, useEffect } from "react";
import { View, Text, SafeAreaView, Dimensions, ScrollView, RefreshControl } from "react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import EmbeddedMarksPage from "./Marks/EmbeddedMarksPage";
import WelcomeMessage from "./WelcomeMessage";
import ProfilePhoto from "../../components/ProfilePhoto";
import { OSvalue } from "../../../util/Utils";
import HapticsHandler from "../../../core/HapticsHandler";
import AppData from "../../../core/AppData";


// Main page
function MainPage({ isConnected, isConnecting, route, navigation }) {
  // Connected main account (parent / student)
  const [currentAccount, setCurrentAccount] = useState({ "accountType": "E" });
  useEffect(() => { AppData.getMainAccount().then(account => { if (account) { setCurrentAccount(account); } }); }, [route.params?.newAccountID]);

  // Manual refresh
  const [manualRefreshing, setManualRefreshing] = useState(false);
  
  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.background,
    }}>
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0B0A0C',
          paddingHorizontal: 20,
          marginTop: OSvalue({ iosValue: 0, androidValue: 20 }),
        }}
        refreshControl={
          <RefreshControl refreshing={manualRefreshing} onRefresh={() => {
            setManualRefreshing(true);
            HapticsHandler.vibrate("light");
          }} tintColor={DefaultTheme.colors.onBackground}/>
        }
      >
        <SafeAreaView>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'column', width: Dimensions.get('window').width - 120 }}>
              <Text style={[DefaultTheme.fonts.titleLarge, { fontSize: 22, height: 30 }]} numberOfLines={1}>Bonjour {currentAccount.firstName} !</Text>
              {currentAccount.id && <WelcomeMessage currentAccount={currentAccount}/>}
            </View>
            <ProfilePhoto accountID={currentAccount.id} size={70} onPress={() => navigation.navigate("SettingsStack")}/>
          </View>

          {/* Marks overview */}
          <EmbeddedMarksPage
            mainAccount={currentAccount}
            isConnected={isConnected}
            isConnecting={isConnecting}
            manualRefreshing={manualRefreshing}
            setManualRefreshing={setManualRefreshing}
            navigation={navigation}
          />
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

export default memo(MainPage);
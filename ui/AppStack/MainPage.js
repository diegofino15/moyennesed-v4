import { useEffect } from "react";
import { View, Text, SafeAreaView, Dimensions, ScrollView, RefreshControl } from "react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import EmbeddedMarksPage from "./Marks/EmbeddedMarksPage";
import WelcomeMessage from "../components/WelcomeMessage";
import ProfilePhoto from "../components/ProfilePhoto";
import HapticsHandler from "../../core/HapticsHandler";
import AppData from "../../core/AppData";



// Main page
function MainPage({ navigation }) {
  // Only for profile photo
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Connected main account (parent / student)
  const [account, setAccount] = useState({ "accountType": "E" });
  useEffect(() => {
    async function setup() {
      setSelectedAccount(await AppData.getSelectedAccount());
      setAccount(await AppData.getMainAccount());
    }
    setup();
  }, []);

  // Manual refresh
  const [manualRefreshing, setManualRefreshing] = useState(false);
  
  return (
    <ScrollView
      bounces={true}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0B0A0C',
        paddingHorizontal: 20,
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
            <Text style={[DefaultTheme.fonts.titleLarge, { fontSize: 22 }]}>Bonjour {account.firstName} !</Text>
            <WelcomeMessage />
          </View>
          <ProfilePhoto accountID={selectedAccount} size={70} onPress={() => navigation.navigate("ProfileStack")}/>
        </View>

        {/* Marks overview */}
        <EmbeddedMarksPage
          mainAccount={account}
          manualRefreshing={manualRefreshing}
          setManualRefreshing={setManualRefreshing}
          navigation={navigation}
        />

      </SafeAreaView>
    </ScrollView>
  );
}

export default MainPage;
import { useEffect } from "react";
import { View, Text, SafeAreaView, Dimensions, ScrollView } from "react-native";
import { DefaultTheme } from "react-native-paper";
import useState from "react-usestateref";

import WelcomeMessage from "../components/WelcomeMessage";
import ProfilePhoto from "../components/ProfilePhoto";
import AppData from "../../core/AppData";
import EmbeddedMarksPage from "./Marks/EmbeddedMarksPage";


// Main page
function MainPage({ navigation }) {
  // Connected account
  const [selectedAccount, setSelectedAccount, selectedAccountRef] = useState(null);
  const [account, setAccount] = useState({});
  useEffect(() => {
    async function setup() {
      setSelectedAccount(await AppData.getSelectedAccount());
      setAccount(await AppData.getMainAccount());
      AppData.getMarks(selectedAccountRef.current);
    }
    setup();
  }, []);
  
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
    }}>
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
          <ProfilePhoto accountID={selectedAccount} size={70} onPress={() => navigation.navigate("ProfilePage")}/>
        </View>

        {/* Marks overview */}
        <EmbeddedMarksPage/>

      </SafeAreaView>
    </ScrollView>
  );
}

export default MainPage;
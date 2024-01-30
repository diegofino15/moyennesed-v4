import { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { AlertTriangleIcon, CornerDownRightIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import SectionButton from "../../components/SectionButton";
import ProfilePhoto from "../../components/ProfilePhoto";
import CustomInformationCard from "../../components/CustomInformationCard";
import { useAppContext } from "../../../util/AppContext";
import AppData from "../../../core/AppData";
import CustomModal from "../../components/CustomModal";


// Profile page
function ProfilePage({ navigation }) {
  // Show AppStack once logged-in
  const appContext = useAppContext();

  // Disconnect
  async function disconnect() {
    await AsyncStorage.multiRemove([
      "credentials",
      "selectedAccount",
      "photos",
      "marks",
    ]);
    navigation.pop();
    appContext.setIsLoggedIn(false);
  }

  // Get main account
  const [mainAccount, setMainAccount] = useState({});
  useEffect(() => {
    async function setup() {
      setMainAccount(await AppData.getMainAccount());
    }
    setup();
  }, []);

  return (
    <CustomModal
      title="Paramètres"
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          {/* Profile */}
          <SectionButton
            showBigIcon
            icon={<ProfilePhoto accountID={mainAccount.id} size={70}/>}
            title={`${mainAccount.firstName} ${mainAccount.lastName}`}
            description="Paramètres du profil"
            onPress={() => navigation.navigate("ProfileSettingsPage", { isModal: false })}
            style={{ marginBottom: 10 }}
          />

          {/* Show children accounts for parent accounts */}
          {mainAccount.accountType == "P" && Object.keys(mainAccount.children).map(childID => {
            const child = mainAccount.children[childID];
            return (
              <View key={childID} style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <CornerDownRightIcon size={30} color={DefaultTheme.colors.onSurfaceDisabled}/>
                <ProfilePhoto accountID={childID} size={55} style={{ marginLeft: 10 }}/>
                <View style={{
                  borderWidth: 2,
                  borderColor: DefaultTheme.colors.surfaceOutline,
                  backgroundColor: DefaultTheme.colors.surface,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginLeft: 10,
                  width: Dimensions.get('window').width - 145,
                  height: 55,
                }}>
                  <Text style={[DefaultTheme.fonts.bodyMedium, { height: 20 }]} numberOfLines={1}>{child.firstName} {child.lastName}</Text>
                  <Text style={DefaultTheme.fonts.labelMedium}>{child.grade}</Text>
                </View>
              </View>
            );
          })}
          
          {/* Temporary */}
          <CustomInformationCard
            title="Se déconnecter"
            description="Cela effacera toutes vos préférences, vous devrez vous reconnecter."
            error={true}
            icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
            onPress={disconnect}
            style={{ marginTop: 10 }}
          />
        </View>
      )}
    />
  );
}

export default ProfilePage;
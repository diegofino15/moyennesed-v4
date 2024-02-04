import { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { CornerDownRightIcon } from "lucide-react-native";
import useState from "react-usestateref";

import CustomModal from "../../components/CustomModal";
import SectionButton from "../../components/SectionButton";
import ProfilePhoto from "../../components/ProfilePhoto";
import AppData from "../../../core/AppData";


// Profile page
function SettingsPage({ navigation }) {
  // Currently selected account
  const [currentAccount, setCurrentAccount] = useState({});
  useEffect(() => { AppData.getMainAccount().then(account => { setCurrentAccount(account); }); }, []);

  return (
    <CustomModal
      title="Paramètres"
      goBackFunction={() => navigation.pop()}
      children={(
        <View>
          {/* Profile */}
          <SectionButton
            showBigIcon={currentAccount.accountType == "E"}
            icon={currentAccount.accountType == "E" && <ProfilePhoto accountID={currentAccount.id} size={70}/>}
            title={`${currentAccount.firstName} ${currentAccount.lastName}`}
            description="Paramètres du profil"
            onPress={() => navigation.navigate("ProfilePage", { isModal: false, currentAccount: currentAccount })}
            style={{ marginBottom: 10 }}
          />

          {/* Show children accounts for parent accounts */}
          {currentAccount.accountType == "P" && Object.keys(currentAccount.children).map(childID => {
            const child = currentAccount.children[childID];
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
        </View>
      )}
    />
  );
}

export default SettingsPage;
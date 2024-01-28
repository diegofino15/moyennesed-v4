import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomInformationCard from "../components/CustomInformationCard";
import { useAppContext } from "../../util/AppContext";
import { AlertTriangleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";


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

  return (
    <View style={{
      padding: 20,
    }}>
      <CustomInformationCard
        title="Se déconnecter"
        description="Cela effacera toutes vos préférences, vous devrez vous reconnecter."
        error={true}
        icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
        onPress={disconnect}
      />
    </View>
  );
}

export default ProfilePage;
import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { ChevronRightIcon } from "lucide-react-native";

import CustomConfirmModal from "../../../components/CustomConfirmModal";


// Disconnect modal
function DisconnectModal({ isDisconnecting, setIsDisconnecting, disconnect }) {
  return (
    <CustomConfirmModal
      visible={isDisconnecting}
      exitModal={() => setIsDisconnecting(false)}
      children={[
        (<View key={1} style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.error,
          padding: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={DefaultTheme.fonts.titleSmall}>Voulez-vous vraiment vous déconnecter ?</Text>
          <Text style={DefaultTheme.fonts.labelMedium}>Toutes vos données seront effacées, vous devrez vous reconnecter.</Text>
        </View>),
        (<PressableScale key={2} onPress={disconnect} style={{
          backgroundColor: DefaultTheme.colors.error,
          padding: 10,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}>
          <View style={{ width: 30 }}/>
          <Text style={[DefaultTheme.fonts.labelMedium, { color: 'white', height: 23 }]}>Déconnexion</Text>
          <ChevronRightIcon size={30} color={'white'}/>
        </PressableScale>)
      ]}
    />
  );
}

export default DisconnectModal;